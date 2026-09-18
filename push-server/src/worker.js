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

/* The FIRST BALANCED object, not everything between the outermost braces.
   /\{[\s\S]*\}/ is greedy: a model that answers, then adds "Wait, let me
   correct that" and a second object, produced one span from the first brace
   to the last and JSON.parse refused all of it - the request failed as
   "unreadable" when a perfectly good answer was sitting in front of it.
   Strings are tracked as strings, because a brace inside a food name is not
   a brace. */
function firstJson(raw) {
  const text = String(raw || '');
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}
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
  /* ctx is here for one reason: a streaming response returns while its writer
     is still running, and the runtime cancels pending work once the request is
     done unless waitUntil holds it. Without it /say answered in two chunks and
     stopped mid-word. */
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    /* Ask Gemini the same question with the same system prompt. Returns the
       raw text, or null - what a failure MEANS is the caller's business. */
    async function geminiText(system, user, maxTokens) {
      if (!env.GEMINI_KEY) return null;
      let r;
      try {
        r = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: 'user', parts: [{ text: user }] }],
              generationConfig: {
                maxOutputTokens: maxTokens || 1200,
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
                responseMimeType: 'application/json',
              },
            }),
          },
        );
      } catch { return null; }
      if (!r.ok) return null;
      let j;
      try { j = await r.json(); } catch { return null; }
      const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      const text = parts.map((p) => p.text || '').join('').trim();
      return text || null;
    }

    if (url.pathname === '/health') {
      // booleans only, never the values themselves.
      //
      // `ai` says a key is CONFIGURED and nothing more, which is true from the
      // moment one is set and stays true forever after. On 18 September the
      // account ran out of credit: /parse and /match returned 502 all morning
      // and this route went on saying ok:true, ai:true. A check that stays
      // green while the thing it checks is dead is worse than no check.
      //
      // So ai_checked says out loud that nobody asked, and ?deep=1 actually
      // asks - one token, and the upstream status and message come back as
      // they are. That is what tells "no credit" apart from "wrong key" apart
      // from "the model is down", and none of it publishes the key.
      const health = { ok: true, configured: !!env.VAPID_JWK, ai: !!env.AI_KEY,
                       ai_checked: false, time: new Date().toISOString() };
      if (url.searchParams.get('deep') !== '1' || !env.AI_KEY) return json(health);
      health.ai_checked = true;
      try {
        const probe = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1,
            temperature: 0,
            messages: [{ role: 'user', content: 'hi' }],
          }),
        });
        health.ai_live = probe.ok;
        if (!probe.ok) {
          health.ai_status = probe.status;
          let body = null;
          try { body = await probe.json(); } catch { body = null; }
          // the provider's own words, which is the whole point of asking
          health.ai_why = (body && body.error && body.error.message) || 'no message';
          health.ok = false;
        }
      } catch (e) {
        health.ai_live = false;
        health.ai_why = 'could not reach the provider';
        health.ok = false;
      }
      return json(health);
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
          /* A brand that IS the name adds nothing. Seven of seventy-four
             live rows came back saying it twice - Yogurt, Yogurt. */
          if (brand) {
            const a = name.toLowerCase(), b = brand.toLowerCase();
            if (!name) name = brand;
            else if (a !== b && a.slice(-b.length - 1) !== ' ' + b) name = name + ', ' + brand;
          }
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
        'Reply with JSON only:\n' +
        '{"items":[{"food":"","amount":1,"unit":"","stated_by_user":null}]}\n' +
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
        /* Measured: this prompt kept "מבושל" and deleted "לפני בישול" and "חי".
           Cooked reads as part of a name, raw reads as a note about the
           weighing, and notes get dropped - so the one case that changes the
           answer most was the one case being thrown away. */
        /* Measured: "6 oz ribeye steak" came back as SIX GRAMS, because there
           is no oz in the unit list and the model reached for the nearest
           thing. Six ounces is 170 g - a factor of twenty-eight on the one
           input an American reader is most likely to type. And asked with the
           number last, the model wrote prose about the missing unit instead
           of an answer, which used to fail the whole request. */
        /* The figure was being read correctly as part of the name and then
           dropped on the floor. It is the best evidence in the sentence: the
           person read their own packet. */
        '- A NUTRITION FIGURE THE PERSON STATES IS KEPT, in stated_by_user on\n' +
        '  the item it belongs to: "25 גרם חלבון" is\n' +
        '  stated_by_user {"protein_g":25}, "180 קלוריות" is\n' +
        '  {"calories_kcal":180}. It is the figure FOR ONE of whatever amount\n' +
        '  and unit say - one shake, not per 100 g. Fill ONLY the lines they\n' +
        '  actually gave and leave stated_by_user null when they gave none.\n' +
        '  Never invent the others to make a set look complete, and never let\n' +
        '  this change the amount: the 25 g is what the packet advertises, not\n' +
        '  how much was drunk.\n' +
        '- IMPERIAL WEIGHTS ARE CONVERTED TO GRAMS, AND THE UNIT IS "g".\n' +
        '  1 oz = 28.35 g, 1 lb = 453.6 g. These are exact, so this is\n' +
        '  arithmetic and not an estimate: "6 oz" is amount 170, unit "g";\n' +
        '  "1.5 lb" is amount 680, unit "g". Round to the nearest gram. The\n' +
        '  reader is shown whichever unit they have chosen, so nothing is lost\n' +
        '  by storing grams. Never answer with oz or lb as the unit.\n' +
        '- THE NUMBER MAY COME FIRST OR LAST, and it means the same thing\n' +
        '  either way: "6 oz ribeye steak", "ribeye steak 6 oz" and\n' +
        '  "ribeye steak, 6oz" are one item of 170 g. A quantity written after\n' +
        '  the food is still that food\u2019s quantity.\n' +
        '- THE STATE IT WAS WEIGHED IN IS PART OF THE FOOD, NOT A NOTE ABOUT IT.\n' +
        '  Keep these words in the food name, never drop them: לפני בישול,\n' +
        '  אחרי בישול, חי, גולמי, נא, מבושל, raw, uncooked, cooked.\n' +
        '  "189 גרם פילה עוף (משקל לפני בישול)" is ONE item: food\n' +
        '  "פילה עוף לפני בישול", amount 189, unit g. Raw chicken breast is\n' +
        '  22.5 g of protein per 100 g and cooked is 31, so dropping those two\n' +
        '  words changes the answer by a third.\n' +
        /* Same rule as /vision, same reason: "שתיתי קפה" is a drink whoever
           reads it, and a plate of rice is lunch or dinner depending only on
           the hour - which the app knows and this does not. */
        '- meal_type, once for the whole sentence: "drink" if what was had is\n' +
        '  drunk (water, coffee, tea, juice, a cola, a protein shake), "snack"\n' +
        '  for one small thing on its own (a piece of fruit, a protein bar, a\n' +
        '  handful of nuts), and "unspecified" for everything else. Do not\n' +
        '  guess breakfast, lunch or dinner from the food - only the hour says\n' +
        '  that, and you cannot see it.\n' +
        '- Never return calories, protein, carbohydrate or fat. You do not know them.\n' +
        '- No prose, no markdown fence, JSON only.';

      let r, why = '', by = 'anthropic';
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
        r = null;   /* both failures meet below, where Gemini is asked */
      }
      if (r && !r.ok) {
        /* The API's own sentence, not only its number: a 400 here is
           usually something structural in the request we sent, and the
           code alone is indistinguishable from a genuine refusal. */
        try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
      }

      /* WHOEVER ANSWERS. Anthropic first, then Gemini with the same prompt -
         which today is every time, because the account is out of credit. */
      let raw = '';
      if (r && r.ok) {
        let out = null;
        try { out = await r.json(); } catch { out = null; }
        raw = out ? (((out.content || []).find((c) => c.type === 'text') || {}).text || '') : '';
      }
      if (!raw) {
        const g = await geminiText(SYSTEM, text, 1200);
        if (g) { raw = g; by = 'gemini'; }
      }
      if (!raw) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, why }, 502)
          : json({ error: 'could not reach the model' }, 502);
      }

      // it is told to send JSON only, but a fence or a sentence around it is
      // the classic failure and is cheaper to survive than to argue about
      const m = firstJson(raw);
      let parsed;
      try { parsed = JSON.parse(m || raw); } catch { return json({ error: 'unreadable', raw: raw.slice(0, 200) }, 502); }

      const UNITS = ['g', 'unit', 'slice', 'cup', 'tbsp', 'tsp'];
      const items = (Array.isArray(parsed.items) ? parsed.items : [])
        .map((it) => {
          const food = String((it && it.food) || '').replace(/\s+/g, ' ').trim().slice(0, 60);
          if (!food) return null;
          let amount = Number(it && it.amount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) amount = 1;
          const unit = UNITS.includes(it && it.unit) ? it.unit : 'unit';
          /* Nutrition the endpoint would state ITSELF is still deliberately
             absent. This is the opposite: a figure the person read off their
             own packet and typed, which outranks every table we have. */
          const sv = it && it.stated_by_user && typeof it.stated_by_user === 'object' ? it.stated_by_user : null;
          const pnum = (x) => {
            if (x === null || x === undefined || x === '') return null;
            const n = Number(x);
            return isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 10) / 10 : null;
          };
          const said = sv ? {
            calories_kcal: pnum(sv.calories_kcal),
            protein_g: pnum(sv.protein_g),
            carbohydrates_g: pnum(sv.carbohydrates_g),
            fat_g: pnum(sv.fat_g),
          } : null;
          const anySaid = said && (said.calories_kcal !== null || said.protein_g !== null ||
                                   said.carbohydrates_g !== null || said.fat_g !== null);
          return { food, amount, unit, stated_by_user: anySaid ? said : null };
        })
        .filter(Boolean)
        .slice(0, 20);

      return json({ ok: true, by, items,
        meal_type: ['drink', 'snack'].indexOf(parsed && parsed.meal_type) >= 0 ? parsed.meal_type : 'unspecified' });
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
        /* The app's own scorer already ranks the raw row first for these, and
           this list can be overruled by the pick that comes back - so the
           model has to know the rule too, or it hands back the cooked row the
           scorer had just rejected. */
        /* Measured: "2 eggs" came back as a dairy's branded pack and
           "ribeye steak cooked" as a T-bone, while the app's own scorer had
           both right. The rule for a named brand was here; the rule for an
           UNnamed one never was. */
        '- WHEN NO BRAND IS NAMED, PREFER THE PLAIN TABLE ROW. A row carrying a\n' +
        '  company or a supermarket product name is the answer only when the\n' +
        '  query named it. "2 eggs" is eggs, not one dairy\u2019s packaged eggs.\n' +
        '  The plain row is what was meant, and its numbers were measured\n' +
        '  rather than declared on a packet.\n' +
        /* A different cut with similar numbers is the worst kind of wrong
           answer here: nothing about it looks wrong. */
        '- A CUT OF MEAT IS NAMED, NOT TRANSLATED, and a different cut is a\n' +
        '  different food however close its numbers are. ribeye is אנטריקוט,\n' +
        '  sirloin is סינטה, tenderloin is פילה or מותנית, brisket is חזה בקר,\n' +
        '  chuck is צוואר, flank is שפונדרה. Never answer a ribeye with a\n' +
        '  T-bone: pick the row for the SAME cut, or none.\n' +
        '- THE STATE DECIDES BETWEEN TWO ROWS OF THE SAME FOOD. If the query\n' +
        '  says raw - לפני בישול, חי, גולמי, נא, raw, uncooked - pick a row\n' +
        '  that says it is raw (לא מבושל, גולמי) and never one that says\n' +
        '  מבושל, מטוגן, אפוי, צלוי or בגריל. If the query says cooked, the\n' +
        '  reverse. Raw chicken breast is 22.5 g of protein per 100 g and\n' +
        '  cooked is 31: this is not a shade of meaning, it is a third of the\n' +
        '  answer.\n' +
        '- Never return calories, protein, carbohydrate or fat. You do not know\n' +
        '  them and they are not wanted; the app has them already.\n' +
        '- No prose, no markdown fence, JSON only.';

      const list = cands.map((n, i) => i + '. ' + n).join('\n');
      const unitWord = String((b && b.unit) || 'unit').slice(0, 12);

      /* Built once and handed to whichever provider answers. It carries the
         sixty rows and the unit the person meant; a second copy for a second
         provider is how two prompts that agree today disagree next month. */
      const USER = 'FOOD: ' + q + '\nUNIT THE USER MEANS: ' + unitWord +
                   '\nHOW MANY TO NAME: ' + want + '\nROWS:\n' + list;
      let r, why = '', by = 'anthropic';
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            /* Sonnet rather than Haiku: this one is not reading a
               sentence, it is looking. */
            model: 'claude-sonnet-5',
            max_tokens: 500,
            system: SYSTEM,
            messages: [{
              role: 'user',
              content: USER,
            }],
          }),
        });
      } catch {
        r = null;   /* both failures meet below, where Gemini is asked */
      }
      if (r && !r.ok) {
        /* The API's own sentence, not only its number: a 400 here is
           usually something structural in the request we sent, and the
           code alone is indistinguishable from a genuine refusal. */
        try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
      }

      /* WHOEVER ANSWERS, the same order and the same prompt as /parse. */
      let raw = '';
      if (r && r.ok) {
        let out = null;
        try { out = await r.json(); } catch { out = null; }
        raw = out ? (((out.content || []).find((c) => c.type === 'text') || {}).text || '') : '';
      }
      if (!raw) {
        const g = await geminiText(SYSTEM, USER, 500);
        if (g) { raw = g; by = 'gemini'; }
      }
      if (!raw) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, why }, 502)
          : json({ error: 'could not reach the model' }, 502);
      }
      const m = firstJson(raw);
      let parsed;
      try { parsed = JSON.parse(m || raw); } catch { return json({ error: 'unreadable' }, 502); }

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
      return json({ ok: true, by, pick, picks, grams, terms, sure: parsed && parsed.sure !== false });
    }

    /* ── /cross ──────────────────────────────────────────────────────────
       The second opinion, in a shape the app can compare rather than read.

       HIS IDEA, WITH ONE CORRECTION. He asked for the two paths to run against
       each other up to four times and release the most accurate result. The
       correction is that NEITHER SIDE CAN JUDGE ACCURACY - there is no ground
       truth at the moment of asking, and a loop that picks a winner is just
       picking twice. What two independent methods CAN do is agree or disagree,
       and that is worth more than it sounds:

         agreement    two methods that share no machinery landing on the same
                      number is real evidence
         disagreement a warning, and - measured three times on 15 September -
                      almost always a ROW CHOICE rather than bad data. A fresh
                      egg matched to egg powder, a protein powder to a clinical
                      supplement, plain chicken to a breaded product. Every
                      time our figures were right for the row we picked and the
                      row was wrong.

       So the loop converges by fixing IDENTIFICATION, which is what the model
       is good at, and keeps the NUMBERS from the tables, which is what they
       are good at: asked the same sentence twice, this model answered 440 and
       then 480 kcal, while the table with the right row gives the same figure
       every month. Layer 2 cannot be replaced by layer 3 however good layer 3
       looks on one answer.

       The app holds the food tables, so the loop itself lives there. This
       endpoint is one round of it.

       Round 1: `q` only - an independent reading of the sentence.
       Round 2+: `q` plus `rows`, what the app matched. Told what we chose, the
       model says which items are wrong and gives TERMS - words that would find
       the right row in a table written in the reader's language. The app then
       re-matches locally with those words. /match already returns terms for
       exactly this reason.

       Secrets: GEMINI_KEY. Optional: CROSS_DAILY_CAP (default 60/IP/day). */
    if (url.pathname === '/cross' && req.method === 'POST') {
      if (!env.GEMINI_KEY) return json({ error: 'the second opinion is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      if (q.length < 2) return json({ error: 'nothing to ask' }, 400);
      const LANG = langName(b && b.lang);

      /* what the app matched, if this is not the first round */
      const rows = (Array.isArray(b && b.rows) ? b.rows : []).slice(0, 20).map((x) => ({
        name: String((x && x.name) || '').slice(0, 120),
        grams: Number(x && x.grams) || 0,
        kcal: Number(x && x.kcal) || 0,
        protein: Number(x && x.protein) || 0,
      })).filter((x) => x.name);

      const cap = Number(env.CROSS_DAILY_CAP || 60);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'xq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const SYSTEM =
        'You give a second opinion on what someone ate, for an app that prices\n' +
        'food from measured tables. Reply with JSON only, no prose, no fence:\n' +
        '{"ok":true,"items":[{"name":"food","grams":150,"terms":["word","word"]}],\n' +
        ' "totals":{"kcal":500,"protein":45,"carbs":52,"fat":10},\n' +
        ' "disagree":["index of any row you think is the wrong FOOD"],\n' +
        ' "note":"one short sentence, or empty"}\n' +
        '\n' +
        '- items: every distinct food in the sentence, with the weight actually\n' +
        '  eaten. Include what is easy to forget and carries real energy: the\n' +
        '  oil it was fried in, the dressing, the sauce.\n' +
        '- terms: 2-4 words per item, in ' + LANG + ', that would find that food\n' +
        '  in a plain text search of a food table. Plain words for the plain\n' +
        '  food - the generic, not a brand, unless the person named a brand.\n' +
        '- totals: your own estimate for the whole thing. The app compares it\n' +
        '  with its own and only trusts a figure the two agree on.\n' +
        '\n' +
        (rows.length
          ? '- ROWS the app matched are given below with their figures. Say in\n' +
            '  "disagree" the index of any row that is the WRONG FOOD - not\n' +
            '  merely a different portion. A row naming a brand the person did\n' +
            '  not name, or a dried, powdered or breaded form of a food they\n' +
            '  described plainly, is the wrong food. For each of those give\n' +
            '  better terms in the matching item, so the app can look again.\n'
          : '') +
        '\n' +
        'Say what you do not know rather than filling it in. An item you cannot\n' +
        'weigh gets the ordinary serving and a note saying so. Never invent a\n' +
        'brand\'s published figures: estimate the generic food and say that is\n' +
        'what you did.';

      const user = 'EATEN: ' + q +
        (rows.length
          ? '\n\nROWS THE APP MATCHED:\n' + rows.map((r, i) =>
              i + '. ' + r.name + ' — ' + r.grams + ' g — ' + r.kcal + ' kcal, ' +
              r.protein + ' g protein').join('\n')
          : '');

      let r;
      try {
        r = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM }] },
              contents: [{ role: 'user', parts: [{ text: user }] }],
              generationConfig: {
                maxOutputTokens: 1200,
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
                responseMimeType: 'application/json',
              },
            }),
          },
        );
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) {
        let why = '';
        try { why = (await r.text()).slice(0, 200); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }

      let j;
      try { j = await r.json(); } catch { return json({ error: 'bad answer' }, 502); }
      const parts = j?.candidates?.[0]?.content?.parts || [];
      let text = '';
      for (const p of parts) if (!p.thought && typeof p.text === 'string') text += p.text;
      let out;
      try { out = JSON.parse(text); } catch { return json({ error: 'bad answer', raw: text.slice(0, 200) }, 502); }
      if (!out || typeof out !== 'object') return json({ error: 'bad answer' }, 502);

      return json({ ok: true, ...out });
    }

    /* ── /say ────────────────────────────────────────────────────────────
       One line in, an answer streamed back word by word.

       WHY REST RATHER THAN @google/genai. That library is a Node SDK and this
       is a Cloudflare Worker - a V8 isolate, not Node. It can sometimes be
       coaxed through nodejs_compat, but every other model call in this file is
       a plain fetch, and a REST call to Google is four lines. A Node SDK here
       is risk with no return.

       WHY NOT A .env FILE. Workers have no .env. A committed one leaks the key
       and an ignored one never reaches the server. The key is a Worker secret:
           npx wrangler secret put GEMINI_KEY
       It is never in the client, never in the repo, and never printed.

       WHY THIS IS NOT A GENERAL PURPOSE PROXY. The system prompt is fixed
       here and not accepted from the caller, for the same reason /ask defines
       its own tools: an endpoint that relays whatever it is handed is a free
       model for anyone who finds the URL, paid for by this key.

       AND THE RULE THAT MAKES AN ANSWER WORTH TRUSTING, the same one /ask and
       /estimate carry: a figure the model states must be marked as an
       estimate. It may not present a guess as a measured value.

       THE MODEL NAME. gemini-2.5-flash is what the docs and every tutorial
       still say, and Google answers a request for it with a 404: "no longer
       available to new users… use models/gemini-3.6-flash". A new key gets the
       newer model or nothing, so this is not a preference - it is the only one
       that answers.

       Secrets: GEMINI_KEY. Optional: SAY_DAILY_CAP (default 80/IP/day). */
    if (url.pathname === '/say' && req.method === 'POST') {
      if (!env.GEMINI_KEY) return json({ error: 'the assistant is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      if (q.length < 2) return json({ error: 'nothing to ask' }, 400);
      const lang = String((b && b.lang) || 'he').slice(0, 8);

      const cap = Number(env.SAY_DAILY_CAP || 80);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'sq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const SYSTEM =
        'You answer one question about food, in ' + lang + ', in a few short lines.\n' +
        '- Name the food you think it is, including the brand when the text says one.\n' +
        '- Give energy and macronutrients for the portion described, and say per what.\n' +
        '- Say plainly when a figure is an estimate rather than a label value. Never\n' +
        '  present a guess as a measured number.\n' +
        '- If the text is not about food, say so in one line and stop.\n' +
        '- No markdown, no headings, no preamble.';

      let r;
      try {
        r = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM }] },
              contents: [{ role: 'user', parts: [{ text: q }] }],
              /* thinkingBudget 0: this model reasons out loud by default, and for
                 "what is in 150 g of chicken" that costs the whole token budget
                 and fifty seconds before the answer starts. Measured: with
                 thinking on, the reply arrived as two chunks of the model's own
                 notes and the actual answer never came. */
              generationConfig: {
                maxOutputTokens: 1200,
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          },
        );
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok || !r.body) {
        let why = '';
        try { why = (await r.text()).slice(0, 200); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }

      /* Google's SSE carries its whole JSON shape. The app should not have to
         know that shape - swapping the provider later must not touch the
         client - so the text deltas are unwrapped here and sent on as
         {"t":"…"}, with a final {"done":true}. */
      const out = new TransformStream();
      const w = out.writable.getWriter();
      const td = new TextDecoder();
      const te = new TextEncoder();
      const pumped = (async () => {
        let buf = '';
        /* An explicit reader rather than for-await: async iteration over a
           ReadableStream depends on the runtime, and this endpoint cannot be
           run locally to find out. getReader is the same in every one. */
        const rd = r.body.getReader();
        try {
          for (;;) {
            const { done, value } = await rd.read();
            if (done) break;
            buf += td.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf('\n')) >= 0) {
              const line = buf.slice(0, i).trim();
              buf = buf.slice(i + 1);
              if (!line.startsWith('data:')) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === '[DONE]') continue;
              let j;
              try { j = JSON.parse(payload); } catch { continue; }
              const parts = j?.candidates?.[0]?.content?.parts || [];
              for (const p of parts) {
                /* A thinking part is the model talking to itself. It arrives in
                   the same shape as the answer and must not reach the screen. */
                if (p.thought) continue;
                if (typeof p.text === 'string' && p.text)
                  await w.write(te.encode('data: ' + JSON.stringify({ t: p.text }) + '\n\n'));
              }
            }
          }
          await w.write(te.encode('data: ' + JSON.stringify({ done: true }) + '\n\n'));
        } catch {
          await w.write(te.encode('data: ' + JSON.stringify({ error: true }) + '\n\n'));
        } finally {
          try { await w.close(); } catch {}
        }
      })();
      /* Hold the pump open past the return, or it is killed mid-stream. */
      if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(pumped);

      return new Response(out.readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          ...CORS,
        },
      });
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
      /* EITHER provider will do. This used to refuse when Anthropic was
         unconfigured, which stopped being the right question the moment there
         was a second one to ask. */
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'estimating is not configured' }, 503);

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

      let r, why = '', by = 'anthropic';
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
        r = null;   /* both failures meet below, where Gemini is asked */
      }
      if (r && !r.ok) {
        /* The API's own sentence, not only its number: a 400 here is
           usually something structural in the request we sent, and the
           code alone is indistinguishable from a genuine refusal. */
        try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
      }

      /* WHOEVER ANSWERS, the same order and the same prompt as /parse. */
      let rawTxt = '';
      if (r && r.ok) {
        let out = null;
        try { out = await r.json(); } catch { out = null; }
        rawTxt = out ? (((out.content || []).find((c) => c.type === 'text') || {}).text || '') : '';
      }
      if (!rawTxt) {
        const g = await geminiText(SYSTEM, food, 500);
        if (g) { rawTxt = g; by = 'gemini'; }
      }
      if (!rawTxt) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, why }, 502)
          : json({ error: 'could not reach the model' }, 502);
      }
      const m = firstJson(rawTxt);
      let p;
      try { p = JSON.parse(m || rawTxt); } catch { return json({ error: 'unreadable' }, 502); }

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
        by,
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
      /* What the person wrote alongside the picture. A photograph of a
         container cannot show what was made from it; this is the only place
         that can say so. */
      const note = String((b && b.note) || '').replace(/\s+/g, ' ').trim().slice(0, 400);
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
        'Judging the amount is most of the work, and it is not done by looking\n' +
        'at food and thinking of a number. A photograph gives you an area. Do\n' +
        'the two steps apart: how much of the plate does it cover, and how DEEP\n' +
        'is it. Depth is the half a picture hides and the half usually got\n' +
        'wrong - a flat smear of rice and a heaped mound cover the same circle\n' +
        'and differ threefold.\n' +
        '\n' +
        'Use what is in the frame for scale - a fork is about 19 cm, a dinner\n' +
        'plate 26 cm, a slice of bread 30 g, a pita 60 g, an egg 55 g, a\n' +
        'tablespoon of oil 14 g, a standard can 330 ml. Say the weight of the\n' +
        'food as served, not of the packet it came from.\n' +
        '\n' +
        'If nothing in the frame gives you scale - a close crop, a plate whose\n' +
        'edge is out of shot - say that in the note, use the ordinary serving\n' +
        'of that food, and set confidence low. That is a useful answer. A\n' +
        'confident weight from a picture with no ruler in it is not.\n' +
        '\n' +
        'WHEN AN ITEM IS THE PRODUCT IN THE FRAME, NAME IT WITH THE PRODUCT\'S\n' +
        'OWN WORDS. A tub marked WHEY becomes an item saying whey, not "protein\n' +
        'powder" - the tables are searched with that name, and they hold forty\n' +
        'eight whey rows and a great many soy and pea ones. Dropping the word\n' +
        'that distinguishes them is how a whey shake gets logged as pea\n' +
        'protein. Keep the type, the flavour and the brand when they are\n' +
        'printed; leave out marketing words like ADVANCED or FORMULA.\n' +
        '\n' +
        'Name things plainly and separately. Rice with chicken and salad is\n' +
        'three items, not one. Include what is easy to forget and carries real\n' +
        'energy: the oil something was fried in, the dressing on a salad, the\n' +
        'butter on bread, the sauce under the pasta.\n' +
        '\n' +
        'NEVER WORK OUT calories, protein, carbohydrate or fat. Not for an item\n' +
        'and not for the plate. Those come from the tables, and a figure you\n' +
        'reasoned out would appear beside measured ones with nothing to mark it\n' +
        'as a guess.\n' +
        '\n' +
        'READING is different from working out, and there are two things worth\n' +
        'reading when the picture is of something packaged.\n' +
        '\n' +
        'A BARCODE. If a barcode is in shot and you can read every digit of the\n' +
        'number printed under it, give it as "barcode". All of it or none of it:\n' +
        'a single wrong digit is a different product, and it would be looked up\n' +
        'and believed. If any digit is blurred, obscured or you are completing\n' +
        'it from what the brand usually is, leave it out.\n' +
        '\n' +
        'A PRODUCT NAME. If the packet shows a brand and a product name, copy\n' +
        'them as "product", exactly as printed - "Herbalife 24 Rebuild\n' +
        'Strength", not "protein powder". Read it, do not recall it: the same\n' +
        'rule as the other two. A name is worth having even with no numbers\n' +
        'beside it, because it is what tells the rest of the app whether this\n' +
        'product is in the tables at all - and saying "we do not have this"\n' +
        'is impossible while the name is unknown.\n' +
        '\n' +
        'A NUTRITION PANEL. If the printed nutrition information is legible,\n' +
        'copy it as "label" - the numbers as printed, in the units printed,\n' +
        'saying which basis they are per. Copy only; do not convert, do not\n' +
        'total, do not fill a missing line from the others. If the panel is not\n' +
        'readable in the photograph, leave it out. Large front-of-pack claims\n' +
        'count as a panel only when they name the nutrient and its unit -\n' +
        '"25g protein" and "130 kcal" do; a bare "25" does not.\n' +
        '\n' +
        'Both must come from THIS photograph. You may know what this product\n' +
        'contains; that is not reading it, and it is exactly the guess the\n' +
        'tables exist to avoid.\n' +
        '\n' +
        'A PACKAGED PRODUCT IS AN ANSWER, not a failure. A tub of whey, a\n' +
        'cereal box, a bottle: name it, read what is printed on it, and set\n' +
        'confidence low for any weight, because a sealed container shows you\n' +
        'nothing about how much was taken from it. Do NOT reply ok false for\n' +
        'these - a tub of WHEY ADVANCED FORMULA is among the most identifiable\n' +
        'things anyone will photograph, and "not food" is the least useful\n' +
        'answer available for it.\n' +
        '\n' +
        (note
          ? 'THE PERSON WROTE THIS ALONGSIDE THE PICTURE, AND FOR WHAT WAS\n' +
            'ACTUALLY CONSUMED IT OUTRANKS THE PICTURE:\n"' + note + '"\n' +
            'The photograph says WHAT the thing is; these words say how much of\n' +
            'it was had and what it was made with. A container plus "one scoop\n' +
            'with 250 ml of water" is a shake, and the items are the scoop and\n' +
            'the water - not the tub. Where the two conflict, believe the words.\n' +
            '\n'
          : '') +
        'If the picture is not food, or you cannot tell what it is, say so with\n' +
        'ok false and leave items empty. A confident wrong answer costs someone\n' +
        'their day; an honest "I cannot see it" costs them one retake.\n' +
        '\n' +
        'Write dish and every item name in ' + LANG + '. Reply with JSON only,\n' +
        'no prose and no code fence:\n' +
        '{"ok":true,"dish":"short name of the meal","items":[{"name":"food","grams":150}],\n' +
        ' "note":"what you assumed, one short sentence","confidence":"high|medium|low",\n' +
        ' "barcode":"digits under the barcode, or omit",\n' +
        ' "product":"brand and product name as printed, or omit",\n' +
        ' "label":{"basis":"100g|100ml|serving","serving_g":330,"kcal":37,"protein":7.1,\n' +
        '          "carbs":2.1,"fat":0} or omit}';

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
            /* Sonnet rather than Haiku: this one is not reading a
               sentence, it is looking. */
            model: 'claude-sonnet-5',
            max_tokens: 800,
            system: SYSTEM,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mime, data } },
                ...(note ? [{ type: 'text', text: 'What they wrote: ' + note }] : []),
                { type: 'text', text: 'What food is in this picture, and how much of each?' },
              ],
            }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) {
        /* The API's own sentence, not only its number: a 400 here is
           usually something structural in the request we sent, and the
           code alone is indistinguishable from a genuine refusal. */
        let why = '';
        try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }

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

      /* A barcode of a length that exists, digits only. The app still checks
         the check digit before it looks anything up - a misread digit names a
         real but different product, which is the one failure here that would
         be confidently wrong rather than obviously wrong. */
      let barcode = String((out && out.barcode) || '').replace(/[^0-9]/g, '');
      if ([8, 12, 13, 14].indexOf(barcode.length) < 0) barcode = '';

      /* The panel as printed - WHATEVER OF IT WAS PRINTED.
         This used to demand all four lines and return null otherwise, and the
         reasoning was sound for the case it had in mind: a nutrition panel the
         model could only half read invites filling the gap by arithmetic, and
         a hole where the protein should be became NaN, then null, then a zero
         in somebody's day total.
         But a FRONT-OF-PACK CLAIM is not a half-read panel. "26 גרם חלבון" is
         the manufacturer's own declared figure and it is complete in itself;
         there is no missing carbohydrate line, because there was never a line.
         Destroying it here meant a packet that states 26 was reported as the
         22.8 of a generic table row - three times, to the same person, on the
         same pastrami.
         The all-four rule is not gone. It moved to where it can tell the two
         cases apart: picFromLabel still refuses to build a standalone row out
         of a partial, so the NaN cannot come back, and what a partial now
         reaches instead is picLabelOverlay - which copies only the fields that
         carry a real number and keeps the measured value for all the rest.
         A complete panel produces exactly the object it produced before. */
      let label = null;
      const L = out && out.label;
      if (L && typeof L === 'object') {
        const num = (v) => {
          const x = Number(v);
          return isFinite(x) && x >= 0 && x < 10000 ? Math.round(x * 10) / 10 : null;
        };
        const kcal = num(L.kcal), p = num(L.protein), c = num(L.carbs), f = num(L.fat);
        const basis = ['100g', '100ml', 'serving'].indexOf(L.basis) >= 0 ? L.basis : '';
        const serving = num(L.serving_g);
        /* A basis is not optional: a number with nothing to be per is not a
           reading of anything. Neither is "serving" without the grams. */
        if (basis && (basis !== 'serving' || (serving && serving > 0)) &&
            (kcal !== null || p !== null || c !== null || f !== null)) {
          label = { basis };
          if (kcal !== null) label.kcal = kcal;
          if (p !== null) label.p = p;
          if (c !== null) label.c = c;
          if (f !== null) label.f = f;
          if (serving && serving > 0) label.serving_g = serving;
        }
      }

      return json({
        ok: true,
        dish: String(out.dish || '').trim().slice(0, 60),
        items,
        note: String(out.note || '').trim().slice(0, 240),
        confidence: ['high', 'medium', 'low'].indexOf(out.confidence) >= 0 ? out.confidence : 'low',
        barcode,
        label,
      });
    }
    /* ── READ THE PACKET ──
       His brief, and the right one: OCR first, the exact variant second, any
       language third, an estimate only when nothing is printed to read.

       THE SPLIT THIS ENDPOINT KEEPS. When the model READ something, its
       numbers win - a printed figure outranks any row we hold, which is the
       trust order already written down and the thing that was failing. When
       it did NOT read anything it returns items and grams instead, and the
       food tables supply the numbers. That is not caution for its own sake:
       a named tub of whey, estimated, came back 35 kcal and 6 g of protein
       against a true 114 and 15, carrying confidence "high". A model looking
       at a plate cannot be held to a number; a model reading a label can.

       THE MODEL NAME, again. gemini-2.5-flash is 404 for a new key - "no
       longer available to new users… use models/gemini-3.6-flash" - and 1.5
       is older than that. VISION_MODEL can override it without a code change
       when Google moves the floor again, which it will.

       Secrets: GEMINI_KEY. Optional: VISION_MODEL, VISION_DAILY_CAP (40). */
    if (url.pathname === '/vision' && req.method === 'POST') {
      if (!env.GEMINI_KEY) return json({ ok: false, error: 'vision is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ ok: false, error: 'bad json' }, 400); }

      /* A data: URL carries its own mime, and the caller may send either that
         or a bare payload plus a mime field. Take the URL's word when it has
         one - a png announced as a jpeg is refused by the model, not by us. */
      /* One picture or several. `image` is the old field and still works; a
         client sending `images` gets the ingredients question instead of the
         product question. Four is the ceiling - past that the person is
         photographing a shopping trip, not a meal, and every extra picture
         costs tokens and latency on a phone. */
      const VMAX = 4;
      let raw = (b && Array.isArray(b.images) && b.images.length) ? b.images : [(b && b.image) || ''];
      if (raw.length > VMAX) return json({ ok: false, error: 'too many images: ' + raw.length + ', the limit is ' + VMAX }, 400);

      const shots = [];
      let vtotal = 0;
      for (let i = 0; i < raw.length; i++) {
        let data = String(raw[i] || '').trim();
        let mime = String((b && b.mime) || 'image/jpeg');
        const m = /^data:(image\/[a-z+]+);base64,/i.exec(data);
        if (m) { mime = m[1].toLowerCase(); data = data.slice(m[0].length); }
        data = data.replace(/\s/g, '');

        /* the index is named in every message: with four pictures "bad image
           type" alone does not say which one to take again */
        const which = raw.length > 1 ? ' (picture ' + (i + 1) + ')' : '';
        if (!/^image\/(jpeg|png|webp)$/.test(mime)) return json({ ok: false, error: 'bad image type: ' + mime + which }, 400);
        if (!/^[A-Za-z0-9+/]+=*$/.test(data)) return json({ ok: false, error: 'the image is not base64' + which }, 400);
        if (data.length < 500) return json({ ok: false, error: 'the image is too small to read' + which }, 400);
        if (data.length > 900000) return json({ ok: false, error: 'image too large' + which }, 413);
        vtotal += data.length;
        shots.push({ mime, data });
      }
      /* and a ceiling on the total, because four legal images are still a
         2.4 MB request from a phone on mobile data */
      if (vtotal > 1800000) return json({ ok: false, error: 'the pictures are too large together' }, 413);
      const many = shots.length > 1;

      const cap = Number(env.VISION_DAILY_CAP || 40);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const vday = new Date().toISOString().slice(0, 10);
      const vkey = 'vi:' + vday + ':' + ip;
      const vused = Number((await env.SUBS.get(vkey)) || 0);
      if (vused >= cap) return json({ ok: false, error: 'too many for today' }, 429);
      await env.SUBS.put(vkey, String(vused + 1), { expirationTtl: 172800 });

      const VLANG = langName(b && b.lang);
      /* What the person wrote alongside the picture. A sealed container cannot
         show what was made from it; these words are the only thing that can. */
      const vnote = String((b && b.note) || '').replace(/\s+/g, ' ').trim().slice(0, 400);

      const VSYS =
        'You are an elite, international nutritional analysis model and visual ' +
        'OCR expert. Your sole purpose is ACCURACY. You must analyze images of ' +
        'packaged food products or raw meals from ANY country and in ANY ' +
        'language with surgical precision. Never use broad estimates when label ' +
        'text or visual markers are present.';

      const VUSER =
        'Work in this order and do not skip a step.\n' +
        '\n' +
        'STEP 1 - OCR AND LABEL EXTRACTION. Scan the image for any readable ' +
        'text: product names, weight markers ("120g", "26 גרם חלבון"), ' +
        'percentages, and nutrition tables. Where figures are printed, take ' +
        'them EXACTLY as printed. Copy, do not convert, do not total, and do ' +
        'not fill a line the packet does not state from the ones it does.\n' +
        '\n' +
        'STEP 2 - THE EXACT VARIANT. Identify the specific product, not its ' +
        'family: "High Protein", "XTRA", "Low Fat", "Sugar Free", the fat ' +
        'percentage. A variant named on the packet is the answer; the generic ' +
        'average of that food is not. This is the single most common way to be ' +
        'wrong here.\n' +
        '\n' +
        'STEP 2b - RAW OR COOKED. Detect whether the state is stated: raw or\n' +
        'uncooked (לפני בישול, חי, גולמי, נא, raw) versus cooked or prepared\n' +
        '(אחרי בישול, מבושל, מוכן, cooked). Report it as cooking_state, and\n' +
        'where it is stated put the words into the item names too, so the food\n' +
        'tables are asked for the right row. If the values you give are read\n' +
        'off a raw product they are RAW values - do not convert them, and do\n' +
        'not answer a raw question with cooked figures. Raw chicken breast is\n' +
        '22-23 g of protein and 110-115 kcal per 100 g; cooked is about 31 g\n' +
        'and 165 kcal. Unspecified is an honest answer and is better than a\n' +
        'guess.\n' +
        '\n' +
        'STEP 3 - ANY LANGUAGE. Read Hebrew, Arabic, English, Spanish, ' +
        'Japanese, Chinese or anything else on the packet, and report every ' +
        'number in international units: kcal, grams, milligrams.\n' +
        '\n' +
        'STEP 4 - WHEN THERE IS NOTHING TO READ. A prepared dish, loose fruit, ' +
        'a plate of food: set is_estimated true, set confidence honestly, and ' +
        'leave nutritional_values null. Instead fill items with what is on the ' +
        'plate and what each part weighs. Do not state nutrition figures for ' +
        'food you are looking at rather than reading - those are supplied from ' +
        'measured tables on our side, and a figure you infer would sit beside ' +
        'them with nothing to mark it as a guess.\n' +
        '\n' +
        'A FIGURE THE PACKET DOES NOT STATE IS null, NEVER 0. Zero is a ' +
        'reading - it will be shown to the person and counted in their day as ' +
        'a measured zero. A pastrami packet that prints protein and fat and no ' +
        'energy line has calories_kcal null, not 0. Where a figure is null we ' +
        'fill it from measured tables; where it is 0 we believe you.' +
        '\n\n' +
        '- meal_type: what the FOOD says, and nothing more.\n' +
        '  "drink" for anything drunk - water, coffee, tea, juice, a cola, a\n' +
        '  protein shake.\n' +
        '  "snack" for a single piece of fruit, a protein bar, a handful of nuts,\n' +
        '  a yogurt - one small item under roughly 200 kcal eaten on its own.\n' +
        '  "unspecified" for EVERYTHING ELSE, and that is not a failure. A plate of\n' +
        '  rice and chicken is lunch or dinner depending only on the hour, which\n' +
        '  you cannot see. The app knows the time and will decide. Guessing here\n' +
        '  files someone\u2019s food under the wrong meal with nothing to mark it as\n' +
        '  a guess.\n' +
        '\n' +
        'THREE RULES THAT APPLY TO EVERY PICTURE-AND-WORDS INPUT, however many ' +
        'pictures there are.\n' +
        '\n' +
        'RULE 1 - THE WORDS MAY POINT AT THE PICTURE. If the sentence refers to ' +
        'something instead of naming it - "מהזאת", "הזה", "מהקופסה הזו", "כאן", ' +
        '"this", "that one", "from it" - then the thing being referred to is the ' +
        'MAIN OBJECT IN THE PHOTOGRAPH, and it is the FIRST item in your answer. ' +
        'Identify it from the picture, then attach the quantity the words give. ' +
        '"סקופ מהזאת" over a tub of protein powder is one scoop of THAT powder, ' +
        'named and measured; it is never an answer with no powder in it. An item ' +
        'the words point at and you leave out is the worst failure here, because ' +
        'the person cannot see that it is missing - they can see only a total ' +
        'that is too small.\n' +
        '\n' +
        'RULE 2 - ONE BASE INGREDIENT, ONE ROW. Never return two brands or two ' +
        'variants of the same base food in the same meal. If you are unsure ' +
        'which brand of milk, or whether the lactose-free one is a different ' +
        'product, choose ONE canonical row and return it once. Milk twice is not ' +
        'two ingredients; it is one ingredient and an uncertainty, and returning ' +
        'both doubles it in someone\u2019s day. The same goes for a food you can ' +
        'see and also infer from the words - it is one row, not two.\n' +
        '\n' +
        'RULE 3 - HOUSEHOLD MEASURES BECOME GRAMS. A scoop, a spoonful, a ' +
        'handful, a sip are quantities, and grams are the only unit the tables ' +
        'answer. Convert them, and put the grams in the item. Where the ' +
        'photographed pack states its own serving - "מנה: 32 גרם", a scoop ' +
        'printed on the tub - THAT is the number, and these are only the ' +
        'fallback:\n' +
        '  scoop of protein powder 30 g, tablespoon 15 g, teaspoon 5 g,\n' +
        '  tablespoon of peanut butter or tahini 16 g, tablespoon of oil 14 g,\n' +
        '  handful of nuts 30 g, slice of bread 28 g, slice of hard cheese 25 g,\n' +
        '  sip 30 ml, glass 250 ml, mug 240 ml.\n' +
        'A converted household measure is not read off a label: from_label stays ' +
        'false for it.\n' +
        '\n' +
        'RULE 4 - WHEY IS NOT SOY. If a pack shows WHEY, Whey Protein, ' +
        'ISOLATE, CONCENTRATE, or the words say אבקת חלבון with nothing else, ' +
        'the item is WHEY protein powder - name it אבקת חלבון מי גבינה (WHEY) ' +
        'in Hebrew, whey protein powder in English. Soy, pea, rice or hemp ' +
        'protein is the answer ONLY where the packet or the person says so ' +
        '(סויה, Soy, אפונה, Pea). Defaulting an unmarked protein powder to soy ' +
        'sends the person to a different food with different numbers.\n' +
        '\n' +
        'RULE 5 - A FIGURE THE PERSON STATES IS BINDING. If the words give a ' +
        'nutrition figure for what they ate - "25 גרם חלבון", "(20g protein)", ' +
        '"180 קלוריות" - they read it off their own packet, and it OUTRANKS ' +
        'both the picture and any table. Put it in stated_by_user on the item it ' +
        'belongs to, exactly as given.\n' +
        '  It is the figure FOR THE PORTION IN grams on that same item, not per ' +
        '100 g. If they say a scoop has 25 g of protein, the item is the scoop, ' +
        'grams is the scoop, and stated_by_user.protein_g is 25.\n' +
        '  Fill ONLY the fields they actually stated; everything else stays ' +
        'null and is supplied from measured tables. Do NOT invent the rest to ' +
        'make a set look complete, and do NOT change grams to make some other ' +
        'figure come out right - the portion is what they described.\n' +
        '\n' +
        'RULE 6 - A HEDGED QUANTITY IS A SMALL ONE. "קצת חלב", "מעט", "טיפה", ' +
        '"a splash", "a little" is NOT a full serving. For a liquid use about ' +
        '60 ml (50-100 is the honest range); for a solid, about 20 g. A glass ' +
        'of milk is 240 ml and "a little milk" is not a glass - four times the ' +
        'milk is four times its calories, in a cup of coffee nobody thought ' +
        'twice about.\n' +
        '\n' +
        'HOW MUCH THERE IS is a different question from what the numbers are ' +
        'PER, and they are answered separately. A pot printing "170 g" beside ' +
        'a panel headed "per 100 g" has serving_size_analyzed "100g" and ' +
        'package_g 170.\n' +
        '- package_g: the net weight printed on the pack, in grams. If nothing ' +
        'is printed, give the ordinary weight of one of these - a yogurt pot ' +
        'is about 170 g, a chocolate bar about 100 g, a canned drink 330 ml - ' +
        'and set package_is_guess true. If you cannot even guess, null.\n' +
        '- package_is_guess: true when package_g is the usual size rather than ' +
        'a number you read. Saying so costs nothing; a guessed weight shown as ' +
        'a reading costs someone their day.\n' +
        '\n' +
        'nutritional_values are PER serving_size_analyzed, and that string must ' +
        'say which - "100g", "120g", "1 unit".\n' +
        '- serving_g: WHAT THAT SERVING WEIGHS, in grams, as a number. For a ' +
        'panel headed "per 100 g" it is 100. For one printed per tub, per pot, ' +
        'per bottle or per package it is the NET WEIGHT of that container - the ' +
        'same figure as package_g. Give the number even when the serving is ' +
        'written in words with no figure in it ("1 tub", "לגביע"): those are ' +
        'exactly the labels where leaving it null makes the figures be read as ' +
        'per 100 g and doubled. null only if the packet truly gives nothing to ' +
        'go on.\n' +
        '\n' +
        'visual_reasoning: name the text you actually read, or the visual cue ' +
        'you actually used. One short sentence.\n' +
        '\n' +
        (many
          ? 'THERE ARE ' + shots.length + ' PICTURES, AND THEY ARE NOT ' +
            shots.length + ' SEPARATE MEALS.\n' +
            'They are the COMPONENTS of one thing this person made. Read every ' +
            'one of them: identify each product, its exact variant, and where a ' +
            'nutrition panel is legible, read it.\n' +
            'Then answer with items - one row per component that was ACTUALLY ' +
            'EATEN, with how many grams of it went in. The words below say what ' +
            'was made and in what quantity; a photographed packet says what the ' +
            'thing IS, never how much of it was used. A 200 g jar with one ' +
            'spoonful taken from it is 15 g in items, not 200.\n' +
            'A component the words mention but no picture shows still belongs in ' +
            'items - a slice of bread under the cheese is part of the meal.\n' +
            'For each item, if you READ that component\u2019s own panel, put its ' +
            'per-100g figures in per_100g and set from_label true. That is the ' +
            'entire point of the pictures: this brand of cheese, not the average ' +
            'of all cheese. If you did not read a panel for that component, ' +
            'per_100g is null and from_label false - we have measured tables for ' +
            'that case and an invented figure would sit beside them unmarked.\n' +
            'With several pictures, product_name names the DISH and ' +
            'nutritional_values is null: there is no single packet to report.\n' +
            '\n'
          : '') +
        (vnote
          ? 'THE PERSON WROTE THIS ALONGSIDE THE PICTURE, AND FOR WHAT WAS ' +
            'ACTUALLY CONSUMED IT OUTRANKS THE PICTURE:\n"' + vnote + '"\n' +
            'The photograph says WHAT the thing is; these words say how much of ' +
            'it was had and what it was made with. Where the two conflict, ' +
            'believe the words.\n\n'
          : '') +
        'Write product_name and every item name in ' + VLANG + '.';

      /* A schema rather than a hope. responseMimeType alone still lets the
         model choose its own field names, and every field below is read by
         name on the other side. */
      const N = { type: 'NUMBER', nullable: true };
      const VSCHEMA = {
        type: 'OBJECT',
        properties: {
          product_name: { type: 'STRING' },
          brand: { type: 'STRING', nullable: true },
          serving_size_analyzed: { type: 'STRING' },
          /* THE SAME THING AS A NUMBER. serving_size_analyzed is a display
             string, and the app was reading the weight back out of it with a
             regex - which answers nothing for "1 tub" or "לגביע", and a panel
             printed per tub then got treated as per 100 g and doubled. */
          serving_g: { type: 'NUMBER', nullable: true },
          is_packaged_product: { type: 'BOOLEAN' },
          is_estimated: { type: 'BOOLEAN' },
          confidence: { type: 'STRING', enum: ['High', 'Medium', 'Low'] },
          cooking_state: { type: 'STRING', enum: ['raw', 'cooked', 'unspecified'] },
          meal_type: { type: 'STRING', enum: ['breakfast', 'lunch', 'dinner', 'snack', 'drink', 'unspecified'] },
          package_g: { type: 'NUMBER', nullable: true },
          package_is_guess: { type: 'BOOLEAN' },
          nutritional_values: {
            type: 'OBJECT',
            nullable: true,
            properties: {
              calories_kcal: N, protein_g: N, carbohydrates_g: N, fat_g: N, sodium_mg: N,
            },
          },
          items: {
            type: 'ARRAY',
            nullable: true,
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                grams: { type: 'NUMBER' },
                /* per-item, because with several packets in front of it there
                   is no single "the" label any more. Required-and-nullable for
                   the same reason the outer object is: a schema that permits
                   silence gets silence. */
                per_100g: {
                  type: 'OBJECT',
                  nullable: true,
                  properties: { calories_kcal: N, protein_g: N, carbohydrates_g: N, fat_g: N },
                },
                from_label: { type: 'BOOLEAN' },
                /* what the PERSON said this portion contains - not per 100 g,
                   and only the lines they actually gave */
                stated_by_user: {
                  type: 'OBJECT',
                  nullable: true,
                  properties: { calories_kcal: N, protein_g: N, carbohydrates_g: N, fat_g: N },
                },
              },
              propertyOrdering: ['name', 'grams', 'per_100g', 'from_label', 'stated_by_user'],
              required: ['name', 'grams', 'per_100g', 'from_label', 'stated_by_user'],
            },
          },
          visual_reasoning: { type: 'STRING' },
        },
        /* nutritional_values and items are REQUIRED and nullable, not optional.
           Optional, the model simply left both out and answered with five fields:
           a schema that permits silence gets silence. Required-and-nullable makes
           it say null, which is an answer we can read. */
        propertyOrdering: ['product_name', 'brand', 'serving_size_analyzed', 'serving_g',
                           'is_packaged_product', 'is_estimated', 'confidence',
                           'cooking_state', 'meal_type', 'package_g', 'package_is_guess',
                           'nutritional_values', 'items', 'visual_reasoning'],
        required: ['product_name', 'brand', 'serving_size_analyzed', 'serving_g',
                   'is_packaged_product', 'is_estimated', 'confidence',
                   'cooking_state', 'meal_type', 'package_g', 'package_is_guess',
                   'nutritional_values', 'items', 'visual_reasoning'],
      };

      const VMODEL = String(env.VISION_MODEL || 'gemini-3.6-flash');
      let vr;
      try {
        vr = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' + VMODEL + ':generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: VSYS }] },
              contents: [{
                role: 'user',
                /* the pictures first, then the question - the model reads
                   parts in order, and a question asked before the evidence
                   arrives is answered from the question alone */
                parts: shots.map((sh) => ({ inlineData: { mimeType: sh.mime, data: sh.data } }))
                  .concat([{ text: VUSER }]),
              }],
              generationConfig: {
                /* 3000, not 1400. At 1400 the answer came back TRUNCATED mid-word:
                   this model thinks before it writes and the thinking is drawn from
                   the same budget, Hebrew costs more tokens per character than
                   English, and what fell off the end was the nutrition object.
                   The thinking is not disabled here the way /say and /cross
                   disable it - reading small print off a photograph is the one
                   place in this app where it earns its cost. */
                maxOutputTokens: many ? 4500 : 3000,
                /* 0, because this is reading, not writing. Creativity here is
                   indistinguishable from making the label say something else. */
                temperature: 0,
                responseMimeType: 'application/json',
                responseSchema: VSCHEMA,
              },
            }),
          },
        );
      } catch (e) {
        return json({ ok: false, error: 'could not reach the model', why: String(e).slice(0, 160) }, 502);
      }
      if (!vr.ok) {
        let why = '';
        try { why = (await vr.text()).slice(0, 300); } catch {}
        return json({ ok: false, error: 'the model refused', status: vr.status, model: VMODEL, why }, 502);
      }

      let vj;
      try { vj = await vr.json(); } catch { return json({ ok: false, error: 'the model did not answer with json' }, 502); }
      const vparts = vj?.candidates?.[0]?.content?.parts || [];
      let vtext = '';
      for (const p of vparts) if (!p.thought && typeof p.text === 'string') vtext += p.text;
      let v;
      try { v = JSON.parse(vtext); } catch {
        return json({ ok: false, error: 'the model did not answer with json', raw: vtext.slice(0, 300) }, 502);
      }
      if (!v || typeof v !== 'object') return json({ ok: false, error: 'the model did not answer with json' }, 502);

      /* Everything below is ours, not the model's. A field that did not come
         back as a usable number becomes null rather than a zero: this app has
         already shipped a null that counted as 0 in someone's day total. */
      const vnum = (x) => {
        /* null FIRST, because Number(null) is 0 and 0 is a reading. The prompt
           asks for null on every line a packet does not print, and without
           this the answer it was told to give became a measured zero in
           somebody's day - which is the bug the rest of this function was
           written to prevent. */
        if (x === null || x === undefined || x === '') return null;
        const n = Number(x);
        return isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 10) / 10 : null;
      };
      const NV = v.nutritional_values && typeof v.nutritional_values === 'object' ? v.nutritional_values : null;
      const estimated = v.is_estimated !== false;

      const items = [];
      if (Array.isArray(v.items)) {
        for (const it of v.items.slice(0, 12)) {
          const name = String((it && it.name) || '').trim().slice(0, 60);
          const g = Number(it && it.grams);
          if (!name || !isFinite(g) || g <= 0 || g > 3000) continue;
          /* THE PANEL READ OFF THIS COMPONENT'S OWN PACKET. This used to be
             dropped here - the schema asked for it, the model answered it, and
             the assembly rebuilt the item without it, so the per-item numbers
             never once reached the app. */
          const pv = it && it.per_100g && typeof it.per_100g === 'object' ? it.per_100g : null;
          const per = pv ? {
            calories_kcal: vnum(pv.calories_kcal),
            protein_g: vnum(pv.protein_g),
            carbohydrates_g: vnum(pv.carbohydrates_g),
            fat_g: vnum(pv.fat_g),
          } : null;
          const anyPer = per && (per.calories_kcal !== null || per.protein_g !== null ||
                                 per.carbohydrates_g !== null || per.fat_g !== null);
          /* A FIGURE THE PERSON STATED, kept apart from one that was read off
             a packet: they outrank a label as well as a table, and the app
             applies them last for that reason. Only the lines they gave. */
          const sv = it && it.stated_by_user && typeof it.stated_by_user === 'object' ? it.stated_by_user : null;
          const said = sv ? {
            calories_kcal: vnum(sv.calories_kcal),
            protein_g: vnum(sv.protein_g),
            carbohydrates_g: vnum(sv.carbohydrates_g),
            fat_g: vnum(sv.fat_g),
          } : null;
          const anySaid = said && (said.calories_kcal !== null || said.protein_g !== null ||
                                   said.carbohydrates_g !== null || said.fat_g !== null);
          items.push({
            name,
            grams: Math.round(g),
            per_100g: anyPer ? per : null,
            from_label: anyPer ? it.from_label === true : false,
            stated_by_user: anySaid ? said : null,
          });
        }
      }
      /* ONE BASE INGREDIENT, ONE ROW - asked for in the prompt and enforced
         here, because a prompt is a request and a day total is arithmetic.
         Deliberately conservative: identical names, and a name whose words are
         a subset of another's ("חלב" inside "חלב טרה"). The two-brands case is
         left to the model, since deciding here that two unequal words are
         brands of one thing would merge גבינה צהובה with גבינה לבנה too. */
      const vnorm = (n) => n.toLowerCase().replace(/[\s,._\-()״"']+/g, ' ').trim();
      const vwords = (n) => new Set(vnorm(n).split(' ').filter(Boolean));
      const subset = (a, b) => { for (const w of a) if (!b.has(w)) return false; return a.size > 0; };
      const merged = [];
      for (const it of items) {
        const w = vwords(it.name);
        let hit = -1;
        for (let k = 0; k < merged.length; k++) {
          const mw = vwords(merged[k].name);
          if (vnorm(merged[k].name) === vnorm(it.name) || subset(w, mw) || subset(mw, w)) { hit = k; break; }
        }
        if (hit < 0) { merged.push(it); continue; }
        const m = merged[hit];
        /* the more specific name wins, the grams add up, and a panel that was
           read beats one that was not */
        if (vwords(it.name).size > vwords(m.name).size) m.name = it.name;
        m.grams = Math.min(3000, m.grams + it.grams);
        if (!m.from_label && it.from_label) { m.per_100g = it.per_100g; m.from_label = true; }
        /* and a figure the person stated survives the merge - it is the one
           thing here that no table can replace */
        if (!m.stated_by_user && it.stated_by_user) m.stated_by_user = it.stated_by_user;
      }
      items.length = 0;
      for (const m of merged) items.push(m);

      /* An estimate does not get to state nutrition. It states what is on the
         plate; the tables state what that is worth. */
      const values = (!estimated && NV) ? {
        kcal: vnum(NV.calories_kcal),
        p: vnum(NV.protein_g),
        c: vnum(NV.carbohydrates_g),
        f: vnum(NV.fat_g),
        sod: vnum(NV.sodium_mg),
      } : null;
      /* The one zero that cannot be a reading. Asked for null, the model still
         answered 0 for the energy line this packet does not print - and a food
         carrying 26 g of protein does not have 0 kcal. No arithmetic is done
         here and none is needed: the figure is simply dropped, and a dropped
         figure is filled from the tables on the other side.
         Carbohydrate and fat zeros are LEFT ALONE - pastrami really does print
         0 g of carbohydrate, and second-guessing a plausible zero is how a
         measured value gets thrown away. */
      if (values && values.kcal === 0 &&
          ((values.p || 0) > 0 || (values.c || 0) > 0 || (values.f || 0) > 0)) values.kcal = null;
      const anyValue = !!values && (values.kcal !== null || values.p !== null ||
                                    values.c !== null || values.f !== null);

      if (!anyValue && !items.length) return json({ ok: false, error: 'nothing readable in the picture' });

      return json({
        ok: true,
        product_name: String(v.product_name || '').trim().slice(0, 90),
        brand: v.brand ? String(v.brand).trim().slice(0, 40) : null,
        serving: String(v.serving_size_analyzed || '').trim().slice(0, 24),
        serving_g: vnum(v.serving_g),
        packaged: v.is_packaged_product === true,
        estimated,
        confidence: ['High', 'Medium', 'Low'].indexOf(v.confidence) >= 0 ? v.confidence : 'Low',
        cooking_state: ['raw', 'cooked'].indexOf(v.cooking_state) >= 0 ? v.cooking_state : 'unspecified',
        /* Bounded the same way an item's grams are - a pack weight outside
           this is a misread digit, not a pack. */
        /* Only what the food can say. Anything else - including a confident
           "lunch" - is discarded and left to the clock, which is the one that
           knows. */
        meal_type: ['drink', 'snack'].indexOf(v.meal_type) >= 0 ? v.meal_type : 'unspecified',
        package_g: (function () { const g = vnum(v.package_g); return (g && g > 0 && g <= 5000) ? Math.round(g) : null; }()),
        package_is_guess: v.package_is_guess === true,
        values: anyValue ? values : null,
        items,
        why: String(v.visual_reasoning || '').trim().slice(0, 240),
        model: VMODEL,
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
      if (!r.ok) {
        /* The API's own sentence, not only its number: a 400 here is
           usually something structural in the request we sent, and the
           code alone is indistinguishable from a genuine refusal. */
        let why = '';
        try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }

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
