/* Daily reflection push server.
 *
 * Sends one payload-less Web Push per subscription per day, at the local time
 * the user picked. Payload-less is deliberate: our notification text is fixed,
 * so the service worker can hardcode it, and we skip RFC 8291 payload
 * encryption entirely. All that remains is a VAPID JWT - far less to break.
 *
 * Secrets (wrangler secret put):
 *   VAPID_JWK      - the private key as a JWK JSON string
 *   VAPID_PUBLIC   - base64url uncompressed public point (also embedded in the client)
 *   VAPID_SUBJECT  - "mailto:you@example.com"
 *   AI_KEY         - Anthropic API key, only needed for /parse
 * Binding:
 *   SUBS           - KV namespace holding subscriptions
 */

const TTL = 86400;              // let the push service hold it for a day
const LATE_WINDOW_MIN = 120;    // don't deliver a reminder more than 2h late

const STEPS_DAYS = 14;                  // days of step counts kept per token
const STEPS_TTL = 60 * 60 * 24 * 120;   // and how long an idle token survives

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

/* ── helpers ── */

const enc = (s) => new TextEncoder().encode(s);

function b64url(bytes) {
  let s = '';
  const b = new Uint8Array(bytes);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Stable key for a subscription - endpoints are long and contain characters KV dislikes.
async function subKey(endpoint) {
  const h = await crypto.subtle.digest('SHA-256', enc(endpoint));
  return 'sub:' + b64url(h).slice(0, 32);
}

// Local wall-clock date + HH:MM in an IANA timezone.
function localNow(tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const p = {};
  for (const x of parts) p[x.type] = x.value;
  return { date: `${p.year}-${p.month}-${p.day}`, hhmm: `${p.hour}:${p.minute}` };
}

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/* ── VAPID ── */

async function signJWT(aud, env) {
  const jwk = JSON.parse(env.VAPID_JWK);
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, d: jwk.d, ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const header = { typ: 'JWT', alg: 'ES256' };
  const body = { aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT };
  const signed = b64url(enc(JSON.stringify(header))) + '.' + b64url(enc(JSON.stringify(body)));
  // WebCrypto ECDSA already returns raw r||s, which is exactly the JWS ES256 format.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc(signed));
  return signed + '.' + b64url(sig);
}

async function sendPush(endpoint, env) {
  const jwt = await signJWT(new URL(endpoint).origin, env);
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC}`,
      TTL: String(TTL),
      'Content-Length': '0',
    },
  });
}

/* ── HTTP ── */

/* The AI branch has its own budget, because /off's cap was sized for a free
   upstream. 400 a day is right for asking Open Food Facts twice; it is not
   right for a model call, and /parse - the same kind of spending on the same
   key - is capped at 60. Typing and backspacing over a Chinese word fires
   this repeatedly, so it is counted separately from the searches. */
async function aiSpend(env, ip, day) {
  const cap = Number(env.OFF_AI_DAILY_CAP || 60);
  const key = 'oa:' + day + ':' + ip;
  const used = Number((await env.SUBS.get(key)) || 0);
  if (used >= cap) return false;
  await env.SUBS.put(key, String(used + 1), { expirationTtl: 172800 });
  return true;
}
/* What a packet of this would say, in Latin letters.

   Open Food Facts indexes what is printed on the packaging, and packaging
   in Japan says Natto and in Israel says Cottage. So the question is not
   "translate this" but "what would the label say", which is a different and
   more answerable one - and it is why the country is passed in.

   One short answer, no punctuation, and an empty string when the model is
   unsure: a wrong search term returns wrong products with real numbers on
   them, which is worse than returning nothing. */
async function latinTerm(q, tag, env) {
  /* With no country chosen the question loses its "in France" and becomes
     the international name instead. Interpolating an empty string would
     have asked what a packet says "on a shelf in ", which is not a
     question. */
  const where = tag ? 'in ' + tag.slice(3).replace(/-/g, ' ') : 'internationally';
  const SYSTEM =
    'You turn a food a person typed into the words a PACKET of it would\n' +
    'carry on a shelf ' + where + ', written in Latin letters.\n' +
    '\n' +
    '- Reply with the search words alone. No explanation, no punctuation, no\n' +
    '  quotes. Two or three words at most.\n' +
    '- Use the name the product is SOLD under, not a description: natto, not\n' +
    '  fermented soybeans; cottage, not white cheese in grains.\n' +
    '- If you are not confident what it is, reply with nothing at all. A\n' +
    '  wrong guess returns real numbers for the wrong food, which is worse\n' +
    '  than returning none.';
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.AI_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 24,
        temperature: 0,
        system: SYSTEM,
        messages: [{ role: 'user', content: q }],
      }),
    });
  } catch {
    return '';
  }
  if (!r.ok) return '';
  let d;
  try { d = await r.json(); } catch { return ''; }
  const text = ((d && d.content) || []).map((c) => c.text || '').join('').trim();
  /* Accents FOLD, they do not get deleted. The country is in the prompt
     precisely so the answer is what a French or Spanish packet says, and
     those packets carry accents - stripping the character outright turned
     "creme fraiche" into "cr me fra che", which searches for three words
     that are not words and returns rubbish. Rubbish is worse than nothing
     here: it comes back with real numbers attached to the wrong food.

     Same fold the client's foodKey uses, and only U+0300-U+036F, the Latin
     combining block. THEN the whitelist, which is what keeps a colon or a
     quote - the two characters needed to forge an Open Food Facts field
     filter - out of the URL. */
  const folded = text.normalize('NFD').replace(/[\u0300-\u036F]/g, '');
  const clean = folded.replace(/[^A-Za-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
  return clean.length >= 2 ? clean : '';
}
/* The app tells us which language it is showing. Guessing from the text
   cannot work - "pasta" is four languages and a photograph is none - and the
   app has known the answer since it grew a language picker. */
const LANG_NAMES = {
  he: 'Hebrew', en: 'English', de: 'German', es: 'Spanish', fr: 'French',
  it: 'Italian', pt: 'Portuguese', ja: 'Japanese',
  'zh-Hans': 'Simplified Chinese', 'zh-Hant': 'Traditional Chinese', ar: 'Arabic',
};
function langName(code) {
  return LANG_NAMES[String(code || '').trim()] || 'English';
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === '/health') {
      // booleans only - never the values themselves
      // booleans only, never the values - enough to tell a missing key from a
      // broken one without publishing anything about either
      return json({ ok: true, configured: !!env.VAPID_JWK, ai: !!env.AI_KEY, time: new Date().toISOString() });
    }

    if (url.pathname === '/subscribe' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const sub = b && b.subscription;
      if (!sub || !sub.endpoint) return json({ error: 'missing subscription' }, 400);
      if (!/^\d{2}:\d{2}$/.test(b.time || '')) return json({ error: 'bad time' }, 400);

      const tz = b.tz || 'UTC';
      let now;
      try { now = localNow(tz); } catch { return json({ error: 'bad tz' }, 400); }

      const key = await subKey(sub.endpoint);
      const prev = await env.SUBS.get(key, 'json');
      const rec = {
        endpoint: sub.endpoint,
        time: b.time,
        tz,
        // Subscribing after today's time has passed starts tomorrow, matching the client.
        last: toMin(now.hhmm) >= toMin(b.time) ? now.date : (prev && prev.time === b.time ? prev.last : ''),
        updated: new Date().toISOString(),
      };
      await env.SUBS.put(key, JSON.stringify(rec));
      return json({ ok: true, time: rec.time, tz: rec.tz });
    }

    if (url.pathname === '/unsubscribe' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      if (!b.endpoint) return json({ error: 'missing endpoint' }, 400);
      await env.SUBS.delete(await subKey(b.endpoint));
      return json({ ok: true });
    }

    // Manual "send me one right now", for verifying the whole chain end to end.
    if (url.pathname === '/test' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      if (!b.endpoint) return json({ error: 'missing endpoint' }, 400);
      const res = await sendPush(b.endpoint, env);
      return json({ ok: res.ok, status: res.status, body: await res.text().catch(() => '') });
    }

    /* ── STEPS ──
       A drop box for step counts, so a phone shortcut can post the day's
       total in the background and the app can pick it up whenever it next
       opens. One KV key per token holds the last two weeks, which keeps a
       sync to a single read and a post to a read plus a write.

       The token is a bearer secret the app generates and shows on its setup
       screen: whoever holds it can write step counts for that one app
       install, and nothing else. Steps are all that is ever stored here. */
    if (url.pathname === '/steps') {
      if (req.method === 'POST') {
        let b;
        try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
        const token = String((b && b.token) || '');
        if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: 'bad token' }, 400);

        const v = Math.round(Number(b.steps));
        if (!Number.isFinite(v) || v < 0 || v > 300000) return json({ error: 'bad steps' }, 400);

        // A shortcut that does not bother sending the date means "today".
        const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '')
          ? b.date
          : new Date().toISOString().slice(0, 10);

        const key = 'st:' + token;
        const rec = (await env.SUBS.get(key, 'json')) || { days: {} };
        rec.days[date] = { v, at: new Date().toISOString() };

        // Two weeks is all the app ever asks for; drop the rest.
        const keep = Object.keys(rec.days).sort().slice(-STEPS_DAYS);
        const days = {};
        for (const d of keep) days[d] = rec.days[d];
        rec.days = days;

        await env.SUBS.put(key, JSON.stringify(rec), { expirationTtl: STEPS_TTL });
        return json({ ok: true, date, steps: v });
      }

      if (req.method === 'GET') {
        const token = url.searchParams.get('token') || '';
        if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: 'bad token' }, 400);
        const rec = (await env.SUBS.get('st:' + token, 'json')) || { days: {} };
        return json({ ok: true, days: rec.days });
      }
    }

    /* ── /parse ──────────────────────────────────────────────────────────
       Turns "אכלתי 2 ביצים ופרוסת לחם" into a list of {food, amount, unit}.

       The model splits the sentence and does nothing else. It is explicitly
       told not to return calories, and any it returns anyway are thrown away
       here. The numbers come from the app's own food tables, which is what
       makes them checkable and consistent: the same egg is the same egg in
       March and in September, and you can see which egg was chosen.

       That also keeps this cheap and keeps very little on the wire - a few
       words go out, a short list comes back, and no history, no profile and
       no preferences are sent at all.

       Secrets (wrangler secret put):
         AI_KEY  - an Anthropic API key
       Optional:
         PARSE_DAILY_CAP - requests per IP per day (default 60) */
    /* Open Food Facts search, proxied. A browser cannot call this: they allow
       CORS on the product lookup and on nothing else. We can, and we should -
       they ask callers to identify themselves, which a page cannot do either. */
    if (url.pathname === '/off' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      /* Their tag, already built by the app from an ISO code. Kept to the
         shape a tag can have so nothing else can be smuggled into the URL. */
      const tag = String((b && b.country) || '').trim().slice(0, 40);
      /* The released app has none of the client half of this - it ignores
         `via`, sets no alias, and drops every translated row into an array
         where nothing can surface it. Deploying this route alone would have
         bought it model calls for rows nobody can see. So the fallback is
         asked for, and the copy that cannot use it does not ask. */
      const wantVia = !!(b && b.via);
      if (q.length < 2) return json({ ok: true, rows: [] });
      /* Empty is the app's own default and means the whole shelf - Open
         Food Facts searches worldwide with the filter left off, and the
         filter narrows a search rather than enabling one. Anything else
         still has to be exactly a country tag: this is the check that keeps
         a colon or a quote out of a field filter that is interpolated
         straight into the query string. */
      if (tag && !/^en:[a-z-]+$/.test(tag)) return json({ ok: true, rows: [] });

      const cap = Number(env.OFF_DAILY_CAP || 400);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'of:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ ok: true, rows: [] });
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      /* NOT cgi/search.pl. That endpoint answers 503 from a server - shut,
         not throttled - and this route degrades silently, so it returned
         nothing at all rather than saying so. This one answers in half a
         second. The free text and the country filter combine inside q. */
      const hits = async (term) => {
        const q2 = tag ? term + ' countries_tags:"' + tag + '"' : term;
        const u = 'https://search.openfoodfacts.org/search?page_size=12&q=' +
          encodeURIComponent(q2);
        try {
          const r = await fetch(u, {
            headers: { 'User-Agent': 'BetterMe/0.1 (personal nutrition app)' },
          });
          if (!r.ok) return [];
          const jj = await r.json();
          return (jj && jj.hits) || [];
        } catch {
          return [];
        }
      };

      /* All four or nothing. Open Food Facts often carries energy without
         the macros, and a missing number defaulted to 0 would show "0 g
         carbohydrate" on a yogurt - a figure nobody measured, presented
         beside ones somebody did. */
      const num = (v) => (typeof v === 'number' && isFinite(v) ? Math.round(v * 10) / 10 : null);
      const usable = (found, isVia) => {
        /* `out`, not `rows`: the caller's array is also called rows, and a
           shadowed name is the bug class this repo keeps paying for. */
        const out = [];
        for (const p of found) {
          const n = p.nutriments || {};
          const k = n['energy-kcal_100g'];
          if (typeof k !== 'number' || !isFinite(k) || k < 0) continue;
          const pr = num(n.proteins_100g), ca = num(n.carbohydrates_100g), fa = num(n.fat_100g);
          if (pr === null || ca === null || fa === null) continue;
          /* The macros are the check on the energy. 4 kcal a gram for protein
             and carbohydrate, 9 for fat - the same arithmetic /estimate asks
             the model to respect. A natto claiming 0.21 kcal against macros
             implying 225 is not a measurement, and logging it would cost a
             person their day's count with nothing on screen to explain it.

             Low side only: energy far ABOVE the macros has an innocent cause
             this cannot see, since alcohol carries 7 kcal a gram and appears
             in no macro. And the row is rejected, not corrected - deriving the
             number would be inventing it. */
          const implied = pr * 4 + ca * 4 + fa * 9;
          if (implied >= 20 && k < implied * 0.5) continue;
          let name = String(p.product_name || p.product_name_en || '').trim();
          const brand = String(p.brands || '').split(',')[0].trim();
          if (brand) name = name ? name + ', ' + brand : brand;
          if (name.length < 2) continue;
          out.push({ id: 'off:' + p.code, n: name, k: Math.round(k), p: pr, c: ca, f: fa,
                     via: isVia ? 1 : 0 });
        }
        return out;
      };

      const rows = usable(await hits(q), false);
      let via = '';

      /* Not "the index cannot read this script" - it reads Japanese, Hebrew,
         Greek and Russian perfectly well (12, 12, 11 and 10 usable rows for
         納豆, לחם, γιαούρτι and молоко). What varies is COVERAGE: زبادي
         returns nothing at all and 酸奶 returns twelve hits of which one
         survives the all-four-macros rule above.

         Which is why this counts USABLE rows and not hits. A trigger reading
         the hit count would never fire on 酸奶 - the case that needs it most
         - and a trigger at exactly zero would leave that reader with a shelf
         of one. So it fires below a small floor.

         The Latin rows are ADDED to the native ones, never instead of them:
         what came back under the word the person actually typed is the
         better answer and keeps its place. */
      /* Inclusive. `< 3` fires at 0, 1 and 2 - and of the ten pairs measured,
         the one sitting exactly on the boundary is ヨーグルト at 3 usable
         rows against 10 for "yogurt". Excluding the thinnest real shelf in
         the sample would make the constant an accident. Everything else
         measured is at 0-1 or 10-12, so the gap is wide and 3 is safe. */
      const THIN = 3;
      /* A Latin WORD, not a Latin letter. A single one skipped "ヨーグルト
         500g" and "牛乳 1L" - a pack size is an ordinary thing to type, and
         those queries were losing the fallback at zero rows. Two letters
         together mean the index has a word to match on. */
      const hasLatinWord = /[a-z]{2,}/i.test(q);
      if (wantVia && rows.length <= THIN && !hasLatinWord && env.AI_KEY &&
          (await aiSpend(env, ip, day))) {
        via = await latinTerm(q, tag, env);
        if (via) {
          const seen = new Set(rows.map((r) => r.id));
          for (const r of usable(await hits(via), true)) {
            if (!seen.has(r.id)) { seen.add(r.id); rows.push(r); }
          }
        }
      }

      return json({ ok: true, rows, via });
    }

    if (url.pathname === '/parse' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'parsing is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const text = String((b && b.text) || '').trim().slice(0, 400);
      if (text.length < 2) return json({ error: 'nothing to read' }, 400);

      /* This endpoint spends money on someone else's key, so it is capped per
         IP per day. Not real protection - the app is public and so is the
         address - but it turns an open tap into a leak. */
      const cap = Number(env.PARSE_DAILY_CAP || 60);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'pq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const SYSTEM =
        'You split a description of a meal into its items. It may be written\n' +
        'in any language.\n' +
        'Reply with JSON only: {"items":[{"food":"","amount":1,"unit":""}]}\n' +
        '- food: the food alone, in the language it was written, no quantity words.\n' +
        '- amount: a number. If none is given use 1.\n' +
        '- unit: one of g, unit, slice, cup, tbsp, tsp. Use "unit" for whole things\n' +
        '  (an egg, an apple, a roll) and "g" only when grams are actually stated.\n' +
        '- Split "לחם עם גבינה" into two items. Keep "סלט יווני" as one.\n' +
        /* A brand split off into its own item is how "שייק חלבון של מולר" lost
           the word that identified it and came back as another company's
           powder - the app never had "מולר" to search with. */
        '- A brand belongs to the food it names. "שייק חלבון של מולר" is ONE item,\n' +
        '  food "שייק חלבון מולר". Never return a brand as an item of its own.\n' +
        /* "25 גרם" in that sentence is what the label advertises, not what was
           eaten. Reading it as a portion logs a quarter of a shake. */
        '- A number inside a product name is part of the name, not an amount:\n' +
        '  in "שייק חלבון 25 גרם של מולר" the 25 g is the protein the product\n' +
        '  advertises, so amount is 1 and unit is "unit". Use a number as the\n' +
        '  amount only when it says how much was actually eaten.\n' +
        '- Never return calories, protein, carbohydrate or fat. You do not know them.\n' +
        '- No prose, no markdown fence, JSON only.';

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
            temperature: 0,
            system: SYSTEM,
            messages: [{ role: 'user', content: text }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) return json({ error: 'the model refused', status: r.status }, 502);

      let out;
      try { out = await r.json(); } catch { return json({ error: 'bad reply' }, 502); }
      const raw = ((out.content || []).find((c) => c.type === 'text') || {}).text || '';

      // it is told to send JSON only, but a fence or a sentence around it is
      // the classic failure and is cheaper to survive than to argue about
      const m = raw.match(/\{[\s\S]*\}/);
      let parsed;
      try { parsed = JSON.parse(m ? m[0] : raw); } catch { return json({ error: 'unreadable', raw: raw.slice(0, 200) }, 502); }

      const UNITS = ['g', 'unit', 'slice', 'cup', 'tbsp', 'tsp'];
      const items = (Array.isArray(parsed.items) ? parsed.items : [])
        .map((it) => {
          const food = String((it && it.food) || '').replace(/\s+/g, ' ').trim().slice(0, 60);
          if (!food) return null;
          let amount = Number(it && it.amount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) amount = 1;
          const unit = UNITS.includes(it && it.unit) ? it.unit : 'unit';
          return { food, amount, unit };      // note: nutrition is deliberately absent
        })
        .filter(Boolean)
        .slice(0, 20);

      return json({ ok: true, items });
    }

    /* ── /match ──────────────────────────────────────────────────────────
       Which row of the app's own food tables a written food is, and how much
       one of them weighs.

       This is the half a keyword search cannot do, and the reason the
       nutrition area could not be trusted. "שייק חלבון של מולר" has to find a
       row filed as "יוגורט 25 גרם חלבון נטול לקטוז, מולר": the user says
       shake, the table says yogurt, and מולר, Muller and Müller are three
       different strings to a string comparison. No amount of tuning gets
       there. A model reads past all of it at once.

       The second half matters as much. 82% of the rows carry no serving size
       at all - none of the 3,623 ministry rows do - so a container was being
       assumed to be 100 g, which is how a 200 g pot of yogurt at 12.5 g
       protein per 100 g was logged as 12.5 g instead of 25. Nothing can fill
       that in from the tables, because the fact is not in them. Knowing that
       a pot of protein yogurt is 200 g is ordinary world knowledge.

       What this must never do is supply a nutrition value. It returns an
       INDEX into the list the app sent, and a weight in grams; every calorie
       and every gram of protein still comes from the app's own tables. That
       is structural rather than a promise in a prompt - there is no field in
       this reply that could carry a macro, so a hallucinated one has nowhere
       to go. The app also shows which row was chosen, so the choice stays
       checkable.

       Secrets: AI_KEY. Optional: MATCH_DAILY_CAP (default 200/IP/day). */
    if (url.pathname === '/match' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'matching is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      if (q.length < 2) return json({ error: 'nothing to match' }, 400);

      // the app sends its own candidate rows; anything else is not answerable
      const cands = (Array.isArray(b && b.cands) ? b.cands : [])
        .map((c) => String(c || '').replace(/\s+/g, ' ').trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 80);
      if (!cands.length) return json({ error: 'no candidates' }, 400);

      // how many rows to name back: one to log a food, a handful to search
      let want = Number(b && b.n);
      if (!Number.isInteger(want) || want < 1 || want > 8) want = 1;

      const cap = Number(env.MATCH_DAILY_CAP || 200);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'mq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const SYSTEM =
        'You match a written food to one row of a food table, and say what one\n' +
        'serving of it weighs. The written food may be in any language.\n' +
        'Reply with JSON only:\n' +
        '{"picks":[0,4],"grams":200,"sure":true,"terms":["",""]}\n' +
        '- picks: 0-based indexes of the rows that are this food, best first,\n' +
        '  at most the number asked for. [] if none of them is. Do not pad the\n' +
        '  list with near misses - two right answers beat five vague ones.\n' +
        /* The tables carry Hebrew and Latin names side by side and a written
           food arrives in whichever language the person thinks in. Matching
           across that is most of the value here and costs nothing extra. */
        '- The query and the rows may be in different languages or scripts.\n' +
        '  Match on what the food IS: "protein yogurt muller" and "יוגורט\n' +
        '  חלבון מולר" are the same request, and either should find a row\n' +
        '  written in either language.\n' +
        '- A row is the food even when it is filed under another word: a\n' +
        '  "שייק חלבון" sold as "יוגורט ... חלבון" is the same product.\n' +
        '- The brand must agree. מולר, Muller and Müller are one brand; Yoplait\n' +
        '  is not. If a brand is named and no row carries it, prefer -1 over a\n' +
        '  row from a different company.\n' +
        '- grams: for the FIRST pick, what ONE of the unit the user means\n' +
        '  weighs - a pot, a bottle,\n' +
        '  a slice, a scoop. Use the packaged size when the row names one\n' +
        '  ("350 מל" is 350). null if you genuinely do not know.\n' +
        '- sure: false if you are guessing at either field.\n' +
        /* The rows offered are whatever a string match could reach, so a query
           in another language arrives with a shortlist that never contained
           the answer. Naming the words the table itself would use lets the app
           go and look again with those - the one thing the model knows here
           that a string comparison cannot work out. */
        '- terms: 2-4 words, in the language and script the ROWS are written\n' +
        '  in, that would find this food in a plain text search of that table.\n' +
        '  For "protein yogurt muller" against Hebrew rows: ["יוגורט","חלבון",\n' +
        '  "מולר"]. Give these even when you also picked rows.\n' +
        '- Never return calories, protein, carbohydrate or fat. You do not know\n' +
        '  them and they are not wanted; the app has them already.\n' +
        '- No prose, no markdown fence, JSON only.';

      const list = cands.map((n, i) => i + '. ' + n).join('\n');
      const unitWord = String((b && b.unit) || 'unit').slice(0, 12);

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            temperature: 0,
            system: SYSTEM,
            messages: [{
              role: 'user',
              content: 'FOOD: ' + q + '\nUNIT THE USER MEANS: ' + unitWord +
                       '\nHOW MANY TO NAME: ' + want + '\nROWS:\n' + list,
            }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) return json({ error: 'the model refused', status: r.status }, 502);

      let out;
      try { out = await r.json(); } catch { return json({ error: 'bad reply' }, 502); }
      const raw = ((out.content || []).find((c) => c.type === 'text') || {}).text || '';
      const m = raw.match(/\{[\s\S]*\}/);
      let parsed;
      try { parsed = JSON.parse(m ? m[0] : raw); } catch { return json({ error: 'unreadable' }, 502); }

      /* Range checks, not a formality: an index outside the list would read a
         row that was never sent, and a silly weight is the difference between
         a meal and a week of them. */
      const seen = new Set();
      const picks = (Array.isArray(parsed && parsed.picks) ? parsed.picks : [parsed && parsed.pick])
        .map((x) => Number(x))
        .filter((x) => Number.isInteger(x) && x >= 0 && x < cands.length)
        .filter((x) => (seen.has(x) ? false : (seen.add(x), true)))
        .slice(0, want);
      const pick = picks.length ? picks[0] : -1;

      let grams = Number(parsed && parsed.grams);
      if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) grams = null;

      const terms = (Array.isArray(parsed && parsed.terms) ? parsed.terms : [])
        .map((t) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, 40))
        .filter(Boolean)
        .slice(0, 4);

      // note: no nutrition field exists in this reply, by design
      return json({ ok: true, pick, picks, grams, terms, sure: parsed && parsed.sure !== false });
    }

    /* ── /ask ────────────────────────────────────────────────────────────
       A question about your own eating, answered from your own records.

       The loop does NOT run here. This endpoint is one turn of it: the app
       sends the conversation so far, the model either answers or asks for
       something, and the app goes and gets it. That is deliberate rather
       than convenient - the food log lives on the phone, and doing it this
       way means it stays there. Nothing is sent except the specific figures
       the model asked for, one question at a time, and this worker keeps
       none of it.

       The same rule as everywhere else in the nutrition area applies and is
       worth restating because it is the whole basis for trusting an answer:
       the model may not produce a nutrition number of its own. Every figure
       it says has to have come back from a tool, which means out of the
       app's own tables and the user's own log. Asked something the tools
       cannot answer, it says so - that is a better outcome than a confident
       average invented on the spot, which is exactly what this feature would
       otherwise be very good at producing.

       Secrets: AI_KEY. Optional: ASK_DAILY_CAP (default 120/IP/day). */
    if (url.pathname === '/ask' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'asking is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const messages = Array.isArray(b && b.messages) ? b.messages : [];
      if (!messages.length) return json({ error: 'nothing to ask' }, 400);
      if (messages.length > 24) return json({ error: 'too long' }, 400);
      // one turn is small; a large body here is not a question, it is misuse
      if (JSON.stringify(messages).length > 60000) return json({ error: 'too long' }, 400);

      const cap = Number(env.ASK_DAILY_CAP || 120);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'aq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      /* The tools are defined here rather than accepted from the client, so
         this cannot be driven as a general purpose model endpoint. */
      const TOOLS = [
        {
          name: 'get_day',
          description:
            "One day of the user's own food log: what they ate, and the totals " +
            'for energy, protein, carbohydrate, fat and water. Use this for any ' +
            'question about a particular day, including today.',
          input_schema: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'YYYY-MM-DD, or "today" / "yesterday".' },
            },
            required: ['date'],
          },
        },
        {
          name: 'get_range',
          description:
            'Daily totals across a span of dates, for questions about a week, a ' +
            'month, an average or a trend. Returns one row per day.',
          input_schema: {
            type: 'object',
            properties: {
              from: { type: 'string', description: 'YYYY-MM-DD' },
              to: { type: 'string', description: 'YYYY-MM-DD' },
            },
            required: ['from', 'to'],
          },
        },
        {
          name: 'get_targets',
          description:
            "The user's own daily goals for energy, protein, carbohydrate, fat " +
            'and water. Needed for anything phrased as how much is left, whether ' +
            'they are on track, or how much more they should eat.',
          input_schema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'search_food',
          description:
            'Look a food up in the app tables. Returns rows with energy and ' +
            'macros per 100g, and a serving weight where one is known. Use it ' +
            'for anything about a food the user has not eaten yet.',
          input_schema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
          },
        },
      ];

      const SYSTEM =
        "You answer questions about the user's own nutrition. Write everything\n" +
        'in ' + langName(b && b.lang) + ', which is the language the app is\n' +
        'showing. Do not switch out of it because a food name in the data is\n' +
        'written in another script.\n' +
        '\n' +
        'THE ONE RULE: every number you state must have come back from a tool in\n' +
        'this conversation. You do not know how much protein is in anything and you\n' +
        'do not know what they ate - the tools do. Never estimate a calorie or a\n' +
        'macro from your own knowledge, never round a figure into a nicer one, and\n' +
        'never fill a gap with what is typical. If the tools cannot answer, say\n' +
        'plainly what is missing.\n' +
        '\n' +
        'Look things up before answering. A question about today needs get_day; one\n' +
        'about what is left needs get_targets as well; one about a week needs\n' +
        'get_range. Call several if several are needed, and call search_food for a\n' +
        'food they are asking about rather than one they ate.\n' +
        '\n' +
        'Then answer the question that was asked and stop. Give the number first,\n' +
        'in a sentence, with the figures it came from. No preamble, no restating\n' +
        'the question, no lecture about nutrition, no advice that was not asked\n' +
        'for. Two or three sentences is almost always right. Do not recommend\n' +
        'changes to how they eat unless they asked what to do.\n' +
        'Never give medical advice; for anything clinical say it is a question for\n' +
        'a dietitian or a doctor.';

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 900,
            temperature: 0,
            system: SYSTEM,
            tools: TOOLS,
            messages,
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) {
        let detail = '';
        try { detail = (await r.text()).slice(0, 200); } catch {}
        return json({ error: 'the model refused', status: r.status, detail }, 502);
      }

      let out;
      try { out = await r.json(); } catch { return json({ error: 'bad reply' }, 502); }

      /* The content array goes back untouched: the app has to append it to the
         conversation verbatim, tool_use blocks and all, or the next turn is
         not a valid exchange. */
      return json({
        ok: true,
        stop_reason: out.stop_reason || '',
        content: Array.isArray(out.content) ? out.content : [],
      });
    }

    /* ── /estimate ───────────────────────────────────────────────────────
       Nutrition values for a food the tables do not have.

       Everything else in this area is built on the model not being allowed
       to produce a nutrition number. This is the deliberate exception, and
       it exists because the alternative is worse: a plate of shawarma, a
       dish at a friend's house, half the things anyone actually eats are not
       in a national food table, and a day's log that silently omits them is
       not more accurate than one containing an estimate - it is just wrong
       in a way nobody can see.

       So the estimate is allowed, and the entire job of this endpoint is to
       make sure it never afterwards looks like a measurement. It returns
       what it assumed, in words, and how sure it is; the app stores the
       values with a flag and shows them differently everywhere they appear.
       An estimate you can see is an estimate you can correct.

       It is asked for a range as well as a figure, because the width of the
       range is the honest part - "a pita with shawarma" is 600-900 kcal
       depending on the shop, and a model that answers 743 is not more
       accurate than one that says 600-900, only more convincing.

       Secrets: AI_KEY. Optional: EST_DAILY_CAP (default 120/IP/day). */
    if (url.pathname === '/estimate' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'estimating is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const food = String((b && b.food) || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      if (food.length < 2) return json({ error: 'nothing to estimate' }, 400);

      const cap = Number(env.EST_DAILY_CAP || 120);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'eq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const SYSTEM =
        'You give nutrition values for a described food, for a food-logging app.\n' +
        'Any language in, JSON only out:\n' +
        '{"per100":{"kcal":0,"p":0,"c":0,"f":0},"serving_g":0,"kcal_low":0,\n' +
        ' "kcal_high":0,"confidence":"high|medium|low","assumed":"","ok":true}\n' +
        '\n' +
        '- per100: energy in kcal and protein/carbohydrate/fat in grams, per 100g\n' +
        '  of the food AS EATEN - cooked if it is eaten cooked, dressed if it is\n' +
        '  served dressed.\n' +
        '- serving_g: what one normal portion of it weighs, in grams. If the user\n' +
        '  named a size ("a large one", "250ml"), use that.\n' +
        '- kcal_low / kcal_high: an honest range for ONE SERVING, not for 100g.\n' +
        '  A pita with shawarma is 600-900 depending on the shop. Do not narrow a\n' +
        '  range to look confident - the width is the useful part.\n' +
        '- assumed: one short sentence, in the language they wrote in, naming what\n' +
        '  you took the food to be and the portion you assumed. This is shown to\n' +
        '  the user and is how they know what to correct.\n' +
        '- confidence: high for a plain single ingredient, low for a described\n' +
        '  dish that varies a lot or a brand you do not know.\n' +
        '- Keep the four macros roughly consistent with the energy: protein and\n' +
        '  carbohydrate are about 4 kcal per gram, fat about 9.\n' +
        '- If it is too vague to estimate at all - "food", "something nice" - set\n' +
        '  ok:false and say why in assumed. Do not guess at nothing.\n' +
        '- Never invent a specific brand\u2019s published figures. If a brand is named\n' +
        '  and you do not know it, estimate the generic food and say so in assumed.\n' +
        /* It named a city for a restaurant it was asked about, and named the
           wrong one. The assumed line exists to say what food and what portion
           were taken - anything else in it is a confident detail the user has
           no reason to doubt and no way to check. */
        '- In assumed, describe only the food and the portion. Do not state\n' +
        '  facts about a named restaurant, shop or brand - not its location, not\n' +
        '  its recipe, not its portion size - unless the user told you.\n' +
        '- Write assumed entirely in ' + langName(b && b.lang) + ', the language\n' +
        '  the app is showing. No stray words or characters from another\n' +
        '  script.\n' +
        '- No prose, no markdown fence, JSON only.';

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            temperature: 0,
            system: SYSTEM,
            messages: [{ role: 'user', content: food }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) return json({ error: 'the model refused', status: r.status }, 502);

      let out;
      try { out = await r.json(); } catch { return json({ error: 'bad reply' }, 502); }
      const rawTxt = ((out.content || []).find((c) => c.type === 'text') || {}).text || '';
      const m = rawTxt.match(/\{[\s\S]*\}/);
      let p;
      try { p = JSON.parse(m ? m[0] : rawTxt); } catch { return json({ error: 'unreadable' }, 502); }

      if (p && p.ok === false)
        return json({ ok: false, why: String(p.assumed || '').slice(0, 200) });

      const num = (v, hi) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= hi ? Math.round(n * 10) / 10 : 0;
      };
      const per100 = {
        kcal: num(p && p.per100 && p.per100.kcal, 900),
        p: num(p && p.per100 && p.per100.p, 100),
        c: num(p && p.per100 && p.per100.c, 100),
        f: num(p && p.per100 && p.per100.f, 100),
      };
      if (!per100.kcal) return json({ error: 'no usable answer' }, 502);

      /* The same Atwater check the food tables get. A reply whose macros do
         not add up to its own calorie figure is not a near miss, it is a
         number that came from somewhere else, and it would sit in the log
         looking exactly like the ones that do add up. */
      const calc = 4 * per100.p + 4 * per100.c + 9 * per100.f;
      const consistent = calc > 0 && Math.abs(calc - per100.kcal) / per100.kcal <= 0.35;

      let serving = Number(p && p.serving_g);
      if (!Number.isFinite(serving) || serving <= 0 || serving > 3000) serving = 0;

      const conf = ['high', 'medium', 'low'].includes(p && p.confidence) ? p.confidence : 'low';

      return json({
        ok: true,
        per100,
        serving_g: serving,
        kcal_low: num(p && p.kcal_low, 6000),
        kcal_high: num(p && p.kcal_high, 6000),
        confidence: consistent ? conf : 'low',
        consistent,
        assumed: String((p && p.assumed) || '').slice(0, 240),
      });
    }

    /* ── /analyze ────────────────────────────────────────────────────────
       A dish the tables do not have, worked out from the things they do.

       /estimate answers a composite dish in one guess, and a guess at a whole
       dish is the least accurate thing a model can be asked for: "a pita with
       shawarma" is 600 to 900 kcal and no amount of thinking narrows that,
       because the number depends on the shop.

       Its parts are a different question. Chicken thigh, pita bread, tahini,
       olive oil, salad - every one of those IS in the ministry tables, with a
       real measured value behind it. What is actually unknown is how much of
       each went in, and that is world knowledge, which is what a model is
       good for.

       So this splits the work at that line. The model breaks the dish into
       parts, looks each one up in OUR tables, and returns the row it chose
       and how many grams. It does not return a single nutrition figure -
       there is no field for one. The app multiplies the real per-100g values
       by the grams and adds them up, so the arithmetic happens on the phone
       against measured data, and the only thing estimated is the recipe.

       That is what makes this more accurate rather than merely longer: most
       of the answer stops being a guess. A part it genuinely cannot find is
       allowed to carry its own values, and is marked so it can be seen.

       Secrets: AI_KEY. Optional: ANALYZE_DAILY_CAP (default 80/IP/day). */
    /* ── /see ── what is on the plate ──
       One look, not a conversation. The reply is a sentence naming each food
       with a weight, and that sentence goes straight into /analyze, which
       already knows how to turn food into numbers out of the tables. The
       picture is never asked for a calorie figure: a model will give one,
       and it would sit on screen in the same typeface as the measured rows
       with nothing to say it was invented. */
    if (url.pathname === '/see' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'photos are not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const data = String((b && b.image) || '');
      const mime = String((b && b.mime) || 'image/jpeg');
      const LANG = langName(b && b.lang);
      if (!/^image\/(jpeg|png|webp)$/.test(mime)) return json({ error: 'bad image type' }, 400);
      /* Base64 only, and nothing that is not base64 - this string is handed
         to the model API verbatim. The client sends about 80-120 KB after
         downscaling; 900 KB is generous and still bounded. */
      if (!/^[A-Za-z0-9+/]+=*$/.test(data)) return json({ error: 'bad image' }, 400);
      if (data.length < 500) return json({ error: 'bad image' }, 400);
      if (data.length > 900000) return json({ error: 'image too large' }, 413);

      /* Its own budget. An image is several times the cost of a sentence, and
         /analyze's cap was sized for sentences. */
      const cap = Number(env.SEE_DAILY_CAP || 40);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'se:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const SYSTEM =
        'You look at a photograph of food and say what is on the plate and how\n' +
        'much of each thing there is. Another part of the app then prices every\n' +
        'item from measured nutrition tables, so your job is identification and\n' +
        'portion size ONLY.\n' +
        '\n' +
        'Judging the amount is most of the work. Use what is in the frame for\n' +
        'scale - a fork is about 19 cm, a dinner plate 26 cm, a slice of bread\n' +
        '30 g, an egg 55 g, a standard can 330 ml. Say the weight of the food\n' +
        'as served, not of the packet it came from.\n' +
        '\n' +
        'Name things plainly and separately. Rice with chicken and salad is\n' +
        'three items, not one. Include what is easy to forget and carries real\n' +
        'energy: the oil something was fried in, the dressing on a salad, the\n' +
        'butter on bread, the sauce under the pasta.\n' +
        '\n' +
        'NEVER give calories, protein, carbohydrate or fat. Not for an item and\n' +
        'not for the plate. Those come from the tables, and a number from you\n' +
        'would appear beside measured ones with nothing to mark it as a guess.\n' +
        '\n' +
        'If the picture is not food, or you cannot tell what it is, say so with\n' +
        'ok false and leave items empty. A confident wrong answer costs someone\n' +
        'their day; an honest "I cannot see it" costs them one retake.\n' +
        '\n' +
        'Write dish and every item name in ' + LANG + '. Reply with JSON only,\n' +
        'no prose and no code fence:\n' +
        '{"ok":true,"dish":"short name of the meal","items":[{"name":"food","grams":150}],\n' +
        ' "note":"what you assumed, one short sentence","confidence":"high|medium|low"}';

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            temperature: 0,
            system: SYSTEM,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mime, data } },
                { type: 'text', text: 'What food is in this picture, and how much of each?' },
              ],
            }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) return json({ error: 'the model refused', status: r.status }, 502);

      let d;
      try { d = await r.json(); } catch { return json({ error: 'bad reply' }, 502); }
      const text = ((d && d.content) || []).map((c) => c.text || '').join('').trim();
      let out;
      try { out = JSON.parse(text.replace(/^```(?:json)?|```$/g, '').trim()); }
      catch { return json({ ok: false, why: 'unreadable' }); }
      if (!out || out.ok === false) return json({ ok: false, why: 'not food' });

      /* Rebuilt field by field rather than passed through: whatever it sent
         reaches a screen, and a kcal key smuggled into an item would be shown
         as measured. Only a name and a weight survive. */
      const items = [];
      for (const it of (Array.isArray(out.items) ? out.items : []).slice(0, 12)) {
        const name = String((it && it.name) || '').trim().slice(0, 40);
        const g = Number(it && it.grams);
        if (name.length < 2) continue;
        if (!isFinite(g) || g <= 0 || g > 3000) continue;
        items.push({ name, grams: Math.round(g) });
      }
      if (!items.length) return json({ ok: false, why: 'nothing seen' });

      return json({
        ok: true,
        dish: String(out.dish || '').trim().slice(0, 60),
        items,
        note: String(out.note || '').trim().slice(0, 240),
        confidence: ['high', 'medium', 'low'].indexOf(out.confidence) >= 0 ? out.confidence : 'low',
      });
    }
    if (url.pathname === '/analyze' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'analysis is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const messages = Array.isArray(b && b.messages) ? b.messages : [];
      const LANG = langName(b && b.lang);
      if (!messages.length) return json({ error: 'nothing to analyse' }, 400);
      if (messages.length > 20) return json({ error: 'too long' }, 400);
      if (JSON.stringify(messages).length > 60000) return json({ error: 'too long' }, 400);

      const cap = Number(env.ANALYZE_DAILY_CAP || 80);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'nq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const TOOLS = [
        {
          name: 'search_food',
          description:
            "Search the app's own food tables - the Israeli ministry of health " +
            'database and Open Food Facts. Returns rows with measured energy and ' +
            'macros per 100g. Search for ONE ingredient at a time, and use the ' +
            'plainest word for it: "עוף", "פיתה", "טחינה", "שמן זית". Search in ' +
            'HEBREW whatever language the user writes in - that is the language ' +
            'the tables are written in, not the language of the answer.',
          input_schema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
          },
        },
        {
          name: 'submit',
          description:
            'Give the finished breakdown. Call this once, when every part has ' +
            'been looked up. Do not call it before searching.',
          input_schema: {
            type: 'object',
            properties: {
              parts: {
                type: 'array',
                description: 'One entry per ingredient.',
                items: {
                  type: 'object',
                  properties: {
                    row: {
                      type: 'string',
                      description:
                        'The name of the table row you are using, copied EXACTLY ' +
                        'as search_food returned it. Leave empty only if nothing ' +
                        'in the tables is this ingredient.',
                    },
                    label: { type: 'string', description: 'What this part is, in ' + LANG + '.' },
                    grams: { type: 'number', description: 'How much of it is in one serving.' },
                    per100: {
                      type: 'object',
                      description:
                        'ONLY when row is empty because the tables do not have it. ' +
                        'Your own values per 100g.',
                      properties: {
                        kcal: { type: 'number' }, p: { type: 'number' },
                        c: { type: 'number' }, f: { type: 'number' },
                      },
                    },
                  },
                  required: ['label', 'grams'],
                },
              },
              dish: { type: 'string', description: 'A short name for the whole dish, in ' + LANG + '.' },
              assumed: {
                type: 'string',
                description:
                  'One or two sentences: what you took the dish to be and what ' +
                  'portion. This is shown to the user.',
              },
              confidence: { type: 'string', description: 'high, medium or low.' },
            },
            required: ['parts', 'dish', 'assumed', 'confidence'],
          },
        },
      ];

      const SYSTEM =
        'You work out what is in a described dish, so that a food app can price it\n' +
        'from its own measured tables rather than from your guess.\n' +
        '\n' +
        'Method, in order:\n' +
        '1. Decide what the dish is and what one normal serving of it weighs.\n' +
        '2. Break it into its real ingredients, as cooked and served. A pita with\n' +
        '   shawarma is bread, meat, tahini, oil and salad - not "shawarma".\n' +
        '3. search_food for EACH ingredient separately and pick the row that is\n' +
        '   actually that ingredient. Search again with a different word if the\n' +
        '   first search misses.\n' +
        '4. Give each part its weight in grams for ONE serving. These should add\n' +
        '   up to about the serving weight you decided in step 1.\n' +
        '5. Call submit once.\n' +
        '\n' +
        'Rules that matter:\n' +
        '- Copy the row name EXACTLY as search_food gave it. A name that does not\n' +
        '  match a row is dropped, and the part is lost from the dish.\n' +
        '- Prefer a plain ingredient row over a branded product.\n' +
        '- Cooking oil and dressings are the most commonly forgotten part of a\n' +
        '  dish and often a third of its energy. Include them.\n' +
        '- Weights are per serving, not per 100g.\n' +
        '- Use your own per100 values ONLY for a part genuinely not in the\n' +
        '  tables, and then leave row empty. Prefer a table row every time.\n' +
        '- You never state a figure for the whole dish. The app adds it up.';

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            temperature: 0,
            system: SYSTEM,
            tools: TOOLS,
            messages,
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) return json({ error: 'the model refused', status: r.status }, 502);

      let out;
      try { out = await r.json(); } catch { return json({ error: 'bad reply' }, 502); }

      return json({
        ok: true,
        stop_reason: out.stop_reason || '',
        content: Array.isArray(out.content) ? out.content : [],
      });
    }

    return json({ error: 'not found' }, 404);
  },

  async scheduled(event, env, ctx) {
    let cursor;
    do {
      const page = await env.SUBS.list({ cursor, prefix: 'sub:' });
      for (const k of page.keys) {
        const rec = await env.SUBS.get(k.name, 'json');
        if (!rec) continue;

        let now;
        try { now = localNow(rec.tz); } catch { continue; }
        if (rec.last === now.date) continue;               // already sent today

        const late = toMin(now.hhmm) - toMin(rec.time);
        if (late < 0) continue;                            // not yet
        if (late > LATE_WINDOW_MIN) {                      // too late to be useful
          rec.last = now.date;
          await env.SUBS.put(k.name, JSON.stringify(rec));
          continue;
        }

        const res = await sendPush(rec.endpoint, env);
        if (res.status === 404 || res.status === 410) {
          await env.SUBS.delete(k.name);                   // subscription is gone for good
          continue;
        }
        // Mark sent even on a transient failure - better a missed day than a retry storm.
        rec.last = now.date;
        rec.lastStatus = res.status;
        await env.SUBS.put(k.name, JSON.stringify(rec));
      }
      cursor = page.list_complete ? null : page.cursor;
    } while (cursor);
  },
};

// Exported for the test harness; unused by the Worker runtime itself.
export { signJWT, localNow, toMin, subKey, b64url };
