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

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === '/health') {
      return json({ ok: true, configured: !!env.VAPID_JWK, time: new Date().toISOString() });
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
        'You split a description of a meal into its items. Hebrew or English.\n' +
        'Reply with JSON only: {"items":[{"food":"","amount":1,"unit":""}]}\n' +
        '- food: the food alone, in the language it was written, no quantity words.\n' +
        '- amount: a number. If none is given use 1.\n' +
        '- unit: one of g, unit, slice, cup, tbsp, tsp. Use "unit" for whole things\n' +
        '  (an egg, an apple, a roll) and "g" only when grams are actually stated.\n' +
        '- Split "לחם עם גבינה" into two items. Keep "סלט יווני" as one.\n' +
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
