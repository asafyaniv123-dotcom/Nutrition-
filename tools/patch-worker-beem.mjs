/* /beem on the push server: Beem, the helper in the corner of every screen.
 * The same tool loop as /ask (the tools move to module scope so both share
 * one list), a guide to the app written from the code, and the screen she
 * asked from. Nothing is deployed by this script - wrangler deploy is Asaf's. */
import fs from 'fs';
const F = 'push-server/src/worker.js';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n'); if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (s.split(a).length !== 2) { console.log('ANCHOR: ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

/* 1. the four data tools, lifted out of /ask unchanged */
const a0 = s.indexOf('      const TOOLS = [\n        {\n          name: \'get_day\',');
const a1 = s.indexOf('      ];\n', a0);
if (a0 < 0 || a1 < 0) { console.log('no TOOLS'); process.exit(1); }
const body = s.slice(a0 + '      const TOOLS = '.length, a1 + '      ]'.length);
s = s.slice(0, a0) + '      const TOOLS = ASK_TOOLS;' + s.slice(a1 + '      ];'.length);
const lifted = body.split('\n').map((l, i) => (i === 0 ? l : l.replace(/^ {6}/, ''))).join('\n');

const GUIDE = fs.readFileSync('push-server/beem-guide.md', 'utf8').trim();
if (/`|\$\{/.test(GUIDE)) { console.log('guide has a backtick or ${'); process.exit(1); }

rep(`export default {\n`, `/* The tools /ask and /beem both offer. Defined here rather than accepted
   from the client, so neither can be driven as a general purpose model. */
const ASK_TOOLS = ${lifted};

/* What Beem knows about the app. Written from the code on 21 Oct 2026, not
   from memory - every button named here is one the app really draws. The
   labels are the Hebrew ones; in any other language Beem names the thing by
   what it does instead. Keep it true: a confident wrong instruction is worse
   than "I don't know yet". */
const BEEM_GUIDE = \`${GUIDE}\`;
const BEEM_SCREENS = { home: 'the home screen', me: 'the Me screen', nutrition: 'Nutrition', fitness: 'Fitness',
  hobbies: 'Hobbies', people: 'People', planning: 'Planning', closet: 'the Closet', insights: 'Insights', endofday: 'End of day' };

export default {\n`);

/* 2. the endpoint, beside /ask */
rep(`    if (url.pathname === '/ask' && req.method === 'POST') {`, `    /* ── /beem ───────────────────────────────────────────────────────────
       Beem, the small sun who lives in the corner of every screen, answering
       "how do I..." from the guide above and "how much did I..." from her own
       log through the same tools as /ask. The app sends the screen she asked
       from, her name and form of address, and today's date by the app's own
       clock (the day ends at 04:00, so the server's date is not it).

       Secrets: AI_KEY or GEMINI_KEY. Optional: BEEM_DAILY_CAP (80/IP/day). */
    if (url.pathname === '/beem' && req.method === 'POST') {
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'beem is not configured' }, 503);
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const messages = Array.isArray(b && b.messages) ? b.messages : [];
      if (!messages.length) return json({ error: 'nothing to ask' }, 400);
      if (messages.length > 40) return json({ error: 'too long' }, 400);
      if (JSON.stringify(messages).length > 60000) return json({ error: 'too long' }, 400);

      const cap = Number(env.BEEM_DAILY_CAP || 80);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'bq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const lang = langName(b && b.lang);
      const screen = BEEM_SCREENS[String((b && b.screen) || '')] || 'the home screen';
      const name = String((b && b.name) || '').replace(/[^\\p{L}\\p{M} '\\-]/gu, '').trim().slice(0, 24);
      const form = (b && b.form) === 'f' ? 'f' : (b && b.form) === 'm' ? 'm' : '';
      const today = /^\\d{4}-\\d{2}-\\d{2}$/.test(String((b && b.today) || '')) ? b.today : day;

      const SYSTEM =
        'You are Beem, a small warm sun who lives in the corner of every screen of\\n' +
        'Better Me, a personal app for nutrition, fitness, people, planning, hobbies,\\n' +
        'clothes, reflection and an end-of-day summary. You are the app\\'s helper.\\n' +
        'Write everything in ' + lang + '.' +
        (lang === 'Hebrew' ? ' Address the user in the ' + (form === 'f' ? 'feminine' : 'masculine') + ' singular; you yourself are masculine.' : '') +
        (name ? ' Their name is ' + name + '; use it rarely.' : '') + '\\n' +
        'They opened you from ' + screen + '. Today, by the app\\'s clock, is ' + today + '.\\n' +
        '\\n' +
        'HOW-TO QUESTIONS are answered ONLY from the guide below. Name the real\\n' +
        'button and where it is. The labels in the guide are Hebrew; if you are not\\n' +
        'writing Hebrew, describe the button by what it does and where it sits rather\\n' +
        'than quoting Hebrew. If the guide does not cover it, say plainly that you do\\n' +
        'not know that one yet - never invent a button, a setting or a feature.\\n' +
        '\\n' +
        'QUESTIONS ABOUT THEIR OWN FOOD use the tools, and every number you state must\\n' +
        'have come back from a tool in this conversation - never estimate one from\\n' +
        'your own knowledge. You have no access to their workouts, people, plans or\\n' +
        'summaries; say so if asked, and tell them where in the app to look.\\n' +
        '\\n' +
        'Be brief and kind: one to four short sentences, no lists unless steps are\\n' +
        'really needed, no preamble. You are a helper for this app: for anything else\\n' +
        'answer in one friendly sentence that it is outside what you can help with.\\n' +
        'Never give medical advice; for anything clinical, a doctor or a dietitian.\\n' +
        '\\n' +
        '=== GUIDE ===\\n' + BEEM_GUIDE;

      let r, detail = '';
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.AI_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 700, temperature: 0.3,
            system: SYSTEM, tools: ASK_TOOLS, messages: stripGemSig(messages),
          }),
        });
      } catch { r = null; }
      if (r && !r.ok) { try { detail = (await r.text()).slice(0, 200); } catch {} }
      let out = null;
      if (r && r.ok) { try { out = await r.json(); } catch { out = null; } }
      if (!out || !Array.isArray(out.content) || !out.content.length) {
        const g = await geminiTurn(SYSTEM, ASK_TOOLS, messages, 700);
        if (g) out = g;
      }
      if (!out) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, detail, gem_why: gemWhy }, 502)
          : json({ error: 'could not reach the model', gem_why: gemWhy }, 502);
      }
      return json({ ok: true, stop_reason: out.stop_reason || '', content: Array.isArray(out.content) ? out.content : [] });
    }

    if (url.pathname === '/ask' && req.method === 'POST') {`);
fs.writeFileSync(F, CR ? s.replace(/\n/g, '\r\n') : s);
console.log('worker patched');
