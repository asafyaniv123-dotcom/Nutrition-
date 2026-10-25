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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',   // Authorization: the admin read
};

/* The FIRST BALANCED object, not everything between the outermost braces.
   /\{[\s\S]*\}/ is greedy: a model that answers, then adds "Wait, let me
   correct that" and a second object, produced one span from the first brace
   to the last and JSON.parse refused all of it - the request failed as
   "unreadable" when a perfectly good answer was sitting in front of it.
   Strings are tracked as strings, because a brace inside a food name is not
   a brace. */
/* ── ANTHROPIC'S TOOL PROTOCOL <-> GEMINI'S ──
   Pure, and exported at the bottom, so a whole multi-turn exchange can be
   driven in node with no network. */

/* Gemini's signatures, out. They live on tool_use blocks so the app can carry
   them without knowing, and Anthropic must never be handed a block with an
   unknown field in it - which matters precisely because the provider can
   change mid-conversation, on a history that already has them. */
function stripGemSig(messages) {
  return (Array.isArray(messages) ? messages : []).map((m) => {
    if (!m || !Array.isArray(m.content)) return m;
    return {
      ...m,
      content: m.content.map((b) => {
        if (!b || b.type !== 'tool_use' || !b._gem_sig) return b;
        const { _gem_sig, ...rest } = b;
        return rest;
      }),
    };
  });
}

/* tools -> functionDeclarations. The only real difference is the name of the
   schema field; Gemini reads the same JSON Schema underneath. */
function toGeminiTools(tools) {
  const decl = (Array.isArray(tools) ? tools : []).map((t) => ({
    name: t.name,
    description: t.description || '',
    parameters: t.input_schema || { type: 'object', properties: {} },
  }));
  return decl.length ? [{ functionDeclarations: decl }] : undefined;
}

/* A tool-call id that decodes. Gemini matches results to calls by NAME and
   has no id of its own, so the name is carried inside the id the app is
   handed - and read back out when the app returns it on a tool_result. The
   worker keeps no state between turns and does not need to. */
function geminiCallId(name, i) { return 'gem:' + name + ':' + i; }
function nameFromCallId(id) {
  const m = /^gem:([^:]+):/.exec(String(id || ''));
  return m ? m[1] : '';
}

/* messages -> contents. Roles are renamed, content blocks become parts, and a
   tool_result finds its function's name through the id it carries. */
function toGeminiContents(messages) {
  const out = [];
  for (const msg of Array.isArray(messages) ? messages : []) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const blocks = Array.isArray(msg.content)
      ? msg.content
      : [{ type: 'text', text: String(msg.content || '') }];
    const parts = [];
    for (const b of blocks) {
      if (!b) continue;
      if (b.type === 'text' && b.text) parts.push({ text: b.text });
      else if (b.type === 'tool_use') {
        const part = { functionCall: { name: b.name, args: b.input || {} } };
        /* the signature Gemini gave us, returned unread */
        if (b._gem_sig) part.thoughtSignature = b._gem_sig;
        parts.push(part);
      } else if (b.type === 'tool_result') {
        /* An OBJECT, not the string the app sent. Anthropic takes the result
           as text; Gemini reads response as structured data, and handing it
           a quoted blob gets a model squinting at its own answer. */
        let value = b.content;
        if (typeof value === 'string') {
          try { value = JSON.parse(value); } catch { value = { result: value }; }
        }
        if (value === null || typeof value !== 'object') value = { result: value };
        parts.push({
          functionResponse: { name: nameFromCallId(b.tool_use_id), response: value },
        });
      }
    }
    if (parts.length) out.push({ role, parts });
  }
  return out;
}

/* And back: one Gemini candidate becomes the content array and stop_reason
   the app already knows how to read. */
function fromGeminiContent(candidate) {
  const parts = (((candidate || {}).content) || {}).parts || [];
  const content = [];
  let calls = 0;
  for (const p of parts) {
    if (p && p.text) content.push({ type: 'text', text: p.text });
    else if (p && p.functionCall) {
      const block = {
        type: 'tool_use',
        id: geminiCallId(p.functionCall.name, calls++),
        name: p.functionCall.name,
        input: p.functionCall.args || {},
      };
      /* Gemini signs its function calls and demands the signature back when
         the call is echoed in a later turn. Anthropic's protocol has nowhere
         to put it, so it rides inside the block - which works because the app
         hands the content array back verbatim without reading it. */
      const sig = p.thoughtSignature || p.thought_signature;
      if (sig) block._gem_sig = sig;
      content.push(block);
    }
  }
  /* The app branches on tool_use blocks being PRESENT rather than on this
     string, but it goes back honestly anyway. */
  return { content, stop_reason: calls ? 'tool_use' : 'end_turn' };
}

/* An estimate the app can show, or nothing at all.
   The same clamps and the same Atwater check /estimate applies to its own
   reply, in one place rather than two, because the moment two routes check
   the same thing separately they start disagreeing about it.
   Inconsistent arithmetic returns NULL rather than a low-confidence row: the
   app still has /estimate behind this, so refusing costs one round trip and
   buys never printing four macros that do not add up to their own calories. */
function cleanEst(e) {
  if (!e || typeof e !== 'object') return null;
  const num = (v, hi) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= hi ? Math.round(n * 10) / 10 : 0;
  };
  const src = e.per100 && typeof e.per100 === 'object' ? e.per100 : {};
  const per100 = {
    kcal: num(src.kcal, 900),
    p: num(src.p, 100),
    c: num(src.c, 100),
    f: num(src.f, 100),
  };
  if (!per100.kcal) return null;
  const calc = 4 * per100.p + 4 * per100.c + 9 * per100.f;
  if (!(calc > 0) || Math.abs(calc - per100.kcal) / per100.kcal > 0.35) return null;
  let serving = Number(e.serving_g);
  if (!Number.isFinite(serving) || serving <= 0 || serving > 3000) serving = 0;
  return { per100, serving_g: serving, assumed: String(e.assumed || '').slice(0, 240) };
}

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

/* is one of her people's birthdays today, and not yet sent? 29 February
   falls on the 28th in the years without one, as it does in the app */
function bdayDue(rec, now) {
  if (!rec.bdays || !rec.bdays.length || rec.bdayLast === now.date) return false;
  const y = +now.date.slice(0, 4), md = now.date.slice(5);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  return rec.bdays.includes(md) || (!leap && md === '02-28' && rec.bdays.includes('02-29'));
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
async function latinTerm(q, tag, env, fetch = globalThis.fetch) {
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

/* The tools /ask and /beem both offer. Defined here rather than accepted
   from the client, so neither can be driven as a general purpose model. */
/* The chat's tools. Reads are answered by the phone from its own storage;
   writes are PROPOSALS - the phone shows each as a card and writes only when
   the person confirms. Names (people, hobbies, exercises, topics) must be
   ones a read returned. */
const ACT_READS = [
  { name: 'get_plan', description: "The person's day plan: items with their time if they have one. Use for anything about what is on today, tomorrow or a date.",
    input_schema: { type: 'object', properties: { date: { type: 'string', description: 'YYYY-MM-DD, or "today" / "tomorrow".' } }, required: ['date'] } },
  { name: 'get_fitness', description: "Fitness: today's planned workout, the week plan, the person's programs with their exercises, recent workouts with their sets, personal records, current working weights. Read it before logging a set, so the exercise name is the one they use.",
    input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_hobbies', description: 'Hobbies: each with how it is tracked (time in minutes, a count, or done), today\'s amount, the last 7 days, and the target.',
    input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_people', description: 'People: name, relationship, how often they want to be in touch, days since last contact, whether that is overdue, important dates in the next 14 days, recent notes.',
    input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_closet', description: 'The closet: how many garments per category, saved looks, whether something was marked worn today, and how many garments were not worn in 30 days.',
    input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_insights', description: 'Insights: the topics, each with its questions (by index) and how many answers are written.',
    input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_evening', description: "Tonight's end-of-day summary: which questions are asked, which are already answered, and whether the summary is finished.",
    input_schema: { type: 'object', properties: {}, required: [] } },
];
const ACT_WRITES = [
  { name: 'log_food', description: 'Anything they ate or drank other than plain water: hand their own words to the nutrition coach, which logs it and asks what it needs.',
    input_schema: { type: 'object', properties: { text: { type: 'string', description: 'Their words about the food, unchanged.' } }, required: ['text'] } },
  { name: 'add_task', description: 'Put something in the day plan. Give a time only if they said one.',
    input_schema: { type: 'object', properties: { text: { type: 'string' }, date: { type: 'string', description: 'YYYY-MM-DD' }, time: { type: 'string', description: 'HH:MM, 24h, or empty' } }, required: ['text', 'date'] } },
  { name: 'log_set', description: 'Log sets of an exercise done today. weight is what they said, in the unit they said; 0 for bodyweight.',
    input_schema: { type: 'object', properties: { exercise: { type: 'string' }, sets: { type: 'integer' }, reps: { type: 'integer' }, weight: { type: 'number' }, unit: { type: 'string', enum: ['kg', 'lb'] } }, required: ['exercise', 'sets', 'reps', 'weight', 'unit'] } },
  { name: 'add_steps', description: "Record today's steps.", input_schema: { type: 'object', properties: { steps: { type: 'integer' } }, required: ['steps'] } },
  { name: 'add_water', description: 'Add plain water drunk today, in millilitres.', input_schema: { type: 'object', properties: { ml: { type: 'integer' } }, required: ['ml'] } },
  { name: 'weigh_in', description: "Record today's body weight.", input_schema: { type: 'object', properties: { weight: { type: 'number' }, unit: { type: 'string', enum: ['kg', 'lb'] } }, required: ['weight', 'unit'] } },
  { name: 'hobby_log', description: "Add to a hobby today. amount is minutes for a time hobby, a number for a count hobby, 1 for a done hobby. The hobby must be one get_hobbies returned.",
    input_schema: { type: 'object', properties: { hobby: { type: 'string' }, amount: { type: 'number' } }, required: ['hobby', 'amount'] } },
  { name: 'log_contact', description: 'They were in touch with someone today. The person must be one get_people returned.',
    input_schema: { type: 'object', properties: { person: { type: 'string' }, via: { type: 'string', enum: ['message', 'call', 'meeting', 'video', 'other'] } }, required: ['person', 'via'] } },
  { name: 'person_note', description: "Something to remember about a person, kept on their page. The person must be one get_people returned.",
    input_schema: { type: 'object', properties: { person: { type: 'string' }, text: { type: 'string' } }, required: ['person', 'text'] } },
  { name: 'save_insight', description: 'Keep what they wrote as an answer to an insights question. topic and question index from get_insights.',
    input_schema: { type: 'object', properties: { topic: { type: 'string' }, question: { type: 'integer' }, text: { type: 'string' } }, required: ['topic', 'question', 'text'] } },
  { name: 'evening_answer', description: "Answer one of tonight's end-of-day questions. question is its id from get_evening; for the song, text is the song and artist the artist.",
    input_schema: { type: 'object', properties: { question: { type: 'string' }, text: { type: 'string' }, artist: { type: 'string' } }, required: ['question', 'text'] } },
  { name: 'add_moment', description: 'A moment from today worth remembering.', input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
  { name: 'add_journal', description: "A line for today's journal.", input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
];
const ASK_TOOLS = [
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

/* What Mip knows about the app. Written from the code on 21 Oct 2026, not
   from memory - every button named here is one the app really draws. The
   labels are the Hebrew ones; in any other language Mip names the thing by
   what it does instead. Keep it true: a confident wrong instruction is worse
   than "I don't know yet". */
const BEEM_GUIDE = `GENERAL
- When the day ends: the app's day ends at 04:00, not midnight. Anything logged at 1 a.m. counts toward the evening before. The date at the top follows the same rule.
- Data: there is no account and no sign-in. Everything is saved on the phone; the backup in settings is how to keep a copy. There is no support team or help desk to refer anyone to - you are the help. Some features send text or photos to the app's server to understand them: the home command line, the nutrition coach, the planning box, the planner, food photos and the weekly summary. Offline they show "אין חיבור כרגע". Some have a daily limit. Steps synced from a watch, shared workouts and reminder notifications also use the server.

HOME (Better)
- Greeting line at the top shows the name. Tap it to set or change the name, then שמור. With no name it shows "מי אתה?".
- The dial: the areas sit on a ring. Drag the ring to rotate it. Tap an area to turn it to the notch and open it. The ring is also a 24-hour clock: it glows amber from 06:00 until now, and today's planned items appear as coloured dots (faded once their time has passed).
- Centre button "סיום יום" (end of day): always on the dial; opens the end-of-day summary and fills with light as tonight's questions are answered. Every area being tracked feeds it.
- Streak: shown under the dial; tap it for the last 14 days and the rules.
- Command line ("מה אכלת, מה לזכור, מה לעשות…"): type, or tap the mic and speak (tap again to stop), then tap the arrow.
  - Food opens Nutrition and sends the sentence to the coach.
  - "Open X" goes straight to that area.
  - Anything else shows an editable card; nothing is saved until הוסף (or ביטול to cancel).
  - Where things land: a task goes to Planning (today or the date said, at the time said); something to remember from today goes to the end-of-day moments; a journal line to today's journal; a note about a person to that person's page (they must already be in People); a goal to Hobbies; water to Nutrition; steps to Fitness; a book quote to "הספר שלי" (needs a book open).
  - Several things in one sentence give one list ("להוסיף את כל אלה?"); remove any with ×. If unsure it offers "לשמור כרגע מהיום".
- Next-item card: what is on now or next today, plus a count of notes to remember. Tap it to open Planning.
- The ☰ button (top) opens "מה במעקב": tick the areas that should show on the dial (hiding one deletes nothing; סיום יום is built in). The gear opens הגדרות (settings):
  - שפה: language, 11 languages
  - איך לפנות אליך: feminine or masculine form of address (Hebrew only)
  - תזכורת לסיכום יום: the daily end-of-day reminder. While it is off, the "בלי תזכורת" chip is lit; tap it to turn the reminder on (default 21:00). While it is on, a time field appears under the title: change the hour right there. Tapping "בלי תזכורת" again turns it off. It comes as a phone notification and a banner in the app, and is skipped if the day was already summarised.
  - מדינה: which country's products food search uses
  - יחידות מידה: metric or imperial
  - גיבוי (backup), at the bottom of settings: a line saying when the last export was (or that there has been none), and two chips. ייצוא (export) opens "הגיבוי מוכן" with everything that was logged: copy it all, share it as a file, and a full backup with the photos when there are any. Keep it somewhere that outlives the phone - a message to yourself, an email, a cloud note. ייבוא (import) picks a backup file and restores it.
  - סיימתי closes the menu.
- Bottom bar: Better = home (tap again inside an area to go home); the middle book icon = Journal; Me = the stats screen.
- Mip (you) sits in the top corner of every screen; tapping him opens this chat.

NUTRITION (תזונה)
- Tabs: יומי (today), היסטוריה (history), מתכונים (recipes), אישי (personal). Arrows at the top move the food log to another day.
- יומי: bars against the targets and how much is left. Water card (if water tracking is on): tap the drop for the +amount buttons; ↺ resets. Coach chat ("מה אכלת? אפשר גם לשאול"): type what you ate or ask a question; the camera button attaches photos; the arrow sends. The coach logs the food and may ask a follow-up. Hold a message that logged food to edit or delete it. "ארוחות היום" groups meals by type; tap a type to see its items. There is no mic in the coach chat; for voice use the mic on the home command line.
- Weigh-ins: in אישי, "מה המעקב שלי כולל", turn on שקילות, then choose how often, which days, whether to hide the number (only the trend shows) and a goal weight. Log a weigh-in by telling the coach, e.g. "שקלתי 72.4".
- אישי also has the personal details, activity level and goal; "יעד מומלץ" with "עדכן את היעדים לפי זה" to apply it or "חזרה ליעדים המקוריים"; and "ההרגלים שלי" (e.g. cooking without oil), which the coach uses. Until the personal details are filled in, the daily target is a general starting one.
- היסטוריה: the last 7 days, as צריכה יומית, גרעון אמיתי or מצטבר.
- מתכונים: "+ מתכון" adds a recipe.

FITNESS (כושר)
- The first visit asks a few setup questions (goal, days a week, time, experience, where you train, limits, a note); "אחר כך" postpones them for today. From them it builds a plan.
- The hub: a week strip, then אימון חדש (start a workout; join a shared workout by QR; steps; programs: "בנה לי תוכנית" generates one, "+ תוכנית" adds a gym program), אימון שנבנה לך (a workout built from what is missing this week), סטופר וטיימרים (stopwatch, EMOM, Tabata, intervals), אימונים שאהבתי (saved workout video links), מעקב משקלים (weights per exercise; personal records come from here), לוז האימונים (schedule), המספרים שלי (stats), צעדים (steps), היסטוריה. "המטרה שלי" (training goal) is at the bottom of the hub.

HOBBIES (תחביבים)
- + in the hobby row adds a hobby; choose how to track it: זמן (time), כמות (count with a target) or בוצע (done).
- The big card does the main action: start/stop the timer, add one, or mark done. "הוסף זמן ליום" edits any day by hand. "הוסף תת-נושא" adds sub-topics (tapping one starts a timer on it). עריכה changes colour or tracking type, or deletes.

PEOPLE (האנשים שלי)
- "+ הוסף אדם": name, relationship, where you know them from, notes, "כל כמה זמן תזכורת?" (how often to be reminded) and "+ תאריך חשוב".
- Reminders show inside the app: whoever is overdue appears at the top ("אולי הגיע הזמן לבדוק מה שלום..."), and dates within 14 days are listed.
- On a person's page: tap הודעה, שיחה, פגישה… to log contact; "+ משהו שאני רוצה לזכור" adds a note.

PLANNING (תכנון זמן)
- The top box takes a sentence like "כל רביעי 9–10 מדיטציה" and adds it, repeats included.
- "מתכנן" (planner): describe the week and get a schedule.
- Sections: החודש, השבוע, היום. In the day view change day with the arrows or a swipe; write an item under "רק ליום הזה", then drag it to an hour.

CLOSET (הארון שלי)
- Each clothing type has its own row; roll the rows to build a look. + adds photos, then crop, with background removal.
- Tap a garment: how many times it was worn in the last 30 days, and הסר רקע, ערוך, הסר.
- Buttons: גלגל הכל (shuffle), שמור לוק (save look), לבשתי את זה היום (wore it today), הלוקים שלי (saved looks: share, ללבוש, delete).

INSIGHTS (תובנות)
- 7 topics: אני, רגשות ותודעה, אנשים, החיים, הצלחה ועשייה, העולם, בסוף המחברת. Pick a topic, a question, then write; entries are kept with their dates. Nothing is mandatory.

END OF DAY (סיום יום)
- Main button: התחל סיכום, המשך מאיפה שעצרת, or פתח שוב.
- Default evening questions: the best moment, a photo of the day, the song of the day, a sentence you took with you. "שאלות הערב" chooses which questions are asked every night from the bank (mood, body, day score, flow, planned vs actual, workout, what you take to tomorrow, gratitude and more). "מה נכנס לסיכום" switches sections on or off.
- Also: ולוג יומי (a short daily video), "דברים שאני רוצה לזכור" (today's moments), השבוע שלך / החודש שלך, ימים קודמים.
- Streak: a day counts only when its summary is finished; today stays open until then. One missed day uses the grace day and the streak continues; a second missed day in a row resets it. The grace day comes back after 7 summaries in a row.

JOURNAL (middle button)
- Today's page saves automatically; arrows go to earlier days; the search box finds words across everything written.

ME
- "הסיכום השבועי שלך מוכן" appears once a finished week has at least 2 summarised days; it opens pages moved through with הקודם/הבא.
- Also: the number of days summarised, צלילים (sounds on/off), calendar, vision board and book widgets, a range switch (שבוע / שבועיים / חודש), and charts: day score, steps, calories, "לאן הולך הזמן" and patterns.`;
const BEEM_SCREENS = { home: 'the home screen', me: 'the Me screen', nutrition: 'Nutrition', fitness: 'Fitness',
  hobbies: 'Hobbies', people: 'People', planning: 'Planning', closet: 'the Closet', insights: 'Insights', endofday: 'End of day' };

/* ── the meter ──
   What the model calls cost, per day and route, and which install asked. */
const METER_ROUTES = ['/act', '/parse', '/match', '/cross', '/plan', '/transcribe', '/say', '/route', '/schedule',
  '/beem', '/ask', '/estimate', '/see', '/vision', '/coach', '/week', '/analyze', '/off', '/health'];
function meterStart(req) {
  const url = new URL(req.url);
  const u = url.searchParams.get('u') || '';
  return { route: METER_ROUTES.includes(url.pathname) ? url.pathname : 'other',
    uid: /^[0-9a-f]{24}$/.test(u) ? u : '', dev: url.searchParams.get('d') === '1', calls: [], wait: [] };
}
async function meterFetch(u, init, M) {
  const s = typeof u === 'string' ? u : (u && u.url) || '';
  const prov = s.startsWith('https://api.anthropic.com/') ? 'a' : s.startsWith('https://generativelanguage.googleapis.com/') ? 'g' : '';
  if (!prov) return fetch(u, init);
  let model = '';
  if (prov === 'a') { try { model = String(JSON.parse(init.body).model || ''); } catch {} }
  else { const mm = s.match(/models\/([^:/?]+)/); model = mm ? mm[1] : ''; }
  const c = { m: model.slice(0, 40) || '?', i: 0, o: 0, e: '' };
  M.calls.push(c);
  let r;
  try { r = await fetch(u, init); } catch (err) { c.e = 'net'; throw err; }
  const type = r.headers.get('content-type') || '';
  if (r.ok) {
    /* a stream is counted as a call; its tokens are in the stream, which
       is the person's, and reading a copy of it would hold it back */
    if (/json/.test(type)) M.wait.push(r.clone().json().then((j) => {
      const a = j && j.usage, g = j && j.usageMetadata;
      if (a) { c.i = (a.input_tokens || 0) + (a.cache_creation_input_tokens || 0) + (a.cache_read_input_tokens || 0); c.o = a.output_tokens || 0; }
      if (g) { c.i = g.promptTokenCount || 0; c.o = (g.candidatesTokenCount || 0) + (g.thoughtsTokenCount || 0); }
    }).catch(() => {}));
  } else {
    c.e = 'http' + r.status;
    M.wait.push(r.clone().text().then((t) => {
      if (/credit balance/i.test(t)) c.e = 'credit';
      else if (r.status === 429 && /quota/i.test(t)) c.e = 'quota';
      else if (r.status === 529 || /overloaded/i.test(t)) c.e = 'overloaded';
    }).catch(() => {}));
  }
  return r;
}
async function meterSave(env, M) {
  await Promise.all(M.wait);
  const key = 'mt:' + new Date().toISOString().slice(0, 10) + ':' + M.route;
  let rec = {};
  try { rec = JSON.parse((await env.SUBS.get(key)) || '{}') || {}; } catch { rec = {}; }
  const add = (o, c) => { o.n = (o.n || 0) + 1; o.i = (o.i || 0) + c.i; o.o = (o.o || 0) + c.o; if (c.e) o.f = (o.f || 0) + 1; };
  rec.t = rec.t || {}; rec.m = rec.m || {}; rec.e = rec.e || {}; rec.u = rec.u || {};
  for (const c of M.calls) {
    add(rec.t, c);
    add(rec.m[c.m] = rec.m[c.m] || {}, c);
    if (c.e) rec.e[c.e] = (rec.e[c.e] || 0) + 1;
    const who = M.uid || (M.dev ? 'dev' : 'anon');
    if (rec.u[who] || Object.keys(rec.u).length < 500) {
      add(rec.u[who] = rec.u[who] || {}, c);
      if (M.dev) rec.u[who].d = true;
    }
  }
  if (rec.e.credit) rec.lastCredit = new Date().toISOString();
  await env.SUBS.put(key, JSON.stringify(rec), { expirationTtl: 120 * 86400 });
}

export default {
  /* ctx is here for one reason: a streaming response returns while its writer
     is still running, and the runtime cancels pending work once the request is
     done unless waitUntil holds it. Without it /say answered in two chunks and
     stopped mid-word. */
  async fetch(req, env, ctx) {
    const M = meterStart(req);
    try { return await routeRequest(req, env, ctx, M); }
    finally { if (M.calls.length) ctx.waitUntil(meterSave(env, M)); }
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

        /* BIRTHDAYS (25.10): the people she keeps, as bare dates - the names
           never leave her phone; the service worker writes them in. One push
           on such a day, at bdayTime, separate from the evening reminder. */
        if (bdayDue(rec, now)) {
          const late = toMin(now.hhmm) - toMin(rec.bdayTime || '09:00');
          if (late >= 0) {
            if (late <= LATE_WINDOW_MIN) {
              const res = await sendPush(rec.endpoint, env);
              if (res.status === 404 || res.status === 410) { await env.SUBS.delete(k.name); continue; }
            }
            rec.bdayLast = now.date;
            await env.SUBS.put(k.name, JSON.stringify(rec));
          }
        }

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

/* ── /route, THE PURE HALF ──
   The model's answer is a suggestion, not an instruction. Everything it can
   name is checked against what the app actually has: a person it names must
   be one the app sent, a date must be a date, a number must be a sane number.
   Anything that fails comes back empty rather than guessed at, because the
   app shows this to the person before writing it - and a wrong field on that
   card is worse than an empty one. */
const ROUTE_INTENTS = ['food', 'water', 'quote', 'moment', 'journal', 'task',
  'person_note', 'steps', 'goal', 'open', 'unknown'];
const ROUTE_AREAS = ['nutrition', 'fitness', 'hobbies', 'endofday', 'insights',
  'people', 'planning', 'closet', 'journal', ''];
function routeClean(o, people) {
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const int = (v, lo, hi) => { const x = Math.round(Number(v)); return isFinite(x) && x >= lo && x <= hi ? x : 0; };
  const out = {
    intent: ROUTE_INTENTS.includes(o && o.intent) ? o.intent : 'unknown',
    text: str(o && o.text, 1000),
    person: '',
    // round-tripped: Date rolls 2026-02-30 over into March without a word
    date: (/^\d{4}-\d{2}-\d{2}$/.test(o && o.date) &&
           new Date(o.date + 'T12:00:00Z').toISOString().slice(0, 10) === o.date) ? o.date : '',
    time: '',
    amount: 0,
    page: int(o && o.page, 0, 100000),
    area: ROUTE_AREAS.includes(o && o.area) ? o.area : '',
  };
  const tm = /^(\d{1,2}):(\d{2})$/.exec(String((o && o.time) || ''));
  if (tm && +tm[1] < 24 && +tm[2] < 60) out.time = tm[1].padStart(2, '0') + ':' + tm[2];
  // a person is only ever one the app already knows, matched without case
  const want = str(o && o.person, 60).toLowerCase();
  if (want) for (const p of people || []) if (String(p).toLowerCase() === want) { out.person = p; break; }
  if (out.intent === 'water') out.amount = int(o && o.amount, 1, 5000);
  if (out.intent === 'steps') out.amount = int(o && o.amount, 1, 200000);
  if (out.intent === 'person_note' && !out.person) out.intent = 'unknown';
  if (out.intent === 'open' && !out.area) out.intent = 'unknown';
  if (['quote', 'moment', 'journal', 'task', 'person_note', 'goal', 'food'].includes(out.intent) && !out.text)
    out.intent = 'unknown';
  if ((out.intent === 'water' || out.intent === 'steps') && !out.amount) out.intent = 'unknown';
  return out;
}

/* ── /schedule, THE PURE HALF ──
   Same rule as routeClean: the model suggests, this decides what reaches the
   card. Weekdays are 0 (Sunday) to 6, times are HH:MM, an end before its start
   is no end, a weekly entry with no day takes its date's day or is dropped,
   and a one-off with no date is today's. A last day (until) belongs only to
   a repeat and never comes before its first; a removal whose span is empty
   is dropped rather than widened. */
const SCHED_REPEATS = ['none', 'weekly', 'daily'];
function scheduleClean(o, today) {
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const hm = (v) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || ''));
    return m && +m[1] < 24 && +m[2] < 60 ? m[1].padStart(2, '0') + ':' + m[2] : '';
  };
  // round-tripped, because Date rolls 2026-02-30 over into March without a word
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '') &&
    new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v;
  const day0 = isDate(today) ? today : '';
  const out = [];
  for (const it of ((o && Array.isArray(o.items)) ? o.items : []).slice(0, 10)) {
    const text = str(it && it.text, 200);
    if (!text) continue;
    let repeat = SCHED_REPEATS.includes(it && it.repeat) ? it.repeat : 'none';
    let date = isDate(it && it.date) ? it.date : '';
    let days = [...new Set((Array.isArray(it && it.days) ? it.days : [])
      .map((d) => Math.round(Number(d))).filter((d) => d >= 0 && d <= 6))].sort();
    const start = hm(it && it.start);
    let end = start ? hm(it && it.end) : '';
    if (end && end <= start) end = '';
    if (repeat === 'daily') days = [0, 1, 2, 3, 4, 5, 6];
    if (repeat === 'weekly' && !days.length) {
      if (!date) continue;
      days = [new Date(date + 'T12:00:00Z').getUTCDay()];
    }
    if (repeat === 'none') { days = []; if (!date) date = day0; if (!date) continue; }
    const action = it && it.action === 'remove' ? 'remove' : 'add';
    let until = repeat !== 'none' && isDate(it && it.until) ? it.until : '';
    if (until && until < (date || day0)) {
      if (action === 'remove') continue;
      until = '';
    }
    out.push({ text, repeat, date, days, start, end, until, action });
  }
  return out;
}

/* What the app tells /schedule about the board, so "remove it" has something
   to point at. It came from a phone and goes into a prompt: every field is
   cut to a type and a size, and there are at most forty entries. */
function scheduleBoard(b) {
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
  const entries = ((b && Array.isArray(b.board)) ? b.board : []).slice(0, 40).map((e) => ({
    text: str(e && e.text, 80), from: isDate(e && e.from) ? e.from : '', to: isDate(e && e.to) ? e.to : '',
    n: Math.max(0, Math.min(999, Math.round(Number(e && e.n)) || 0)),
  })).filter((e) => e.text && e.from && e.to);
  const last = ((b && Array.isArray(b.last)) ? b.last : []).slice(0, 5).map((t) => str(t, 80)).filter(Boolean);
  return { entries, last };
}

/* WHAT ONE ITEM COMES TO, worked out here and not by the model. Two photos of
   one sushi plate and "I ate twice what's in the picture" came back as one
   plate of 9 pieces and two spoons of sauce - 490 kcal for what was about
   820. The model now says what ONE portion is and how many times it was
   eaten, and for food in pieces how many pieces and what one piece is; the
   multiplying happens here, where it cannot be skipped or done twice.
   Every figure is bounded, since it is written into her day. */
function coachTotals(it) {
  const num = (v, hi) => { const x = Number(v); return isFinite(x) && x > 0 && x <= hi ? x : 0; };
  const portions = num(it && it.portions, 20) || 1;
  const units = num(it && it.unit_count, 200), ku = num(it && it.kcal_per_unit, 3000);
  let k, p, c, f;
  if (units && ku) {
    k = ku * units;
    p = num(it.protein_per_unit, 300) * units;
    c = num(it.carbs_per_unit, 600) * units;
    f = num(it.fat_per_unit, 300) * units;
  } else {
    k = num(it && it.calories, 20000); p = num(it && it.protein, 2000);
    c = num(it && it.carbs, 4000); f = num(it && it.fat, 2000);
  }
  const r1 = (x) => Math.round(x * portions * 10) / 10;
  /* portions and units go back too: the app reads only the fields it knows,
     and a test can then see what the model counted, not just the product */
  return { calories: Math.round(k * portions), protein: r1(p), carbs: r1(c), fat: r1(f),
           portions, units: units && ku ? units : 0 };
}

/* ── A NUTRITION LABEL ──
   The columns as printed, the package weight, and what was eaten - as a
   fraction of the package or in grams. labelCompute decides which column to
   use (the package one for a fraction, per 100 g for grams), never mixes
   them, and checks the two columns against each other when both are there:
   per 100 g x weight / 100 must come within 5% of the package column. */
const LABEL_COL = { type: 'object', properties: { kcal: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fat: { type: 'number' } } };
function labelClean(l) {
  if (!l || typeof l !== 'object') return null;
  const n = (v, hi) => { const x = Number(v); return isFinite(x) && x >= 0 && x <= hi ? x : null; };
  const col = (c) => {
    if (!c || typeof c !== 'object') return null;
    const o = { kcal: n(c.kcal, 5000), p: n(c.protein, 1000), c: n(c.carbs, 1000), f: n(c.fat, 1000) };
    return o.kcal === null ? null : { kcal: o.kcal, p: o.p || 0, c: o.c || 0, f: o.f || 0 };
  };
  const o = { per100: col(l.per_100g), perPkg: col(l.per_package), package_g: n(l.package_weight_g, 10000) || 0,
    fraction: n(l.portion_fraction, 20) || 0, portion_g: n(l.portion_g, 10000) || 0 };
  return o.per100 || o.perPkg ? o : null;
}
function labelCompute(L) {
  const r1 = (x) => Math.round(x * 10) / 10;
  const out = (col, k, column, how) => ({ kcal: Math.round(col.kcal * k), p: r1(col.p * k), c: r1(col.c * k), f: r1(col.f * k), column, how });
  let mismatch = null;
  if (L.per100 && L.perPkg && L.package_g) {
    const expected = Math.round(L.per100.kcal * L.package_g / 100);
    if (L.perPkg.kcal && Math.abs(expected - L.perPkg.kcal) / L.perPkg.kcal > 0.05) mismatch = { expected, printed: L.perPkg.kcal };
  }
  let r = null;
  if (L.fraction > 0) {
    if (L.perPkg) r = out(L.perPkg, L.fraction, 'per_package', 'package column x ' + L.fraction);
    else if (L.per100 && L.package_g) r = out(L.per100, L.package_g / 100 * L.fraction, 'per_100g', 'per 100 g x ' + L.package_g + ' g / 100 x ' + L.fraction);
  } else if (L.portion_g > 0) {
    if (L.per100) r = out(L.per100, L.portion_g / 100, 'per_100g', 'per 100 g x ' + L.portion_g + ' g / 100');
    else if (L.perPkg && L.package_g) r = out(L.perPkg, L.portion_g / L.package_g, 'per_package', 'package column x ' + L.portion_g + ' / ' + L.package_g + ' g');
  }
  return Object.assign(r || { kcal: null, p: null, c: null, f: null, column: '', how: '' }, { mismatch });
}
/* what a logged item becomes when it came from a label: the code's figures,
   and the label data kept with it for the next question */
function labelItem(it) {
  const L = labelClean(it && it.label);
  if (!L) return {};
  const r = labelCompute(L);
  const keep = { per_100g: L.per100 && { kcal: L.per100.kcal, protein: L.per100.p, carbs: L.per100.c, fat: L.per100.f },
    per_package: L.perPkg && { kcal: L.perPkg.kcal, protein: L.perPkg.p, carbs: L.perPkg.c, fat: L.perPkg.f },
    package_weight_g: L.package_g || 0, portion_fraction: L.fraction || 0, portion_g: L.portion_g || 0 };
  if (r.mismatch) return { label: keep, label_mismatch: true };
  if (r.kcal === null) return { label: keep };
  return { calories: r.kcal, protein: r.p, carbs: r.c, fat: r.f, portions: 1, units: 0, label: keep };
}
/* the separate reading for a dispute: the label from scratch, from the
   picture and the stored data, without the coach's earlier reply */
async function labelRecheck(env, dsp, was, fetch = globalThis.fetch) {
  const content = [];
  if (dsp.image) content.push({ type: 'image', source: { type: 'base64', media_type: String(dsp.image.mime || 'image/jpeg'), data: String(dsp.image.data) } });
  content.push({ type: 'text', text:
    'Read this nutrition label from scratch, column by column, and fill read_label. Copy each column exactly as printed; never mix columns.\n' +
    'What they wrote when they logged it: "' + (dsp.said || '') + '"  - from that, the portion eaten: a fraction of the package, or grams.\n' +
    'The item as it was logged (it is disputed - it may be wrong): ' + JSON.stringify(was ? { name: was.name, quantity: was.quantity } : {}) + '\n' +
    (dsp.label ? 'Label data stored from the first reading (check it; it may hold the mistake): ' + JSON.stringify(dsp.label) + '\n' : '') +
    (dsp.image ? '' : 'There is no picture: work from the stored label data, and correct it only where it contradicts itself.') });
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': env.AI_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 700,
        system: 'You read nutrition labels for an app. You never answer the person; you only fill the tool.',
        tools: [{ name: 'read_label', description: 'The label, as printed, and the portion eaten.', input_schema: { type: 'object',
          properties: { per_100g: LABEL_COL, per_package: LABEL_COL, package_weight_g: { type: 'number' },
            portion_fraction: { type: 'number' }, portion_g: { type: 'number' } } } }],
        tool_choice: { type: 'tool', name: 'read_label' },
        messages: [{ role: 'user', content }] }),
    });
  } catch { return null; }
  if (!r.ok) return null;
  let d; try { d = await r.json(); } catch { return null; }
  const u = ((d && d.content) || []).find((c) => c && c.type === 'tool_use');
  return u ? labelClean(u.input) : null;
}

/* TODAY'S ACTIVITY, as the app sends it */
function actCtxClean(a) {
  if (!a || typeof a !== 'object') return null;
  const num = (v, lo, hi, d) => { const x = Number(v); return isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : d; };
  return {
    steps: num(a.steps, 0, 200000, 0), base: num(a.base, 0, 50000, 8000), kg: num(a.kg, 20, 400, 70), cm: num(a.cm, 100, 250, 170),
    strength: a.strength === true, cardio_min: num(a.cardio_min, 0, 600, 0),
    target: num(a.target, 0, 10000, 0), left: num(a.left, -20000, 20000, 0),
    ask: a.ask === true, asked: a.asked === true, has: a.has === true,
    now: /^\d{2}:\d{2}$/.test(String(a.now || '')) ? String(a.now) : '00:00',
  };
}
/* THE BONUS, in code. Steps over her baseline cost what the distance costs:
   ACSM's walking equation puts the net cost of level walking at 0.1 ml O2
   per kg per metre - about 0.5 kcal per kg per km - and the distance is
   steps x stride, the stride about 0.415 of her height. So a heavier body
   spends more on the same step and a shorter one less (a shorter stride),
   which a flat per-kg figure got wrong most for small people. 70 kg and
   170 cm when nothing is known. Then 200 for strength,
   300 an hour of cardio, at most 800; seventy percent of it as carbs and the
   rest as fat - protein does not move. The app computes the same thing
   (actBonus) for its own screen. */
const ACT = { kcalPerKgKm: 0.5, strideOfHeight: 0.415, strength: 200, cardioHour: 300, cap: 800, carbShare: 0.7 };
function activityBonus(a) {
  const km = Math.max(0, (a.steps || 0) - (a.base || 0)) * ACT.strideOfHeight * (a.cm || 170) / 100000;
  const steps = km * (a.kg || 70) * ACT.kcalPerKgKm;
  const raw = steps + (a.strength ? ACT.strength : 0) + (a.cardio_min || 0) / 60 * ACT.cardioHour;
  const kcal = Math.round(Math.min(ACT.cap, raw));
  return { kcal, carbs: Math.round(kcal * ACT.carbShare / 4), fat: Math.round(kcal * (1 - ACT.carbShare) / 9), capped: raw > ACT.cap };
}

/* the ADMIN_KEY secret, as a Bearer token */
function adminOk(req, env) {
  const want = env.ADMIN_KEY || '';
  const got = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  return !!want && got.length === want.length && got === want;
}
/* which daily counters one coach turn is charged to, each with its cap */
function coachBuckets(o) {
  if (o.test) return [{ key: 'co:test:' + o.today, cap: o.testCap }];
  const uid = /^[0-9a-f]{24}$/.test(String(o.uid || '')) ? String(o.uid) : '';
  if (!uid) return [{ key: 'co:' + o.today + ':' + o.ip, cap: o.cap }];
  return [{ key: 'co:' + o.today + ':u:' + uid, cap: o.cap }, { key: 'co:' + o.today + ':n:' + o.ip, cap: o.ipCap }];
}

/* WHAT THE APP KNOWS ABOUT THE TREND, sent every turn while weigh-ins are
   tracked. trend_before_kg is the seven-day mean before today; for weekly
   weighers this week's other readings (sum, count) and last week's mean. */
function weighCtxClean(c) {
  if (!c || typeof c !== 'object') return null;
  const num = (v, lo, hi) => { const x = Number(v); return v !== null && v !== '' && v !== undefined && isFinite(x) && x >= lo && x <= hi ? Math.round(x * 100) / 100 : null; };
  const day = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '';
  return {
    mode: c.mode === 'weekly' ? 'weekly' : 'daily',
    hidden: c.hidden === true,
    trend_before_kg: num(c.trend_before_kg, 20, 400),
    week_sum_kg: num(c.week_sum_kg, 0, 2800), week_n: num(c.week_n, 0, 7),
    last_week_kg: num(c.last_week_kg, 20, 400),
    rate_kg_per_week: num(c.rate_kg_per_week, -10, 10),
    expected_kg_per_week: num(c.expected_kg_per_week, -10, 10),
    expected_vs_actual: c.expected_vs_actual === true,
    weeks_of_data: num(c.weeks_of_data, 0, 520),
    goal_kg: num(c.goal_kg, 20, 400),
    flags: (Array.isArray(c.flags) ? c.flags : []).slice(0, 2).map((f) => ({
      day: day(f && f.day),
      flags: (Array.isArray(f && f.flags) ? f.flags : []).filter((x) => WEIGH_FLAGS.indexOf(x) >= 0),
    })).filter((f) => f.day),
  };
}
/* today's weight against the trend, in code. Hidden: directions and
   differences only - no weight reaches the prompt. */
function weighResult(ctx, kg) {
  const r2 = (x) => (x === null || !isFinite(x) ? null : Math.round(x * 100) / 100);
  let change = null;
  if (ctx.mode === 'weekly') {
    const n = (ctx.week_n || 0) + 1, mean = ((ctx.week_sum_kg || 0) + kg) / n;
    if (ctx.last_week_kg !== null) change = mean - ctx.last_week_kg;
  } else if (ctx.trend_before_kg !== null) change = kg - ctx.trend_before_kg;
  const rate = ctx.rate_kg_per_week;
  const dir = rate !== null ? (rate < -0.1 ? 'down' : rate > 0.1 ? 'up' : 'flat')
    : change !== null ? (change < -0.2 ? 'down' : change > 0.2 ? 'up' : 'flat') : '';
  const o = {
    mode: ctx.mode, hidden: ctx.hidden,
    compared_with: ctx.mode === 'weekly' ? 'this week\'s mean against last week\'s' : 'the seven days before today',
    change_vs_trend_kg: r2(change), trend_direction: dir, rate_kg_per_week: rate,
    expected_kg_per_week: ctx.expected_kg_per_week, expected_vs_actual: ctx.expected_vs_actual,
    weeks_of_data: ctx.weeks_of_data, flags: ctx.flags,
  };
  if (!ctx.hidden) {
    o.today_kg = kg; o.trend_kg = ctx.trend_before_kg; o.goal_kg = ctx.goal_kg;
    o.to_goal_kg = ctx.goal_kg !== null ? r2(kg - ctx.goal_kg) : null;
  }
  return o;
}
/* any figure within three kilos of the weight, as she or the model wrote it */
function weighScrub(text, kg) {
  return String(text).replace(/(\d{2,3})(?:[.,](\d{1,2}))?\s*(?:ק"?ג|ק״ג|קילו(?:גרם)?|kg)?/g, (m, a, b) => {
    const v = Number(a + (b ? '.' + b : ''));
    return Math.abs(v - kg) <= 3 ? '' : m;
  }).replace(/\s{2,}/g, ' ').replace(/\s+([.,:;!?])/g, '$1').trim();
}

const WEIGH_FLAGS = ['sodium', 'carbs', 'alcohol', 'restaurant', 'late_meal', 'training'];

/* AN EDIT TOUCHES ONE ITEM. The app sent one id and will update one row, so
   whatever the model answers, what leaves here is an update of that id or
   nothing: an add would put a second copy of the food in her day. One item
   under another id is taken to be the one meant; several are not guessed. */
function coachEditOnly(action, items, ids) {
  ids = (Array.isArray(ids) ? ids : [ids]).map(String).filter(Boolean);
  let mine = items.filter((it) => ids.indexOf(it.id) >= 0);
  if (!mine.length && items.length === 1 && ids.length === 1) mine = [Object.assign({}, items[0], { id: ids[0] })];
  mine = mine.slice(0, ids.length);
  return mine.length && action !== 'delete' && action !== 'none'
    ? { action: 'update', items: mine } : { action: 'none', items: [] };
}

/* ONE CORRECTION, as the app reports it. It came from a phone and is kept for
   ninety days for Asaf to read, so every field has a type and a size. */
const CORR_TYPES = ['delete', 'swipe_edit', 'chat_edit', 'dispute'];
function corrClean(c) {
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const num = (v, lo, hi) => { const x = Number(v); return isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x * 10) / 10)) : 0; };
  const item = (m) => (m && typeof m === 'object') ? {
    id: str(m.id, 40), name: str(m.name, 120), amount: str(m.amount, 80), kcal: num(m.kcal, 0, 20000),
    p: num(m.p, 0, 2000), c: num(m.c, 0, 4000), f: num(m.f, 0, 2000), note: str(m.note, 200), kind: str(m.kind, 12),
  } : null;
  if (!c || CORR_TYPES.indexOf(c.type) < 0) return null;
  const ts = Number(c.ts);
  return {
    type: c.type, ts: isFinite(ts) && ts > 1.6e12 && ts < 4e12 ? Math.round(ts) : Date.now(),
    before: item(c.before), after: item(c.after), kcal_diff: num(c.kcal_diff, -20000, 20000),
    message: str(c.message, 600), photo: c.photo === true,
  };
}

/* An item whose protein, carbs and fat account for less than 60% of its
   calories is one whose macros were left out - the cottage that came back as
   119 kcal and 6.3 g of fat is 48%. Below 60 kcal it is not worth asking:
   a black coffee is honestly almost nothing. Returns the names, for the
   message that sends the reply back. */
function coachMacrosShort(items) {
  const out = [];
  for (const it of Array.isArray(items) ? items : []) {
    const k = Number(it && it.calories) || 0;
    if (k < 60) continue;
    const m = 4 * (Number(it.protein) || 0) + 4 * (Number(it.carbs) || 0) + 9 * (Number(it.fat) || 0);
    if (m < 0.6 * k) out.push(String(it.name || '').slice(0, 60) || 'an item');
  }
  return out;
}

/* ── /together, THE PURE HALF ──
   What one phone may tell the room about itself, and what the room holds.
   Everything here came from another person's phone, so every field is cut
   to a size and a type before it is stored or handed on. */
const TG_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // no 0/O, 1/I/L: it is read aloud and typed
function tgCode(rand) {
  let c = '';
  for (let i = 0; i < 6; i++) c += TG_ABC[Math.floor(rand() * TG_ABC.length) % TG_ABC.length];
  return c;
}
function tgPlan(p) {
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const ex = (p && Array.isArray(p.exercises) ? p.exercises : []).slice(0, 30).map((e) => ({
    name: str(e && e.name, 60),
    sets: Math.max(1, Math.min(20, Math.round(Number(e && e.sets)) || 3)),
    reps: str(e && e.reps, 12),
  })).filter((e) => e.name);
  return { name: str(p && p.name, 80), exercises: ex };
}
function tgMember(m) {
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const num = (v, hi) => { const x = Number(v); return isFinite(x) && x >= 0 && x <= hi ? Math.round(x * 10) / 10 : 0; };
  const ex = (m && Array.isArray(m.ex) ? m.ex : []).slice(0, 30).map((e) => ({
    n: str(e && e.n, 60),
    s: (Array.isArray(e && e.s) ? e.s : []).slice(0, 30).map((x) => [num(x && x[0], 1000), num(x && x[1], 1000)]),
  }));
  return { name: str(m && m.name, 24), ex, cur: Math.max(0, Math.min(29, Math.round(Number(m && m.cur)) || 0)),
           done: !!(m && m.done), mins: num(m && m.mins, 600) };
}

// Exported for the test harness; unused by the Worker runtime itself.
export { signJWT, localNow, toMin, subKey, b64url,
         toGeminiTools, toGeminiContents, fromGeminiContent, geminiCallId, nameFromCallId,
         stripGemSig, cleanEst, labelClean, labelCompute, labelItem, coachBuckets, actCtxClean, activityBonus, weighCtxClean, weighResult, weighScrub, routeClean, scheduleClean, scheduleBoard, coachTotals, coachEditOnly, corrClean, coachMacrosShort, tgCode, tgPlan, tgMember };

/* The request handler. Its first line is the meter: every model call below
   goes through it, see meterFetch. */
async function routeRequest(req, env, ctx, M) {
    const fetch = (u, init) => meterFetch(u, init, M);
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    /* Ask Gemini the same question with the same system prompt. Returns the
       raw text, or null - what a failure MEANS is the caller's business. */
    /* A question for Gemini, as PARTS - so the same one helper carries a
       sentence and a photograph. geminiText below is the text-only shape the
       three text routes already use, unchanged. */
    async function geminiAsk(system, parts, maxTokens, think, schema) {
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
              contents: [{ role: 'user', parts }],
              generationConfig: {
                maxOutputTokens: maxTokens || 1200,
                temperature: 0,
                /* Off for a sentence, ON for a photograph. /vision says why and
                   it is the only reason worth the cost: reading small print is
                   the one place in this app where the model has to look rather
                   than transcribe, and a misread label is simply a wrong
                   number. */
                ...(think ? {} : { thinkingConfig: { thinkingBudget: 0 } }),
                responseMimeType: 'application/json',
                /* A SCHEMA RATHER THAN A HOPE, where the caller has one.
                   responseMimeType alone still lets the model choose its own
                   field names, and every field is read by name on the way
                   out. Optional, so the routes that have not been given one
                   behave exactly as before. */
                ...(schema ? { responseSchema: schema } : {}),
              },
            }),
          },
        );
      } catch { return null; }
      if (!r.ok) return null;
      let j;
      try { j = await r.json(); } catch { return null; }
      const out = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      const text = out.map((p) => p.text || '').join('').trim();
      return text || null;
    }
    /* Why the last geminiTurn gave up. A failure that does not say why sent
       me looking in the wrong place for an hour this morning; a failure
       wearing the OTHER provider's reason is worse still. */
    let gemWhy = '';
    /* A whole tool-using turn, in Anthropic's shape on both sides. The app
       never learns which provider answered. */
    async function geminiTurn(system, tools, messages, maxTokens) {
      gemWhy = '';
      if (!env.GEMINI_KEY) { gemWhy = 'no gemini key'; return null; }
      let r;
      try {
        r = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: toGeminiContents(messages),
              tools: toGeminiTools(tools),
              generationConfig: {
                maxOutputTokens: maxTokens || 900,
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
                /* NO responseMimeType here. Asking for JSON and offering
                   tools at the same time is a contradiction: a tool call is
                   not JSON text, and the model has to be free to make one. */
              },
            }),
          },
        );
      } catch (e) { gemWhy = 'could not reach gemini'; return null; }
      if (!r.ok) {
        try { gemWhy = (await r.text()).slice(0, 300); } catch { gemWhy = 'gemini ' + r.status; }
        return null;
      }
      let j;
      try { j = await r.json(); } catch { gemWhy = 'gemini sent no json'; return null; }
      const cand = (j.candidates || [])[0];
      if (!cand) { gemWhy = 'gemini sent no candidate: ' + JSON.stringify(j).slice(0, 200); return null; }
      const out = fromGeminiContent(cand);
      if (!out.content.length) { gemWhy = 'gemini sent an empty turn: ' + JSON.stringify(cand).slice(0, 200); return null; }
      return out;
    }

    /* The text-only shape the three sentence routes use. */
    function geminiText(system, user, maxTokens, schema) {
      return geminiAsk(system, [{ text: user }], maxTokens, false, schema);
    }

    /* ── /together ────────────────────────────────────────────────────────
       Two people training side by side, each on their own phone. One opens a
       ROOM from the workout they are in and shows its code as a QR; the other
       scans it in the app and gets the same exercises. Each logs their own
       sets, sends them when they change, and reads the other's every few
       seconds; at the end both see the session together.

       No accounts and nothing permanent: a room is a code, a member is a
       random token only its own phone knows, and everything expires after a
       day. A member may write only its own record. At most six in a room.

       KV, keyed tg:<CODE> for the room and tg:<CODE>:<token> per member -
       one key per writer, so two phones never write the same key. The room
       holds its members' tokens itself: listing the prefix on every read
       would spend a list operation per poll, and the free plan allows a
       thousand a day - two people polling would use it up in an hour. KV is
       eventually consistent, so a partner's set can arrive up to a minute
       late; for "where is she up to" that is enough.

       Optional: TOGETHER_DAILY_CAP (default 600 requests/IP/day). */
    if (url.pathname.startsWith('/together/') && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const capKey = 'tgc:' + new Date().toISOString().slice(0, 10) + ':' + ip;
      const used = Number((await env.SUBS.get(capKey)) || 0);
      if (used >= Number(env.TOGETHER_DAILY_CAP || 600)) return json({ error: 'too many for today' }, 429);
      /* the cap is counted on writes only: reading the room every few
         seconds would spend a day's writes in an hour */
      const TTL = { expirationTtl: 86400 };
      const code = String((b && b.code) || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const token = String((b && b.token) || '').replace(/[^a-z0-9]/g, '').slice(0, 24);
      const rnd = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      const newToken = () => { let t = ''; while (t.length < 20) t += Math.floor(rnd() * 36).toString(36); return t; };
      const members = async (c, room, me) => {
        const out = [];
        for (const t of (room && Array.isArray(room.ms) ? room.ms : []).slice(0, 6)) {
          const v = await env.SUBS.get('tg:' + c + ':' + t);
          if (!v) continue;
          let m; try { m = JSON.parse(v); } catch { continue; }
          // tokens stay in the room; a phone is told only which record is its own
          out.push(Object.assign(tgMember(m), { me: !!me && t === me }));
        }
        return out;
      };

      if (url.pathname === '/together/open') {
        await env.SUBS.put(capKey, String(used + 1), { expirationTtl: 172800 });
        const plan = tgPlan(b && b.plan);
        if (!plan.exercises.length) return json({ error: 'no exercises' }, 400);
        let c = '';
        for (let i = 0; i < 5 && !c; i++) { const t = tgCode(rnd); if (!(await env.SUBS.get('tg:' + t))) c = t; }
        if (!c) return json({ error: 'try again' }, 503);
        const t = newToken();
        await env.SUBS.put('tg:' + c, JSON.stringify({ plan, at: Date.now(), ms: [t] }), TTL);
        await env.SUBS.put('tg:' + c + ':' + t, JSON.stringify(tgMember({ name: b && b.name })), TTL);
        return json({ ok: true, code: c, token: t, plan });
      }
      const roomRaw = code.length === 6 ? await env.SUBS.get('tg:' + code) : null;
      if (!roomRaw) return json({ error: 'no such room' }, 404);
      let room; try { room = JSON.parse(roomRaw); } catch { return json({ error: 'no such room' }, 404); }

      if (url.pathname === '/together/join') {
        await env.SUBS.put(capKey, String(used + 1), { expirationTtl: 172800 });
        const ms = Array.isArray(room.ms) ? room.ms : [];
        if (ms.length >= 6) return json({ error: 'room is full' }, 409);
        const t = newToken();
        await env.SUBS.put('tg:' + code + ':' + t, JSON.stringify(tgMember({ name: b && b.name })), TTL);
        room.ms = ms.concat([t]);
        await env.SUBS.put('tg:' + code, JSON.stringify(room), TTL);
        return json({ ok: true, code, token: t, plan: tgPlan(room.plan), members: await members(code, room, t) });
      }
      if (url.pathname === '/together/sync') {
        if (!token || !(Array.isArray(room.ms) && room.ms.includes(token))) return json({ error: 'not in this room' }, 403);
        if (b && b.me) {
          await env.SUBS.put(capKey, String(used + 1), { expirationTtl: 172800 });
          await env.SUBS.put('tg:' + code + ':' + token, JSON.stringify(tgMember(b.me)), TTL);
        }
        return json({ ok: true, code, plan: tgPlan(room.plan), members: await members(code, room, token) });
      }
      return json({ error: 'not found' }, 404);
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
      /* birthdays: MM-DD only. A caller that sends none (an older app, the
         service worker's resubscribe) keeps what was there. */
      const bdays = Array.isArray(b.bdays)
        ? [...new Set(b.bdays.filter(x => /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(String(x))))].slice(0, 400)
        : ((prev && prev.bdays) || []);
      const bdayTime = /^\d{2}:\d{2}$/.test(b.bdayTime || '') ? b.bdayTime : ((prev && prev.bdayTime) || '09:00');
      const rec = {
        endpoint: sub.endpoint,
        time: b.time,
        tz,
        bdays,
        bdayTime,
        bdayLast: (prev && prev.bdayLast) || '',
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
            headers: { 'User-Agent': 'Olimei/0.1 (personal nutrition app)' },
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
        via = await latinTerm(q, tag, env, fetch);
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
      /* EITHER provider. This still asked only about Anthropic, so a worker
         with no Anthropic key would 503 a question Gemini answers every time
         today. Same guard /match and /estimate already carry. */
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'parsing is not configured' }, 503);

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
        '{"items":[{"food":"","search_terms":["",""],"amount":1,"unit":"",\n' +
        '  "flags":{"powder":false,"cooked":false,"raw":false},\n' +
        '  "stated_by_user":null,"est":null}]}\n' +
        '- food: the food alone, in the language it was written, no quantity words.\n' +
        '- amount: a number. If none is given use 1.\n' +
        '- unit: one of g, unit, slice, cup, tbsp, tsp. Use "unit" for whole things\n' +
        '  (an egg, an apple, a roll) and "g" only when grams are actually stated.\n' +
        /* Measured: "חלה" with no quantity came back as one unit, and one
           unit of challah is a 500 g loaf. That is literally correct and
           nobody means it. Rice already had this right - it answers
           "1 cup" - because a cup is the obvious way to say a portion of
           rice and there was no obvious way to say a portion of bread. */
        '- A FOOD NORMALLY EATEN AS PART OF SOMETHING LARGER DEFAULTS TO THE\n' +
        '  PART, not the whole, when no quantity is given. "חלה" is one\n' +
        '  SLICE, not a 500 g loaf; so are bread, cake, pizza, watermelon and\n' +
        '  melon. Answer amount 1 and unit "slice". Keep "unit" for a thing\n' +
        '  eaten whole - an egg, an apple, a roll, a pot of yogurt - and use\n' +
        '  the whole thing only when they actually say so ("חלה שלמה").\n' +
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
        /* THE SHORTLIST IS BUILT BY STRING MATCHING, so a query in a script
           the tables do not use reaches nothing and this whole pipeline stops
           before the model can help: 鶏肉 found 0 of 7,240 rows. /match can
           already rescue that with terms, but only AFTER a failed round trip.
           Naming the words here means the first search is the right one. */
        '- search_terms: 2-4 words IN HEBREW that this food would be filed\n' +
        '  under in an official food table, best first. The tables are written\n' +
        '  in Hebrew whatever language the person types in, so this is the one\n' +
        '  thing a plain text search cannot do for itself. "Greek yogurt" is\n' +
        '  ["\u05d9\u05d5\u05d2\u05d5\u05e8\u05d8","\u05d9\u05d5\u05d2\u05d5\u05e8\u05d8 \u05d9\u05d5\u05d5\u05e0\u05d9"]; "\u05d7\u05e6\u05d9 \u05e1\u05e7\u05d5\u05e4 \u05d7\u05dc\u05d1\u05d5\u05df" is\n' +
        '  ["\u05d0\u05d1\u05e7\u05ea \u05d7\u05dc\u05d1\u05d5\u05df","\u05d7\u05dc\u05d1\u05d5\u05df \u05de\u05d9 \u05d2\u05d1\u05d9\u05e0\u05d4"]. Names only - no weights, no\n' +
        '  quantities, no descriptions. Give these for every item, including\n' +
        '  ones already written in Hebrew.\n' +
        /* The app decides whether a question is about a powder by scanning it
           for אבקה/אבקת/סקופ/powder/scoop. That is a word list, and a list is
           the thing that rots: "שייק חלבון" and "וויי אחרי אימון" both ask for
           a powder and match none of it. The flag is judgement instead.
           It does NOT switch a guard off - see the app side. */
        '- flags, about the food itself rather than the sentence:\n' +
        '  powder: true if this is a protein powder, a supplement, an isolate\n' +
        '    or any concentrate sold as a powder - INCLUDING when the words\n' +
        '    "\u05d0\u05d1\u05e7\u05d4" or "scoop" never appear ("\u05e9\u05d9\u05d9\u05e7 \u05d7\u05dc\u05d1\u05d5\u05df", "whey").\n' +
        '  cooked / raw: true only when the text actually says so. Both false\n' +
        '    when it does not; never guess from the food.\n' +
        /* A dish from a restaurant is not in any table and never will be, and
           the round trip to /estimate that follows is one we can already
           answer here. A plain ingredient is NOT this: the tables have it
           measured, and a guess would be replacing data with an opinion. */
        /* Measured on five plain foods that ARE in the tables, each asked
           twice: 3% mean error against the laboratory and 0% run to run.
           The portion guess moves the answer far more than that, so the
           tables were never the limiting factor here. */
        '- est FOR EVERY ITEM. Give your own figures for what was eaten:\n' +
        '  this is the free-text path and it is answered the way you would\n' +
        '  answer it in conversation, from what the food IS.\n' +
        '- EXCEPT WHEN THE PERSON NAMED A BRAND OR A SPECIFIC PRODUCT. Then\n' +
        '  leave est null. What they asked for is that product\u2019s declared\n' +
        '  figures, which are printed on the packet and are in the app\u2019s\n' +
        '  tables - and are exactly what you do NOT know. "\u05d9\u05d5\u05d2\u05d5\u05e8\u05d8" takes an\n' +
        '  est; "\u05d9\u05d5\u05d2\u05d5\u05e8\u05d8 \u05e4\u05e8\u05d5 \u05ea\u05e0\u05d5\u05d1\u05d4" does not.\n' +
        '- AND THE NAME STAYS GENERIC unless they named the brand. Never put\n' +
        '  \u05d0\u05e0\u05d2\u05f3\u05dc, \u05e9\u05d8\u05e8\u05d0\u05d5\u05e1, \u05ea\u05e0\u05d5\u05d1\u05d4 or any other company into food or into\n' +
        '  search_terms on your own account: "\u05d7\u05dc\u05d4" is "\u05d7\u05dc\u05d4".\n' +
        '  {"per100":{"kcal":0,"p":0,"c":0,"f":0},"serving_g":0,"assumed":""}\n' +
        '  per 100 g AS EATEN, what one portion weighs, and one short sentence\n' +
        '  naming what you took it to be. Keep the macros consistent with the\n' +
        '  energy: protein and carbohydrate about 4 kcal per gram, fat about 9.\n' +
        '  null for every other item.\n' +
        '- Never return calories, protein, carbohydrate or fat for an item\n' +
        '  that is NOT carrying est. You do not know them, and the app has the\n' +
        '  measured figures.\n' +
        '- No prose, no markdown fence, JSON only.';

      /* A SCHEMA RATHER THAN A HOPE, the same reason /vision gives: asking for
         JSON still lets the model choose its own field names, and every field
         below is read by name on the other side. Gemini-only, because it is
         the provider that can enforce it - but it enforces what the prompt
         already says to BOTH, so this is not a second contract. */
      const PSCHEMA = {
        type: 'OBJECT',
        properties: {
          items: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                food: { type: 'STRING' },
                search_terms: { type: 'ARRAY', items: { type: 'STRING' } },
                amount: { type: 'NUMBER' },
                unit: { type: 'STRING', enum: ['g', 'unit', 'slice', 'cup', 'tbsp', 'tsp'] },
                flags: {
                  type: 'OBJECT',
                  properties: {
                    powder: { type: 'BOOLEAN' },
                    cooked: { type: 'BOOLEAN' },
                    raw: { type: 'BOOLEAN' },
                  },
                  required: ['powder', 'cooked', 'raw'],
                },
                stated_by_user: {
                  type: 'OBJECT',
                  nullable: true,
                  properties: {
                    calories_kcal: { type: 'NUMBER', nullable: true },
                    protein_g: { type: 'NUMBER', nullable: true },
                    carbohydrates_g: { type: 'NUMBER', nullable: true },
                    fat_g: { type: 'NUMBER', nullable: true },
                  },
                },
                est: {
                  type: 'OBJECT',
                  nullable: true,
                  properties: {
                    per100: {
                      type: 'OBJECT',
                      properties: {
                        kcal: { type: 'NUMBER' }, p: { type: 'NUMBER' },
                        c: { type: 'NUMBER' }, f: { type: 'NUMBER' },
                      },
                      required: ['kcal', 'p', 'c', 'f'],
                    },
                    serving_g: { type: 'NUMBER' },
                    assumed: { type: 'STRING' },
                  },
                  required: ['per100', 'serving_g', 'assumed'],
                },
              },
              /* est IS REQUIRED, and nullable. Left out of this list the
                 model simply never emitted it: with a responseSchema it
                 fills what is required and skips what is optional, however
                 firmly the prompt asks. Required-and-nullable makes it
                 answer the question every time, with null when the answer
                 is no. */
              required: ['food', 'search_terms', 'amount', 'unit', 'flags', 'est'],
            },
          },
          meal_type: { type: 'STRING', enum: ['drink', 'snack', 'unspecified'] },
        },
        required: ['items', 'meal_type'],
      };

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
        const g = await geminiText(SYSTEM, text, 1400, PSCHEMA);
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
          /* A QUANTITY IS NOT A FOOD. "שייק חלבון 25 גרם של מולר" came back
             as the shake plus a second item called "25 גרם" - the leftover
             of a number the prompt correctly kept inside the product name.
             On screen that is a row with a red tag, one tap from being
             estimated into the day. The prompt rule is right and stays;
             this is the check behind it, because a rule the server cannot
             enforce holds only until the next model version. */
          if (/^[\d.,\s]*(?:g|kg|ml|l|oz|lb|גרם|גר|ק"ג|קג|מל|ליטר|כף|כפית|כוס|יחידה|יחידות|סקופ)?$/i.test(food)) return null;
          /* AND A DECLARED FIGURE IS NOT A FOOD. Measured over three runs,
             the model emits "25 גרם חלבון" as its own item in two of them.
             That one is worse than a bare "25 גרם" because it MATCHES: it
             finds a protein row and logs 25 g of powder nobody ate, which
             is the 137.5 g day arriving through a different door. The
             prompt says this belongs in stated_by_user, and the first item
             shows it was understood - the leftover is emitted anyway.
             Narrow on purpose: every real food carrying these words
             (אבקת חלבון, חלבון מי גבינה) begins with something but a digit. */
          if (/^[\d.,\s]+(?:g|גרם|גר|mg|מג)?\s*(?:של\s*)?(?:חלבון|חלבונים|protein|פחמימה|פחמימות|carb|carbs|carbohydrates?|שומן|שומנים|fat|קלוריות|קלוריה|calories|kcal|cal)$/i.test(food)) return null;
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
          /* THE WORDS TO SEARCH WITH. Cleaned like any other free text: a
             weight or a quantity smuggled in here would be searched for and
             find nothing, which is worse than sending nothing at all. */
          const terms = (Array.isArray(it && it.search_terms) ? it.search_terms : [])
            .map((t) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, 40))
            .filter((t) => t.length > 1)
            .slice(0, 4);
          /* Booleans, and never inferred from each other: cooked and raw are
             both false for a sentence that says neither, which is most of
             them. The app treats "said nothing" and "said no" identically
             here and must keep being able to. */
          const fl = (it && it.flags && typeof it.flags === 'object') ? it.flags : {};
          const flags = { powder: fl.powder === true, cooked: fl.cooked === true, raw: fl.raw === true };
          /* Through the SAME cleaner /match's est goes through - the clamps
             and the Atwater check in one place rather than three, because the
             moment they are written out separately they start disagreeing. */
          const est = cleanEst(it && it.est);
          return { food, search_terms: terms, amount, unit, flags, est,
                   stated_by_user: anySaid ? said : null };
        })
        .filter(Boolean)
        .slice(0, 20);

      /* ONE FOOD, SPLIT IN TWO. The model keeps trying to give the figure
         the person quoted an item of its own; with the two filters above
         closing the obvious shapes it emits a bare duplicate instead, and
         "שייק חלבון 25 גרם של מולר" came back as the same shake twice — one
         carrying said=25 and one carrying nothing. Logged, that is the
         shake counted twice.
         Collapsed only when name, amount AND unit all match: someone who
         really ate two writes "2 יוגורט", which is ONE item of amount 2.
         The survivor keeps whichever stated_by_user exists, because that
         figure sits on only one of the halves. */
      const seenItem = new Map();
      const merged = [];
      for (const it of items) {
        const k = it.food + "\u0000" + it.amount + "\u0000" + it.unit;
        const had = seenItem.get(k);
        if (!had) { seenItem.set(k, it); merged.push(it); continue; }
        if (!had.stated_by_user && it.stated_by_user) had.stated_by_user = it.stated_by_user;
        if (!had.search_terms.length && it.search_terms.length) had.search_terms = it.search_terms;
        if (!had.est && it.est) had.est = it.est;
        had.flags.powder = had.flags.powder || it.flags.powder;
      }

      return json({ ok: true, by, items: merged,
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

       Secrets: AI_KEY, GEMINI_KEY (either will do). Optional:
       MATCH_DAILY_CAP (default 200/IP/day). */
    if (url.pathname === '/match' && req.method === 'POST') {
      /* EITHER provider. Gemini has answered this route since the fallback
         went in; the guard was still asking only about Anthropic, so a worker
         with no Anthropic key at all would 503 a question Gemini can answer. */
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'matching is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      if (q.length < 2) return json({ error: 'nothing to match' }, 400);

      // the app sends its own candidate rows; anything else is not answerable
      const cands = (Array.isArray(b && b.cands) ? b.cands : [])
        .map((c) => String(c || '').replace(/\s+/g, ' ').trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 80);
      /* NO ROWS IS A QUESTION, NOT AN ERROR. The shortlist is built by string
         matching, so a query in a script the tables do not use reaches
         nothing at all - and refusing here skipped the terms that exist to
         rescue exactly that. 鶏肉 got a 400; شوفان survived only because it
         happened to reach one row through an aka entry. With no rows there is
         nothing to pick, and naming the words the table WOULD use is the
         whole of the answer. */
      const askTermsOnly = !cands.length;

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
        '{"picks":[0,4],"grams":200,"sure":true,"terms":["",""],"est":null}\n' +
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
        '  ("350 \u05de\u05dc" is 350). null if you genuinely do not know.\n' +
        /* 160 g is the tin. The brine goes down the sink, and it was going
           into the log. */
        '- A TIN OR A JAR IS WEIGHED DRAINED. What was eaten is the solid, not\n' +
        '  the brine, the oil or the syrup it was packed in. A standard tuna\n' +
        '  tin is about 160 g gross and 112-120 g drained, and it is the\n' +
        '  DRAINED figure that goes in grams. The same for olives, sweetcorn,\n' +
        '  chickpeas, artichokes and tinned fruit.\n' +
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
        '- WHEN NO BRAND IS NAMED, PREFER THE PLAIN TABLE ROW - BUT ONLY\n' +
        '  BETWEEN ROWS THAT ARE THE SAME FOOD. A row carrying a company or a\n' +
        '  supermarket product name is the answer only when the query named it.\n' +
        '  "2 eggs" is eggs, not one dairy\u2019s packaged eggs. The plain row is\n' +
        '  what was meant, and its numbers were measured rather than declared\n' +
        '  on a packet. This rule chooses BETWEEN two rows for one food. It\n' +
        '  never reaches for a DIFFERENT food because that food\u2019s row is\n' +
        '  plainer.\n' +
        /* Measured: 64 rows of the national table name the producers the
           food was SAMPLED from. Without this rule the brand rule above
           reads them as branded and the only good row for a plain food is
           the one the model is taught to avoid. */
        '- A GENERIC ROW MAY NAME THE PRODUCERS IT WAS SAMPLED FROM, AND\n' +
        '  THAT DOES NOT MAKE IT A BRAND ROW. The national tables measure a\n' +
        '  plain food by buying it from several bakeries or dairies and\n' +
        '  listing them: "חלה, ברמן, ודש, אנג\u2019ל, טוב טעם, אילת" is PLAIN\n' +
        '  CHALLAH, not Angel\u2019s challah, and it is the right answer for\n' +
        '  "חלה". THREE OR MORE companies in one name is a sample and counts\n' +
        '  as the plain row; ONE company is a product and needs to have been\n' +
        '  asked for.\n' +
        /* The rule above, read without that precondition, is exactly what
           answered a spelt roll with cooked spelt grain: no brand was named,
           and the plainest row in the sixty was the grain. */
        '- AN INGREDIENT IS NOT THE DISH, AND THIS OUTRANKS THE RULE ABOVE. A\n' +
        '  row naming what the food is MADE OF is not that food, however many\n' +
        '  of the query\u2019s words it carries: the grain under a bread, the\n' +
        '  flour under a cake, the milk under a cheese, the potato under a\n' +
        '  crisp. A spelt ROLL is a baked good; \u05db\u05d5\u05e1\u05de\u05d9\u05df \u05de\u05d1\u05d5\u05e9\u05dc is a cooked\n' +
        '  grain, and it is plainer only because it is something else. If a row\n' +
        '  for the PREPARED food is in the list, even a branded one, that row\n' +
        '  is the answer. If none is, answer [] and estimate instead - an\n' +
        '  honest estimate of a roll beats an exact figure for grain.\n' +
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
        /* Measured on the live route: a tin of tuna came back as the oil
           row, sure:true, with nothing in the query naming oil. */
        '- AND SO DOES THE PACKING MEDIUM, WHEN THE QUERY NAMES ONE. Tuna in\n' +
        '  oil is 198 kcal per 100 g and tuna in water is 86; choosing between\n' +
        '  them more than doubles the answer. If the query says oil, brine,\n' +
        '  water or syrup, take the row that says the same. IF IT NAMES NONE,\n' +
        '  take the row packed in water or brine and set sure:false - an\n' +
        '  unstated medium is a real uncertainty, and reporting it as certain\n' +
        '  is what puts a hundred calories nobody mentioned into the log.\n' +
        '- Never return calories, protein, carbohydrate or fat FOR A ROW YOU\n' +
        '  PICKED. You do not know them and they are not wanted; the app has\n' +
        '  the measured figures already. est below is the one exception, and\n' +
        '  it applies only when you picked nothing at all.\n' +
        /* A row from the tables was weighed in a laboratory; this is a guess,
           and the app marks it as one wherever it is shown. What it replaces
           is not a measurement - it is a second round trip to /estimate to
           ask a different route the question this one has just answered. */
        '- est: your own figures for the food in the QUERY, and ONLY when picks\n' +
        '  is []. {"per100":{"kcal":0,"p":0,"c":0,"f":0},"serving_g":0,\n' +
        '  "assumed":""} - per 100 g AS EATEN, what one of the unit the user\n' +
        '  means weighs, and one short sentence in ' + langName(b && b.lang) + '\n' +
        '  naming what you took the food to be and the portion you assumed.\n' +
        '  Keep the macros consistent with the energy: protein and carbohydrate\n' +
        '  about 4 kcal per gram, fat about 9. Omit est entirely when you\n' +
        '  picked a row.\n' +
        '- No prose, no markdown fence, JSON only.';

      const list = cands.map((n, i) => i + '. ' + n).join('\n');
      const unitWord = String((b && b.unit) || 'unit').slice(0, 12);

      /* Built once and handed to whichever provider answers. It carries the
         sixty rows and the unit the person meant; a second copy for a second
         provider is how two prompts that agree today disagree next month. */
      const USER = askTermsOnly
        /* Nothing to choose between, so do not ask it to choose. The one
           useful question left is the vocabulary one. */
        ? 'FOOD: ' + q + '\nUNIT THE USER MEANS: ' + unitWord +
          '\nROWS: none - a plain text search of the table found nothing for' +
          ' these words.\nAnswer picks:[] and give TERMS: the words this food' +
          ' would be written under in that table.'
        : 'FOOD: ' + q + '\nUNIT THE USER MEANS: ' + unitWord +
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

      /* ITS OWN FIGURES, AND ONLY WHERE THERE IS NOTHING BETTER. Dropped
         whenever a row WAS picked rather than trusted to be absent: a picked
         row carries measured numbers and they win, and a contract the server
         does not enforce is one the next model version breaks quietly. */
      const est = picks.length ? null : cleanEst(parsed && parsed.est);

      // note: no nutrition field for a PICKED row exists in this reply, by design
      return json({ ok: true, by, pick, picks, grams, terms, est, sure: parsed && parsed.sure !== false });
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
    if (url.pathname === '/plan' && req.method === 'POST') {
      if (!env.GEMINI_KEY) return json({ error: 'the assistant is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const lang = String((b && b.lang) || 'he').slice(0, 8);
      /* the language's own name, because a bare code is a weak thing to ask a
         model to obey - it answered Asaf in mixed German once */
      const LANG_NAME = { he: 'Hebrew (\u05e2\u05d1\u05e8\u05d9\u05ea)', en: 'English', de: 'German (Deutsch)',
        es: 'Spanish (Espa\u00f1ol)', fr: 'French (Fran\u00e7ais)', it: 'Italian (Italiano)',
        pt: 'Portuguese (Portugu\u00eas)', ja: 'Japanese (\u65e5\u672c\u8a9e)',
        'zh-Hans': 'Simplified Chinese (\u7b80\u4f53\u4e2d\u6587)',
        'zh-Hant': 'Traditional Chinese (\u7e41\u9ad4\u4e2d\u6587)', ar: 'Arabic (\u0627\u0644\u0639\u0631\u0628\u064a\u0629)' };
      const langName = LANG_NAME[lang] || lang;
      /* The app has been asking people how to address them since the door
         existed, and never told the model. In Hebrew that is the difference
         between speaking to her and speaking to nobody. */
      const gender = (b && b.gender) === 'f' ? 'feminine' : (b && b.gender) === 'm' ? 'masculine' : '';
      const now = String((b && b.now) || '').slice(0, 40);
      const tz = String((b && b.tz) || '').slice(0, 60);
      const cal = Array.isArray(b && b.calendar) ? b.calendar.slice(0, 120) : [];
      const turns = Array.isArray(b && b.turns) ? b.turns.slice(-24) : [];
      if (!turns.length) return json({ error: 'nothing to plan' }, 400);

      const cap = Number(env.PLAN_DAILY_CAP || 60);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'pl:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      /* Asaf's contract, verbatim in substance. The one change is the
         language line: he wrote "answer in Hebrew" for himself, and the app
         has eleven readers. */
      const SYSTEM =
        'You are a time-planning assistant inside an app. Your goal: build the person a precise,\n' +
        'realistic schedule that puts everything that matters to them in the right places.\n' +
        'LANGUAGE. Write EVERY word of EVERY answer in ' + langName + '. That includes the\n' +
        'message, the option labels, the day names, the block titles and the event titles. Never\n' +
        'mix in a word from another language, and never transliterate a foreign word into this\n' +
        'script. If you do not know a term in this language, describe it in this language.\n' +
        '\n' +
        'WHAT YOU GET each time: the current date, time and timezone; existing calendar events if\n' +
        'any; what you were told to remember from earlier conversations; and the conversation so far.\n' +
        '\n' +
        'VOICE. Every screen of this app speaks to ONE person, in one form. Address that person\n' +
        'DIRECTLY - "how many times a week do you want to train", never "how many times a week are\n' +
        'workouts planned" and never an impersonal plural. In a language that marks gender on the\n' +
        'verb, use the one named below; if none is named, use the plainest form the language\n' +
        'allows. Never write a slashed\n' +
        'or bracketed alternative for grammatical gender - not "\u05de\u05e2\u05d3\u05d9\u05e3/\u05d4", not "preferido(a)", not any of\n' +
        'its shapes in any language. Choose the plainest single form the language allows and keep\n' +
        'it. This applies to the message, the option labels, the skip label and every title.\n' +
        '\n' +
        'HOW TO TALK. You are leading someone through their own life, not filling in a form. Never\n' +
        'fire a hard question at them ("which day and hour do you want to train?") when you have not\n' +
        'yet earned the answer. Move forward: if an answer is vague,\n' +
        'take a sensible default, SAY what you assumed, and go on. Never ask twice for something you\n' +
        'already have - from the profile, from the calendar, or from earlier in this conversation.\n' +
        'What you already have you CONFIRM in one short line, and only if it might have changed.\n' +
        '\n' +
        'THE SHAPE OF A QUESTION. The app shows your question on a card, on its own, in large type,\n' +
        'with the options as rows under it. So:\n' +
        '- ASK EXACTLY ONE QUESTION. Never two, never a numbered list, never a paragraph. The\n' +
        '  message is the question and nothing else - no preamble, no "great!", no restating what\n' +
        '  they just said. One sentence, under 15 words. If a stage needs three things, that is\n' +
        '  three cards, one after the other.\n' +
        '- OPTIONS ARE ANSWERS, not sentences: the way a person would actually reply, and 3 to 5\n' +
        '  of them. Never invent a condition nobody mentioned. Where a stage below already lists\n' +
        '  the answers, use that list.\n' +
        '- AN ANSWER MAY CARRY THE FACT THAT TRAVELS WITH IT. One question does not mean one fact.\n' +
        '  When two things are always said in the same breath, ask once and let each row answer\n' +
        '  both: the days AND the hours, the length of a workout AND the time around it, where you\n' +
        '  are meeting someone AND for how long, which project AND roughly how long it needs.\n' +
        '  A row like "Sunday to Thursday, 09:00-17:00, half an hour each way" is ONE answer to\n' +
        '  ONE question. Splitting that into two cards costs a person two waits to say one thing.\n' +
        '  The rows may be longer than the question; that is fine, and it is why they are rows.\n' +
        '- The person can always write their own answer instead, so never add "or something else"\n' +
        '  as an option and never apologise for the list being short.\n' +
        '\n' +
        'GATHERING, IN THREE STAGES. Say which stage you are in with the stage and stageName\n' +
        'fields on every question.\n' +
        '\n' +
        'STAGE 1 - THE FRAME, and STAGE 2 - THE ANCHORS, are asked by the app before you speak.\n' +
        '   The person\'s first message gives the range to plan and the fixed anchors they kept from\n' +
        '   their own schedule - things with a day and an hour that cannot move - or says there are\n' +
        '   none. Take them as true and frozen, exactly as they stand in their schedule: ask nothing\n' +
        '   about them and add no travel around them - the person chose a plan without questions.\n' +
        '\n' +
        'STAGE 3 - WHAT ELSE GOES IN is collected by the app too. The first message lists each\n' +
        '   thing to add with how often, how long, and the time around it (getting ready, travel\n' +
        '   there and back). Take it as given: every one of them is FLOATING unless it names a day\n' +
        '   or an hour, and where a floating thing lands is your call.\n' +
        '   DO NOT ASK ANYTHING ELSE unless something essential is truly missing or contradictory -\n' +
        '   and then at most ONE question. The person chose this to be quick. Go straight to the\n' +
        '   weekly skeleton.\n' +
        '\n' +
        'THEN BUILD IT, IN THREE PHASES:\n' +
        '   PHASE A - FREEZE. Lock sleep and the hard anchors first, with their travel. Nothing\n' +
        '     later in the plan may touch them.\n' +
        '   PHASE B - CLASSIFY AND PLACE. Every remaining activity is either PINNED, and goes where\n' +
        '     they said, or FLOATING, and goes where you judge best in what is left. Say out loud\n' +
        '     which ones you placed on your own judgement.\n' +
        '   PHASE C - DRESS THE LOGISTICS. Only now wrap each block in its travel, its getting\n' +
        '     ready and its shower after.\n' +
        '\n' +
        'Rules that hold throughout gathering:\n' +
        '   - Never set a day or an hour for an area the person has not talked about. Do not assume.\n' +
        '   - Existing calendar events may be out of date. Ask whether they can be trusted before\n' +
        '     using them.\n' +
        '   - If something looks contradictory (a meeting at the same hour as another event), ask\n' +
        '     before going on.\n' +
        '\n' +
        'AFTER GATHERING:\n' +
        '   PROPOSE A WEEKLY SKELETON: show a typical week and ask for approval before planning in full.\n' +
        '   PLAN IN FULL, day after day, only once the skeleton is approved.\n' +
        '\n' +
        'PLACEMENT RULES:\n' +
        '- TRAVEL: every activity the person ADDED that is away from home gets a travel event there\n' +
        '  and back, of the length they gave. The fixed anchors get NONE: they are taken exactly as\n' +
        '  they stand in the schedule - no travel, no getting-ready block before them.\n' +
        '  An activity at home starts only after the return leg has ended. If the travel time is\n' +
        '  not known, ask.\n' +
        '- SLEEP: keep the minimum the person asked for. After a day that ends late, do not put\n' +
        '  anything early the next morning.\n' +
        '- REST BETWEEN WORKOUTS: keep the gap the person asked for, and check it again whenever a\n' +
        '  workout moves.\n' +
        '- BUSY DAYS (a long shift, an event, a trip): lighten the load. One short block beats\n' +
        '  cramming.\n' +
        '- MEALS: only at the hours the person fixed. Never schedule a meal they called flexible.\n' +
        '- HOLIDAYS, TRIPS AND EVENTS: skip blocks that make no sense that day.\n' +
        '- Never schedule anything that makes no sense. When there is no good answer, leave the\n' +
        '  time empty and say so.\n' +
        '- HONESTY: if the goals do not fit the hours available, say exactly what is missing and\n' +
        '  how much.\n' +
        '\n' +
        'ANSWER FORMAT. Return JSON only - no text before or after, no code fences. Exactly one of:\n' +
        '{"type":"question","message":"…","options":["…","…"],"skip":"…","stage":1,"stageName":"…"}\n' +
        '{"type":"skeleton","message":"…","days":[{"day":"…","blocks":[{"start":"08:00","end":"09:15","title":"…","category":"workout"}]}]}\n' +
        '{"type":"schedule","message":"…","events":[{"date":"YYYY-MM-DD","start":"HH:MM","end":"HH:MM","title":"…","emoji":"🚗","category":"travel","location":"…"}],"gaps":["…"]}\n' +
        'category is one of: work, meeting, travel, study, project, workout, meal, reading, social, rest, other.\n' +
        '\n' +
        'ON A QUESTION, THESE THREE FIELDS MATTER:\n' +
        'stage is 1-3, the stage above that this question belongs to, and stageName is that stage\n' +
        'named in ' + langName + '. The app shows them, so the person can see how far along this is;\n' +
        'an interview with no visible end is the one people walk out of.\n' +
        'skip is the way out, and it is what makes this feel flexible instead of interrogating.\n' +
        'It means ONE thing and only that: "no preference, you choose" in ' + langName + '. So:\n' +
        '- Use it ONLY when you are asking for a PREFERENCE, and put it in skip, never in options.\n' +
        '- NEVER use it on a question of fact. "I have none", "nothing else", "I do not know" are\n' +
        '  real answers to a real question - they belong in options, and that question has no skip.\n' +
        '- NEVER let skip repeat something already in options, in meaning or in wording. Two rows\n' +
        '  saying the same thing is a person being asked to choose between identical answers.\n' +
        '- No two options may mean the same thing either.\n' +
        '\n' +
        'WHAT TO REMEMBER. Any answer may also carry "remember": an object of facts worth keeping\n' +
        'for next time - waking hours, routine lengths, the hard anchors and their travel, each\n' +
        'activity with how often and how long and whether it is pinned or floating, how food and\n' +
        'shopping are handled. Write it in ' + langName + ', keep it under 2000 characters, and send\n' +
        'only what changed or is new: it is merged into what is already there, key by key. Never put\n' +
        'one-off events or a particular week in it - it is what stays true.\n' +
        'Answer in ' + langName + ', every word of it.\n' +
        'The emoji is fixed per category: 🔴 work, 🔵 meeting, 🚗 travel, 📚 study, 💻 project,\n' +
        '💪 workout, 🍽️ meal, 📖 reading, 🟢 social, 😴 rest.';

      /* What earlier conversations asked to keep. The worker never looks
         inside it - the model writes it and the model reads it - so the shape
         can grow without a deploy. Capped, because it comes from the client. */
      let prof = '';
      try { prof = JSON.stringify(b.profile || {}).slice(0, 4000); } catch { prof = ''; }
      if (prof === '{}') prof = '';

      const head =
        'Now: ' + (now || 'unknown') + (tz ? ' (' + tz + ')' : '') + '\n' +
        'Existing calendar events: ' + (cal.length ? JSON.stringify(cal) : 'none supplied') + '\n' +
        (gender ? 'Address this person in the ' + gender + ' where the language marks it.\n' : '') +
        'Already known about this person: ' + (prof || 'nothing yet') +
        (prof ? '\nDo not ask any of that again. Confirm it in one short line only if it may have changed.' : '');

      const contents = [{ role: 'user', parts: [{ text: head }] }];
      for (const t of turns) {
        const who = t && t.role === 'bot' ? 'model' : 'user';
        const text = String((t && t.text) || '').slice(0, 4000);
        if (text) contents.push({ role: who, parts: [{ text }] });
      }

      /* Hebrew and Arabic are the pair that actually collide here - both RTL,
         and a real answer came back reading "שגרת הבוקר وشגרת הערב". Narrow on
         purpose: a general script test would trip over the Latin digits and
         clock times these answers legitimately carry. */
      const LEAK = { he: /[\u0600-\u06FF]/, ar: /[\u0590-\u05FF]/ };
      const leaks = (t) => !!(LEAK[lang] && LEAK[lang].test(String(t || '')));

      const askModel = () =>
        fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM }] },
              contents,
              generationConfig: {
                maxOutputTokens: 4000,
                temperature: 0.3,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          },
        );

      let r;
      try {
        r = await askModel();
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) {
        let why = '';
        try { why = (await r.text()).slice(0, 200); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }

      const readRaw = async (res) => {
        let k;
        try { k = await res.json(); } catch { return null; }
        const ps = (((k.candidates || [])[0] || {}).content || {}).parts || [];
        return ps.map((p) => p.text || '').join('').trim();
      };

      let raw = await readRaw(r);
      if (raw === null) return json({ error: 'bad answer' }, 502);
      /* one retry, and only for the one thing worth retrying */
      if (leaks(raw)) {
        try {
          const r2 = await askModel();
          if (r2.ok) {
            const raw2 = await readRaw(r2);
            if (raw2 !== null && !leaks(raw2)) raw = raw2;
          }
        } catch { /* keep what we have */ }
      }

      /* One of three shapes or nothing. An answer the app would have to guess
         at is worse than an error it can show. */
      let out;
      try { out = JSON.parse(raw.replace(/^\u0060{3}[a-z]*\s*|\u0060{3}$/g, '')); }
      catch { return json({ error: 'not json', raw: raw.slice(0, 300) }, 502); }
      const kind = out && out.type;
      const ok =
        (kind === 'question' && typeof out.message === 'string') ||
        (kind === 'skeleton' && Array.isArray(out.days)) ||
        (kind === 'schedule' && Array.isArray(out.events));
      if (!ok) return json({ error: 'unexpected shape', raw: raw.slice(0, 300) }, 502);
      return json(out);
    }

    if (url.pathname === '/transcribe' && req.method === 'POST') {
      if (!env.GEMINI_KEY) return json({ error: 'the assistant is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const mime = String((b && b.mime) || '').slice(0, 40);
      const data = String((b && b.data) || '');
      const lang = String((b && b.lang) || 'he').slice(0, 8);
      if (!/^audio\//.test(mime)) return json({ error: 'not audio' }, 400);
      /* about 3 MB of base64, which is minutes of speech at the bitrates a
         phone records at. A longer clip is a different feature. */
      if (!data || data.length > 4000000) return json({ error: 'audio too long' }, 413);

      const cap = Number(env.TRANSCRIBE_DAILY_CAP || 60);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'tr:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      /* Transcribe, do not interpret. The next step is /parse, and a model
         that "helpfully" turns speech into a tidy food list here would be
         guessing twice on the same words with nobody able to see the first
         guess. */
      const SYSTEM =
        'You transcribe a short spoken note about food, in ' + lang + '.\n' +
        '- Write exactly what was said, in the same language it was said in.\n' +
        '- Keep numbers and units as spoken.\n' +
        '- No punctuation you did not hear, no headings, no preamble, no\n' +
        '  commentary, and never an answer to what was said.\n' +
        '- If there is no speech, return an empty string.';

      let r;
      try {
        r = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM }] },
              contents: [{ role: 'user', parts: [{ inlineData: { mimeType: mime, data } }] }],
              generationConfig: {
                maxOutputTokens: 700,
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
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
      const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      const text = parts.map((p) => p.text || '').join('').trim();
      return json({ text });
    }

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

    /* ── /route ──────────────────────────────────────────────────────────
       The bar on the home screen. One sentence, in any of the app's
       languages, and back comes WHICH area it belongs to and the parts that
       area needs - never a write. The app shows what it understood and the
       person confirms; nothing is stored on a model's say-so.

       Food is only recognised here, not parsed: the app hands the sentence
       to its own /parse flow, which already has the food tables and its own
       confirmation step. A second, cruder food parser would disagree with it.

       What is sent: the sentence, today's date and time, the title of the
       book being read and the names of the person's people - the last two so
       "add this to my book" and "Dana said..." can be resolved, and nothing
       else. Nothing is kept.

       Secrets: AI_KEY. Optional: ROUTE_DAILY_CAP (default 150/IP/day). */
    if (url.pathname === '/route' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'routing is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 1000);
      if (q.length < 2) return json({ error: 'nothing to route' }, 400);
      const lang = String((b && b.lang) || 'he').slice(0, 8);
      const today = /^\d{4}-\d{2}-\d{2}$/.test(b && b.today) ? b.today : new Date().toISOString().slice(0, 10);
      const now = /^\d{2}:\d{2}$/.test(b && b.now) ? b.now : '';
      const book = String((b && b.book) || '').slice(0, 120);
      const people = Array.isArray(b && b.people)
        ? b.people.map((p) => String(p).slice(0, 40)).filter(Boolean).slice(0, 80) : [];

      const cap = Number(env.ROUTE_DAILY_CAP || 150);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'rt:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const wd = new Date(today + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
      const SYSTEM =
        'You sort one sentence a person typed into a personal life app into the\n' +
        'place it belongs. You never answer the person; you only classify.\n' +
        '\n' +
        'ONE SENTENCE MAY HOLD SEVERAL THINGS - "add a treatment on Monday at four,\n' +
        'and I just ate a banana" is a task AND food. Return one item for each\n' +
        'separate thing, in the order they were said. Most sentences hold one.\n' +
        '\n' +
        'Intents:\n' +
        '- food: they ate or drank something other than plain water (tea, coffee,\n' +
        '  a meal, a snack). text = that part of the sentence in their own words,\n' +
        '  "I ate" included - it is handed on to a food logger that reads it.\n' +
        '- water: plain water. amount = millilitres (a glass is 250, a bottle 500).\n' +
        '- quote: a sentence from the book they are reading, to keep. text = the\n' +
        '  quoted sentence alone, without the request around it. page if said.\n' +
        '- moment: a small thing that happened today that they want to remember.\n' +
        '- journal: they want to write in their journal, or a longer reflection.\n' +
        '- task: something to do. text = the task, short. date = YYYY-MM-DD when a\n' +
        '  day is said or implied ("tomorrow", "on Sunday"), else today. time =\n' +
        '  HH:MM 24-hour when a time is said, else empty. "Call Dana tomorrow" is a\n' +
        '  task.\n' +
        '- person_note: something to remember ABOUT one of their people (what they\n' +
        '  said, like, are going through). person = the name exactly as in the\n' +
        '  list below. Only names from that list.\n' +
        '- steps: they walked N steps today. amount = N.\n' +
        '- goal: a goal they are setting for themselves.\n' +
        '- open: they only want to go to an area. area = one of nutrition, fitness,\n' +
        '  hobbies, endofday, insights, people, planning, closet, journal.\n' +
        '- unknown: none of these fits, or you are not sure.\n' +
        '\n' +
        'Keep text in the language and words the person wrote. Leave a field\n' +
        'empty (or 0) when it does not apply. Choose unknown over a guess.\n' +
        '\n' +
        'Today is ' + wd + ' ' + today + (now ? ', the time is ' + now : '') + '.\n' +
        'The app is in language: ' + lang + '.\n' +
        'Book being read: ' + (book || '(none)') + '.\n' +
        'Their people: ' + (people.length ? people.join(', ') : '(none)') + '.';

      const ITEM = {
        type: 'object',
        properties: {
          intent: { type: 'string', enum: ROUTE_INTENTS },
          text: { type: 'string' },
          person: { type: 'string' },
          date: { type: 'string' },
          time: { type: 'string' },
          amount: { type: 'integer' },
          page: { type: 'integer' },
          area: { type: 'string' },
        },
        required: ['intent', 'text', 'person', 'date', 'time', 'amount', 'page', 'area'],
        additionalProperties: false,
      };
      const SCHEMA = { type: 'object', properties: { items: { type: 'array', items: ITEM } },
                       required: ['items'], additionalProperties: false };

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'server-side-fallback-2026-07-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-5-5',
            max_tokens: 2000,
            fallbacks: 'default',
            /* low: this is sorting one sentence, and the person is waiting on
               the home screen for it */
            output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
            system: SYSTEM,
            messages: [{ role: 'user', content: q }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) {
        let why = '';
        try { why = (await r.text()).slice(0, 300); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }
      let d;
      try { d = await r.json(); } catch { return json({ error: 'unreadable answer' }, 502); }
      // a declined request is not an error the person can act on: it is "not sure"
      const unknown = routeClean({ intent: 'unknown', text: q }, people);
      if (d.stop_reason === 'refusal') return json({ ok: true, route: unknown, routes: [unknown] });
      const text = ((d && d.content) || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
      let o;
      try { o = JSON.parse(text); } catch { return json({ error: 'unreadable answer', why: text.slice(0, 200) }, 502); }
      /* every item checked on its own; at most six. route stays the first, for
         an app that knows only one */
      let routes = ((o && Array.isArray(o.items)) ? o.items : []).slice(0, 6).map((it) => routeClean(it, people));
      if (routes.length > 1) routes = routes.filter((r) => r.intent !== 'unknown');
      if (!routes.length) routes = [unknown];
      return json({ ok: true, route: routes[0], routes });
    }

    /* ── /schedule ───────────────────────────────────────────────────────
       The writing line in time planning. "Every Wednesday from 9 to 10,
       meditation" - one sentence, possibly several things, and back come
       calendar entries: what, which date or which weekdays, from when to
       when, and whether it repeats. Never a write: the app shows them on a
       card and only its button stores anything.

       A repeat may END ("reserve duty until the 24th"). There was no field
       for that, so the first person to say it got a daily entry half a year
       long, and then wrote "remove it from the 25th to the 31st" into the
       same line and was told there was nothing to put in the calendar - so
       an item may also be a REMOVAL, with the same date, days and until
       saying which days it covers.

       What is sent: the sentence, today's date and time. Nothing is kept.
       Secrets: AI_KEY. Optional: SCHEDULE_DAILY_CAP (default 150/IP/day). */
    if (url.pathname === '/schedule' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'scheduling is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const q = String((b && b.q) || '').replace(/\s+/g, ' ').trim().slice(0, 1000);
      if (q.length < 2) return json({ error: 'nothing to schedule' }, 400);
      const lang = String((b && b.lang) || 'he').slice(0, 8);
      const today = /^\d{4}-\d{2}-\d{2}$/.test(b && b.today) ? b.today : new Date().toISOString().slice(0, 10);
      const now = /^\d{2}:\d{2}$/.test(b && b.now) ? b.now : '';
      const board = scheduleBoard(b);

      const cap = Number(env.SCHEDULE_DAILY_CAP || 150);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'sc:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const wd = new Date(today + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
      const SYSTEM =
        'You turn what a person wrote into entries for their personal calendar.\n' +
        'You never answer them; you only extract.\n' +
        '\n' +
        'For each thing to put in the calendar, one item:\n' +
        '- text: what it is, short, in their own language and words, without\n' +
        '  the day or the time ("meditation", not "meditation every Wednesday").\n' +
        '- repeat: "weekly" for every given weekday ("every Wednesday", "on\n' +
        '  Sundays and Tuesdays"), "daily" for every day, "none" for one time.\n' +
        '- days: for weekly, the weekdays as numbers, 0 = Sunday ... 6 = Saturday.\n' +
        '  Empty otherwise.\n' +
        '- date: for a one-time entry, YYYY-MM-DD, worked out from today\n' +
        '  ("tomorrow", "next Monday", "on the 25th"). For a repeat, the first\n' +
        '  date it should start if they said one, else empty.\n' +
        '- start / end: 24-hour HH:MM. "from 9 to 10" is 09:00 and 10:00; "at\n' +
        '  five in the afternoon" is 17:00 with no end. Empty when no time.\n' +
        '- until: for a repeat that ends, its LAST date, YYYY-MM-DD, inclusive\n' +
        '  ("until the 24th", "for the next two weeks"). Empty when it does not end.\n' +
        '  A span of days is a daily repeat: "reserve duty until the 24th" is\n' +
        '  daily from today until the 24th; "vacation from the 3rd to the 8th" is\n' +
        '  daily, date the 3rd, until the 8th.\n' +
        '- action: "add" to put it in the calendar, "remove" when they ask to\n' +
        '  take something OFF it ("remove X from the 25th to the 31st", "cancel X\n' +
        '  on Thursday", "I no longer need X", "you added too many days, I only\n' +
        '  need it until the 24th"). For a removal, text is the thing to remove,\n' +
        '  and repeat, days, date and until say WHICH days: one day is "none"\n' +
        '  with its date; a span is "daily" from date to until; "from now on" or\n' +
        '  "no longer" is daily from the first day to remove with until empty.\n' +
        '  "only until the 24th" removes from the 25th on.\n' +
        '  The text of a removal must be the EXACT text of an entry from their\n' +
        '  calendar below. When they do not name it ("remove it", "you added\n' +
        '  too many days"), it is the entry the days they mention point to -\n' +
        '  usually the one they added last.\n' +
        '\n' +
        'Several things in one sentence are several items. If there is nothing\n' +
        'to put in or take out of a calendar, return no items.\n' +
        '\n' +
        'Today is ' + wd + ' ' + today + (now ? ', the time is ' + now : '') + '.\n' +
        'The app is in language: ' + lang + '.' +
        (board.last.length ? '\n\nWhat they added last through this line: ' + JSON.stringify(board.last) : '') +
        (board.entries.length ? '\n\nTheir calendar (each entry once, first and last day, how many days):\n' +
          board.entries.map((e) => '- ' + JSON.stringify(e.text) + ' ' + e.from + ' to ' + e.to + ' (' + e.n + ')').join('\n') : '');

      const SCHEMA = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                repeat: { type: 'string', enum: SCHED_REPEATS },
                days: { type: 'array', items: { type: 'integer' } },
                date: { type: 'string' },
                start: { type: 'string' },
                end: { type: 'string' },
                until: { type: 'string' },
                action: { type: 'string', enum: ['add', 'remove'] },
              },
              required: ['text', 'repeat', 'days', 'date', 'start', 'end', 'until', 'action'],
              additionalProperties: false,
            },
          },
        },
        required: ['items'],
        additionalProperties: false,
      };

      let r;
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.AI_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'server-side-fallback-2026-07-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-5-5',
            max_tokens: 3000,
            fallbacks: 'default',
            // low: extraction from one sentence, with the person waiting on it
            output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
            system: SYSTEM,
            messages: [{ role: 'user', content: q }],
          }),
        });
      } catch {
        return json({ error: 'could not reach the model' }, 502);
      }
      if (!r.ok) {
        let why = '';
        try { why = (await r.text()).slice(0, 300); } catch {}
        return json({ error: 'the model refused', status: r.status, why }, 502);
      }
      let d;
      try { d = await r.json(); } catch { return json({ error: 'unreadable answer' }, 502); }
      if (d.stop_reason === 'refusal') return json({ ok: true, items: [] });
      const text = ((d && d.content) || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
      let o;
      try { o = JSON.parse(text); } catch { return json({ error: 'unreadable answer', why: text.slice(0, 200) }, 502); }
      return json({ ok: true, items: scheduleClean(o, today) });
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
    /* ── /beem ───────────────────────────────────────────────────────────
       Mip, the small sun who lives in the corner of every screen, answering
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
      const name = String((b && b.name) || '').replace(/[^\p{L}\p{M} '\-]/gu, '').trim().slice(0, 24);
      const form = (b && b.form) === 'f' ? 'f' : (b && b.form) === 'm' ? 'm' : '';
      const today = /^\d{4}-\d{2}-\d{2}$/.test(String((b && b.today) || '')) ? b.today : day;

      const SYSTEM =
        'You are Mip, a small warm sun who lives in the corner of every screen of\n' +
        'Olimei, a personal app for nutrition, fitness, people, planning, hobbies,\n' +
        'clothes, reflection and an end-of-day summary. You are the app\'s helper.\n' +
        'Write everything in ' + lang + '.' +
        (lang === 'Hebrew' ? ' Address the user in the ' + (form === 'f' ? 'feminine' : 'masculine') + ' singular; you yourself are masculine.' : '') +
        (name ? ' Their name is ' + name + '; use it rarely.' : '') + '\n' +
        'They opened you from ' + screen + '. Today, by the app\'s clock, is ' + today + '.\n' +
        '\n' +
        'HOW-TO QUESTIONS are answered ONLY from the guide below. Name the real\n' +
        'button and where it is. The labels in the guide are Hebrew; if you are not\n' +
        'writing Hebrew, describe the button by what it does and where it sits, and\n' +
        'never put a Hebrew word in the answer - the app is showing their language,\n' +
        'not Hebrew. If the guide does not cover it, say plainly that you do not know\n' +
        'that one yet - never invent a button, a setting, a feature or a support team.\n' +
        '\n' +
        'QUESTIONS ABOUT THEIR OWN FOOD use the tools, and every number you state must\n' +
        'have come back from a tool in this conversation - never estimate one from\n' +
        'your own knowledge. You have no access to their workouts, people, plans or\n' +
        'summaries; say so if asked, and tell them where in the app to look.\n' +
        '\n' +
        'Be brief and kind: one to four short sentences, no lists unless steps are\n' +
        'really needed, no preamble. You are a helper for this app: for anything else\n' +
        'answer in one friendly sentence that it is outside what you can help with.\n' +
        'Never give medical advice; for anything clinical, a doctor or a dietitian.\n' +
        '\n' +
        '=== GUIDE ===\n' + BEEM_GUIDE;

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

    /* the chat that does: see ACT_READS / ACT_WRITES */
    if (url.pathname === '/act' && req.method === 'POST') {
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'act is not configured' }, 503);
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const messages = Array.isArray(b && b.messages) ? b.messages : [];
      if (!messages.length) return json({ error: 'nothing to do' }, 400);
      if (messages.length > 40) return json({ error: 'too long' }, 400);
      if (JSON.stringify(messages).length > 80000) return json({ error: 'too long' }, 400);
      const cap = Number(env.ACT_DAILY_CAP || 150);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const day = new Date().toISOString().slice(0, 10);
      const ipKey = 'aq:' + day + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      const lang = langName(b && b.lang);
      const place = BEEM_SCREENS[String((b && b.place) || '')] || '';
      const name = String((b && b.name) || '').replace(/[^\p{L}\p{M} '\-]/gu, '').trim().slice(0, 24);
      const form = (b && b.form) === 'f' ? 'f' : (b && b.form) === 'm' ? 'm' : '';
      const today = /^\d{4}-\d{2}-\d{2}$/.test(String((b && b.today) || '')) ? b.today : day;
      const now = /^\d{2}:\d{2}$/.test(String((b && b.now) || '')) ? b.now : '';
      const weekday = String((b && b.weekday) || '').slice(0, 12);
      const units = (b && b.units) === 'imperial' ? 'imperial' : 'metric';
      const SYSTEM =
        'You are Olimei\'s chat: the person does here, in words, what they would otherwise do by tapping the app\'s screens -\n' +
        'nutrition, fitness, hobbies, people, planning, closet, insights and the end-of-day summary.\n' +
        'Write everything in ' + lang + '.' +
        (lang === 'Hebrew' ? ' Address the person in the ' + (form === 'f' ? 'feminine' : 'masculine') + ' singular.' : '') +
        (name ? ' Their name is ' + name + '; use it rarely.' : '') + '\n' +
        'Today, by the app\'s clock (the day ends at 04:00), is ' + today + (weekday ? ' (' + weekday + ')' : '') + (now ? ', and it is ' + now : '') + '.\n' +
        'They use ' + units + ' units.\n' +
        (place ? 'They are in the ' + place + ' part of the chat: read what they say as being about that area.\n' : 'They are in the general chat: it can be about any area.\n') +
        '\n' +
        'DO WHAT THEY ASK with the tools. Every write tool shows them a card to confirm, so call it with exactly what they said.\n' +
        'Never invent a value they did not give - a time, a weight, a number of sets, a person. If something essential is missing, ask one short question instead of guessing.\n' +
        'Names of people, hobbies, exercises and insight topics must be ones a read tool returned: read first, then write. If the name they used matches none, say so briefly and offer the closest one.\n' +
        'Several things in one sentence: one write tool call for each.\n' +
        'Food or drink other than plain water goes to log_food with their own words - never log food yourself.\n' +
        'Questions about their own data: read, and state only numbers a tool returned in this conversation.\n' +
        'A write is NOT done until they press add on its card: never say you added, saved or logged something - say in one short sentence that it is waiting for their OK (the card shows the details). Otherwise one to three short sentences. No lists unless they asked for one. No explanations of how the app works unless they ask.\n' +
        'Never give medical advice.';
      const tools = ACT_READS.concat(ACT_WRITES, ASK_TOOLS);
      let r, detail = '';
      try {
        r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': env.AI_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 900, temperature: 0.2, system: SYSTEM, tools, messages: stripGemSig(messages) }),
        });
      } catch { r = null; }
      if (r && !r.ok) { try { detail = (await r.text()).slice(0, 200); } catch {} }
      let out = null;
      if (r && r.ok) { try { out = await r.json(); } catch { out = null; } }
      if (!out || !Array.isArray(out.content) || !out.content.length) {
        const g = await geminiTurn(SYSTEM, tools, messages, 900);
        if (g) out = g;
      }
      if (!out) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, detail, gem_why: gemWhy }, 502)
          : json({ error: 'could not reach the model', gem_why: gemWhy }, 502);
      }
      return json({ ok: true, stop_reason: out.stop_reason || '', content: Array.isArray(out.content) ? out.content : [] });
    }

    if (url.pathname === '/ask' && req.method === 'POST') {
      /* EITHER provider, now that Gemini can use the tools too. */
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'asking is not configured' }, 503);

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
      const TOOLS = ASK_TOOLS;

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

      let r, detail = '';
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
            /* Gemini's signatures come off here and nowhere else. */
            messages: stripGemSig(messages),
          }),
        });
      } catch {
        r = null;   /* both failures meet below, where Gemini is asked */
      }
      if (r && !r.ok) {
        try { detail = (await r.text()).slice(0, 200); } catch {}
      }

      /* WHOEVER ANSWERS - and with Gemini the whole turn comes back already
         translated into Anthropic's shape, so the return below is unchanged
         and the app never learns who was asked. */
      let out = null;
      if (r && r.ok) { try { out = await r.json(); } catch { out = null; } }
      if (!out || !Array.isArray(out.content) || !out.content.length) {
        const g = await geminiTurn(SYSTEM, TOOLS, messages, 900);
        if (g) out = g;
      }
      if (!out) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, detail, gem_why: gemWhy }, 502)
          : json({ error: 'could not reach the model', gem_why: gemWhy }, 502);
      }

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
      /* EITHER provider can look at a picture. */
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'photos are not configured' }, 503);

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

      /* The question, once, in the order that matters: the picture first and
         the question after it. The model reads parts in order, and a question
         asked before the evidence arrives is answered from the question. */
      const ASK = 'What food is in this picture, and how much of each?';
      const NOTE = note ? 'What they wrote: ' + note : '';
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
            max_tokens: 800,
            system: SYSTEM,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mime, data } },
                ...(NOTE ? [{ type: 'text', text: NOTE }] : []),
                { type: 'text', text: ASK },
              ],
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

      /* WHOEVER ANSWERS. Same bytes, different envelope: Anthropic wants
         source.base64, Gemini wants inlineData - and thinking stays ON here,
         which is the one difference from the three text routes. */
      let text = '';
      if (r && r.ok) {
        let d = null;
        try { d = await r.json(); } catch { d = null; }
        text = d ? ((d.content || []).map((c) => c.text || '').join('').trim()) : '';
      }
      if (!text) {
        const g = await geminiAsk(SYSTEM, [
          { inlineData: { mimeType: mime, data } },
          ...(NOTE ? [{ text: NOTE }] : []),
          { text: ASK },
        ], 1400, true);
        if (g) { text = g; by = 'gemini'; }
      }
      if (!text) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, why }, 502)
          : json({ error: 'could not reach the model' }, 502);
      }
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
    /* ── THE COACH ──
       One box. Words, a photograph, or both, and a correction said the same
       way. Everything the model needs to answer is sent every turn - the
       targets, what is already logged today, what is left - because it keeps
       nothing between calls and guessing is worse than being told.

       IT NEVER ADDS UP. Per-item numbers are its job; the app sums them and
       writes "what is left" underneath from its own figures. If the model
       totalled anything, two numbers would sit on one screen and one of them
       would be wrong.

       AND IT IS NOT GIVEN A CLOCK. This app's day ends at 04:00, so the day
       is sent, never derived - something eaten at 01:30 belongs to the day
       the person is still living in. */
    /* ── /corrections ─────────────────────────────────────────────────────
       What the app reports each time someone takes a logged item back or
       corrects it: kept ninety days, read only by /admin/corrections with the
       ADMIN_KEY secret. ONE KEY PER DAY (corrd:<YYYY-MM-DD>, UTC), appended
       to, so a read is seven gets and never a list(): KV allows a thousand
       list() calls a day on this plan, the minute loop needs the list, and
       the first version of this page spent the day's allowance on itself. The install id is random
       and is the only thing here about who it is.
       Optional: CORRECTIONS_DAILY_CAP (default 300/IP/day). */
    if (url.pathname === '/corrections' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const uid = String((b && b.uid) || '');
      if (!/^[0-9a-f]{24}$/.test(uid)) return json({ error: 'bad uid' }, 400);
      const list = (Array.isArray(b && b.items) ? b.items : []).slice(0, 20).map(corrClean).filter(Boolean);
      const cap = Number(env.CORRECTIONS_DAILY_CAP || 300);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const ipKey = 'cr:' + new Date().toISOString().slice(0, 10) + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used + list.length > cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + list.length), { expirationTtl: 172800 });
      const dev = b.dev === true;
      if (!list.length) return json({ ok: true, kept: 0 });
      const dkey = 'corrd:' + new Date().toISOString().slice(0, 10);
      let day = [];
      try { day = JSON.parse((await env.SUBS.get(dkey)) || '[]'); } catch {}
      if (!Array.isArray(day)) day = [];
      for (const c of list) day.push(Object.assign({ uid, dev }, c));
      /* a day is capped, so one key never grows past what a read can carry */
      await env.SUBS.put(dkey, JSON.stringify(day.slice(-800)), { expirationTtl: 90 * 86400 });
      return json({ ok: true, kept: list.length });
    }
    /* ── /ping and /admin/usage ──────────────────────────────────────────
       Anonymous usage: per app day, which installs opened the app, how many
       times, which areas, whether the evening was summarised, and the day
       each install was first seen. ONE KEY PER DAY (pd:<day>), merged, never
       a list() - the same reason as corrd above. Kept 120 days. */
    if (url.pathname === '/ping' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      const uid = String((b && b.uid) || '');
      if (!/^[0-9a-f]{24}$/.test(uid)) return json({ error: 'bad uid' }, 400);
      const day = String((b && b.day) || '');
      const dms = Date.parse(day + 'T12:00:00Z');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !(Math.abs(dms - Date.now()) < 3 * 86400000)) return json({ error: 'bad day' }, 400);
      const first = /^\d{4}-\d{2}-\d{2}$/.test(String(b.first || '')) ? b.first : day;
      const areas = (Array.isArray(b.a) ? b.a : []).map((x) => String(x).replace(/[^a-z]/g, '').slice(0, 16)).filter(Boolean).slice(0, 12);
      const key = 'pd:' + day;
      let rec = {};
      try { rec = JSON.parse((await env.SUBS.get(key)) || '{}') || {}; } catch { rec = {}; }
      if (!rec[uid] && Object.keys(rec).length >= 2000) return json({ ok: true, kept: false });
      const was = rec[uid] || {};
      rec[uid] = {
        o: Math.max(Number(was.o) || 0, Math.min(500, Number(b.o) || 0)),
        s: !!(was.s || b.s),
        a: Array.from(new Set([...(was.a || []), ...areas])),
        /* a ping without a language must not erase the one already kept,
           and the first day only ever moves earlier */
        l: String(b.lang || was.l || '').slice(0, 8),
        f: was.f && was.f < first ? was.f : first,
        d: b.dev === true,
      };
      await env.SUBS.put(key, JSON.stringify(rec), { expirationTtl: 120 * 86400 });
      return json({ ok: true });
    }
    if (url.pathname === '/admin/usage' && req.method === 'GET') {
      if (!adminOk(req, env)) return json({ error: 'not allowed' }, 401);
      const days = Math.max(1, Math.min(120, Number(url.searchParams.get('days')) || 14));
      const out = [];
      /* i = -1: east of UTC the app's day is already tomorrow's date */
      for (let i = -1; i <= days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const v = await env.SUBS.get('pd:' + d);
        if (v) { try { out.push({ day: d, ids: JSON.parse(v) }); } catch {} }
      }
      return json({ ok: true, days: out });
    }

    /* the meter, per UTC day and route: what was called, with what, by whom */
    if (url.pathname === '/admin/cost' && req.method === 'GET') {
      if (!adminOk(req, env)) return json({ error: 'not allowed' }, 401);
      const days = Math.max(1, Math.min(60, Number(url.searchParams.get('days')) || 14));
      const out = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const routes = {};
        await Promise.all(METER_ROUTES.concat('other').map(async (r) => {
          const v = await env.SUBS.get('mt:' + d + ':' + r);
          if (v) { try { routes[r] = JSON.parse(v); } catch {} }
        }));
        if (Object.keys(routes).length) out.push({ day: d, routes });
      }
      return json({ ok: true, days: out });
    }

    if (url.pathname === '/admin/corrections' && req.method === 'GET') {
      if (!adminOk(req, env)) return json({ error: 'not allowed' }, 401);
      const days = Math.max(1, Math.min(90, Number(url.searchParams.get('days')) || 7));
      const out = [];
      for (let i = 0; i <= days; i++) {
        const v = await env.SUBS.get('corrd:' + new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
        if (!v) continue;
        try { const a = JSON.parse(v); if (Array.isArray(a)) out.push(...a); } catch {}
      }
      const since = Date.now() - days * 86400000;
      return json({ ok: true, days, items: out.filter((c) => c.ts >= since) });
    }

    if (url.pathname === '/coach' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'the coach is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

      const day = String((b && b.day) || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ error: 'bad day' }, 400);
      const LANG = langName(b && b.lang);
      const units = (b && b.units) === 'imperial' ? 'imperial' : 'metric';
      const targets = (b && b.targets) || {};
      /* capped, because they are sent whole on every turn and a long day is
         still a day - sixty rows is more than anyone logs */
      const logged = Array.isArray(b && b.logged) ? b.logged.slice(0, 60) : [];
      const left = (b && b.left) || {};
      /* the prompt says it receives these, so they are sent - a promise the
         model cannot keep is worse than one never made */
      const phase = String((b && b.phase) || '').slice(0, 20);
      /* health conditions the person chose to tell the coach (with consent) */
      const HL = { mg: 'myasthenia gravis', dm: 'diabetes', bp: 'high blood pressure', ckd: 'chronic kidney disease', preg: 'pregnancy', sarc: 'sarcopenia', op: 'osteoporosis' };
      const healthIds = (Array.isArray(b && b.health) ? b.health : []).filter((x) => HL[x]).slice(0, 7);
      const health = healthIds.map((x) => HL[x]);
      /* MedlinePlus, the National Library of Medicine's public health topics:
         one summary per shared condition, cached a week in KV */
      const medline = [];
      const MLP_TERM = { mg: 'myasthenia gravis', dm: 'diabetes', bp: 'hypertension', ckd: 'chronic kidney disease', preg: 'pregnancy', op: 'osteoporosis' };
      for (const id of healthIds.filter((x) => MLP_TERM[x]).slice(0, 3)) {
        const key = 'mlp2:' + id;
        let got = null;
        try { got = await env.SUBS.get(key, 'json'); } catch {}
        if (!got) {
          try {
            const r = await fetch('https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&retmax=1&term=' + encodeURIComponent(MLP_TERM[id]),
              { headers: { 'User-Agent': 'Olimei/0.1 (personal health app)' } });
            if (r.ok) {
              const x = await r.text();
              const doc = (x.match(/<document[^>]*url="([^"]+)"[\s\S]*?<\/document>/) || []);
              const pick = (name) => { const m = (doc[0] || '').match(new RegExp('<content name="' + name + '">([\\s\\S]*?)</content>')); return m ? m[1] : ''; };
              const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
              const text = (s) => unesc(s).replace(/<\/?(p|li|h\d)>/g, '\n').replace(/<[^>]+>/g, '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
              if (doc[1]) {
                got = { title: text(pick('title')), url: doc[1], summary: text(pick('FullSummary')).slice(0, 2400) };
                try { await env.SUBS.put(key, JSON.stringify(got), { expirationTtl: 7 * 86400 }); } catch {}
              }
            }
          } catch {}
        }
        if (got && got.summary) medline.push(got);
      }
      /* HOW TO ADDRESS HER, not biology - Hebrew marks gender on the verb and
         "אכלת" is not "אכלתי". The app keeps the two apart: app_gender is the
         voice she chose, profile.sex is what Mifflin-St Jeor needs. */
      const gender = (b && b.gender) === 'f' ? 'f' : (b && b.gender) === 'm' ? 'm' : '';
      const weights = (Array.isArray(b && b.weights) ? b.weights : []).slice(-14);
      /* twenty, so "only half" and "it was chicken" still have the meal they
         are correcting inside the window */
      const history = (Array.isArray(b && b.history) ? b.history : []).slice(-20);
      const message = String((b && b.message) || '').replace(/\s+/g, ' ').trim().slice(0, 1500);
      /* an edit names ONE logged item; the reply may touch nothing else */
      const editId = String((b && b.edit_id) || '').slice(0, 40);
      /* a message she swiped may have logged several items: all of them are
         the edit, and what she first wrote comes with it */
      const editIds = [...new Set([editId].concat(Array.isArray(b && b.edit_ids) ? b.edit_ids : [])
        .map((x) => String(x || '').slice(0, 40)).filter(Boolean))].slice(0, 12);
      const editWas = String((b && b.edit_was) || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      /* weigh-ins are part of her tracking: what the app knows about the
         trend, sent every turn, for the moment she says what she weighs */
      const wctx = weighCtxClean(b && b.weigh_ctx);
      /* today's activity as the app has it, and whether the steps question
         may be asked: on, not asked yet today, nothing reported yet, and the
         evening - decided here, not by the model */
      const actx = actCtxClean(b && b.activity);
      const askSteps = !!(actx && actx.ask && !actx.asked && !actx.has && actx.now >= '18:00');
      /* not a weigh-in: whether one is due today and still missing */
      const ws = (b && b.weigh_status && typeof b.weigh_status === 'object') ? b.weigh_status : null;
      /* WHETHER TO MENTION TODAY'S WEIGH-IN is decided here, not left to the
         model: told it "may, once a day", it said it twice in a row and on a
         day that was not a weigh-in day. Due, not yet weighed, not already
         said today (the app remembers), nothing eaten yet, and not an edit. */
      const weighNudge = !!(ws && ws.due_today === true && ws.weighed_today !== true && ws.nudged !== true &&
        !(Array.isArray(b && b.logged) && b.logged.length) && !editId);
      const strs = (a, n, len) => (Array.isArray(a) ? a : []).slice(-n)
        .map((x) => String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, len)).filter(Boolean);
      const habits = strs(b && b.habits, 30, 120);
      const offered = strs(b && b.habits_offered, 20, 120);
      const recentFix = (Array.isArray(b && b.corrections_recent) ? b.corrections_recent : []).slice(-10).map((c) => ({
        type: String((c && c.type) || '').slice(0, 12), before: String((c && c.before) || '').slice(0, 120),
        after: String((c && c.after) || '').slice(0, 120), said: String((c && c.said) || '').slice(0, 200) }));
      const images = Array.isArray(b && b.images) ? b.images.slice(0, 4) : [];
      if (!message && !images.length) return json({ error: 'nothing to read' }, 400);
      /* the pictures of the last few turns, so "half of that" still has the
         label in front of it - a coach that had only the words once said it
         had checked a label it could no longer see */
      const histImages = (Array.isArray(b && b.history_images) ? b.history_images : []).slice(0, 3);
      /* a disputed item: the app found the word, the item, and the picture
         and label data it was logged from */
      const dispute = (b && b.dispute && typeof b.dispute === 'object' && b.dispute.id) ? {
        id: String(b.dispute.id).slice(0, 40), said: String(b.dispute.said || '').slice(0, 600),
        label: labelClean(b.dispute.label), image: b.dispute.image && b.dispute.image.data ? b.dispute.image : null,
      } : null;

      /* the same gate /see uses, per image: base64 and nothing else, because
         this string is handed to the model API verbatim */
      for (const im of images.concat(histImages, dispute && dispute.image ? [dispute.image] : [])) {
        const data = String((im && im.data) || '');
        const mime = String((im && im.mime) || 'image/jpeg');
        if (!/^image\/(jpeg|png|webp)$/.test(mime)) return json({ error: 'bad image type' }, 400);
        if (!/^[A-Za-z0-9+/]+=*$/.test(data)) return json({ error: 'bad image' }, 400);
        if (data.length < 500) return json({ error: 'bad image' }, 400);
        if (data.length > 900000) return json({ error: 'image too large' }, 413);
      }

      /* Its own budget, and an image costs several times a sentence - so the
         cap counts pictures, not turns. A text-only turn spends one. */
      /* WHOSE budget. It was the network's alone, so one home shared one
         budget - and a day of tests from Asaf's computer left his own phone,
         on the same Wi-Fi, told it had asked too much until 03:00. Now a
         device that sends its install id has its own, with a wider one per
         network behind it so new ids cannot be minted to get round it; a
         run that carries ADMIN_KEY spends a budget of its own and nobody
         else's. An app without an id is counted by network, as before. */
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const today = new Date().toISOString().slice(0, 10);
      const spend = Math.max(1, images.length * 3 + histImages.length + (dispute && dispute.image ? 1 : 0));
      const buckets = coachBuckets({
        today, ip, uid: b && b.uid,
        test: adminOk(req, env),
        cap: Number(env.COACH_DAILY_CAP || 120),
        ipCap: Number(env.COACH_IP_DAILY_CAP || 400),
        testCap: Number(env.COACH_TEST_DAILY_CAP || 600),
      });
      const usedNow = await Promise.all(buckets.map((x) => env.SUBS.get(x.key)));
      for (let i = 0; i < buckets.length; i++)
        if (Number(usedNow[i] || 0) >= buckets[i].cap) return json({ error: 'too many for today' }, 429);
      await Promise.all(buckets.map((x, i) =>
        env.SUBS.put(x.key, String(Number(usedNow[i] || 0) + spend), { expirationTtl: 172800 })));

      /* His words, kept in coach/system-prompt.txt so the repo and the
         worker cannot drift apart. */
      const SYSTEM = `You are the personal nutrition coach inside "Olimei". You talk with the user in Hebrew, in a chat, like a knowledgeable coach-friend. Logging food is ONE thing you do, not the only thing.

## Context you receive every turn
- Who you are speaking to: their grammatical gender. Hebrew marks it on verbs and adjectives, so address them in it throughout - "אכלת"/"אכלתי" and "תוסיפי"/"תוסיף" are not interchangeable. If it is not given, write so that it does not show.
- Targets (calories, protein, carbs, fat) and current phase (cut / maintain / build)
- Today's log (items with ids) and the remaining amounts, computed by the app
- Recent morning weigh-ins and the weekly average
- The last 20 chat messages
Never do your own math for daily totals or remaining amounts. The app computes them and appends a "נשאר להיום" block after your message, so do not write that block yourself.

## Decide what the message is
1. Report of eating ("אכלתי", "שתיתי", a photo of a meal they ate) → log it (action: add)
2. Correction ("רק חצי", "זה היה עוף", "לא היה צ'יפס", "היה חלב בקפה") → update the existing item by id (action: update), never add a duplicate
3. Hypothetical or question ("יש לי מקום ל...?", "מה לאכול?", a menu photo, a recipe, "במה להחליף", "למה יצא יבש") → answer only (action: none)
4. Steps, a workout, or a weight → see Activity and Weigh-ins; an activity screenshot → answer only
5. Late addition ("אתמול גם שתיתי...") → log to the correct date
6. Which meal it was ("זאת הייתה ארוחת בוקר", "תעביר את זה לערב", "זה היה חטיף") → action: update on the existing ids, changing only the meal slot. Keep every other value exactly as it is, and do not re-estimate the food.
If unsure whether they ate it or are only asking, ask in one short line and do not log yet.
When they say they ate it ("אכלתי"), it is eaten: action is add, even if it is a lot of food and even if you also ask something. A follow-up question goes in question and never holds the log back. Never write a message that says you logged something while action is none - nothing is logged then.

## Which meal of the day
- Each item carries an optional meal slot: breakfast, lunch, dinner, snack or drink. Today's log shows what each item is filed under now.
- Leave it out and the app files it by the clock, which is usually right. Set it when they SAY which meal it was ("אכלתי בבוקר", "ארוחת ערב") or when they ask you to move something.
- A drink on its own is drink; something small between meals is snack. Do not argue with them about which meal it was - if they say it was breakfast, it was breakfast.

## How to estimate food
- Break meals into items. Give each item a realistic portion and state the assumption ("הנחתי כ-150 גרם מבושל").
- Nutrition label in the photo: use the per-100g values and the package size. Branded items: use the package numbers. "PRO 20" means 20g protein per unit, not 20%.
- Restaurants: account for oil, butter, dressings, and fried items. Greek and Mediterranean dishes usually carry a lot of olive oil.
- Shared table: ask what share was theirs (half, a third, and so on).
- Ask at most ONE follow-up, and only about something that changes the numbers a lot (oil, dressing, milk in coffee, portion size, whether they finished). Log with your best assumption anyway, and offer to update.
- If the user challenges a number, re-check it honestly. If you were wrong, say so and fix it.

### Figures to use as given, not to re-estimate
These are the ones that come up most, and a guess that drifts from them is a guess that argues with yesterday's entry for the same food.
- Cottage 5%, per 100 g: 95 kcal, 11 g protein, 5 g fat
- Egg, size L: 70 kcal, 6.3 g protein
- Olive oil, one tablespoon: 120 kcal
- Yoghurt PRO 20: 130 kcal (and 20 g protein per unit - the number in the name is grams, not a percentage)
- GO: 110 kcal
- Müller PROTEIN 25: 160 kcal (25 g protein per unit)
Scale them by the amount actually eaten. If a label in a photo disagrees with this list, the label wins - it is the packet in front of them.

## Quantity rules
- Before logging, re-read the user's text for quantity words: "twice", "פעמיים", "2 מנות", "חצי", "עוד אחד", "כל הצלחת". These override what the photo shows.
- Multiple photos of the same plate = ONE plate, unless the user says otherwise. The number of photos is never the number of portions.
- The photo shows ONE portion. If the user says they ate it X times, portions = X.
- Count the pieces in the single clearest photo. Never add counts from two photos of the same plate together, and never split a plate between them - each photo shows the whole plate.
- portions = X goes on EVERY item that came from that plate, not only on some of them.
- unit_count is exactly what you wrote in photo_count - what you would count in the photo if they had eaten it ONCE. Being told "twice" never changes what you count in the photo - it only sets portions. Pieces standing in pairs or stacks are still counted one by one.
- Always state your count in the reply: "~7 pieces × 2 = 14 pieces".
- Sauce in a dish/ramekin ≈ 3-4 tbsp, not 1-2. Teriyaki ≈ 40-45 kcal/tbsp, mostly sugar.
- Restaurant food: when unsure between two estimates, take the higher one. Restaurants use more oil, sugar and sauce than home cooking.

### How to fill the numbers
- calories, protein, carbs and fat are for ONE portion. portions says how many times it was eaten (1 if not said; 0.5 for half). The app multiplies - never multiply yourself.
- Food that comes in pieces (sushi, dumplings, cookies, eggs, slices): also give unit_count (pieces in one portion) and the per-piece figures (kcal_per_unit, protein_per_unit, carbs_per_unit, fat_per_unit). The app then computes the totals from them.
- quantity describes everything that was eaten, for example "14 יחידות (7 × 2)".

### Sushi reference (per piece)
- Maki (thin roll): 25-35 kcal
- Uramaki/inside-out with avocado, cream cheese or mayo: 45-60 kcal
- Tempura/fried/crunchy roll: 60-80 kcal
- Nigiri: 40-60 kcal
- Sashimi: 25-40 kcal

## Consulting
- Fit every suggestion to what remains today: give calories and protein for each option, and prefer lean protein when protein is behind.
- Recipes: give totals and per-serving values. Log only when they say they ate it.
- Cooking problems: explain the cause and the fix in a few practical steps.
- Menus: rank the best 2–4 choices for their remaining targets, say what to skip and why, and give one ordering tip (for example, sauce on the side).

## Activity
- When the user reports steps for today ("הלכתי 14,000"), put the number in steps_reported. When they report a workout, set workout_reported: "strength" for weights or strength training, "cardio" for dance, running, aerobic classes or sport, with cardio_minutes when they say how long (60 if they don't). The app works out the bonus in code and sends it back; then reply in 2-3 lines: the bonus, the updated target, and what's left for today.
- A later number replaces the earlier one ("actually 17,000"); it never adds to it.
- Never use calorie numbers from watches or apps. Only steps and workout type. If the user quotes watch calories, explain briefly that watches tend to overestimate and that the app uses steps instead.
- Don't encourage eating back the activity bonus just to "use it". It's room, not an obligation.
- Only when the state says STEPS QUESTION, and only if this reply logs a dinner: end the reply with one short question asking how many steps they walked today, and that you'll update the target ("כמה צעדים הלכת היום? אעדכן לך את היעד"), and set asked_steps. Never ask it otherwise.

## Weight
- Weight: judge by the weekly average. Explain water swings (salt, carbs, alcohol, travel) and never react to a single day.
- Weight: judge by the weekly average. Explain water swings (salt, carbs, alcohol, travel) and never react to a single day.

## Tone and format
- Hebrew, short, mobile-friendly. Lead with the answer. One item per line, with the item name in bold and its values after it.
- Logging or correcting food is 1-3 short lines: what was logged and its figures, and at most one short warm note. Precise, to the point, kind.
- Never show your working: no arithmetic, no formulas, no "≈", no estimates of how you got there, and never think aloud or correct yourself mid-reply ("רגע", "בואי נדייק", "בעצם"). The reply is the result, not the way to it.
- After logging, add at most one short, practical note (for example, "החלבון נמוך, כדאי 40 גרם בארוחה הבאה").
- Honest, never guilt-tripping. Over target? Give perspective (weekly average, activity, maintenance) and move on. Never suggest compensating with extreme restriction the next day.
- Light emoji use is fine. No long lectures.

## Weigh-ins
- Weigh-ins happen in this chat. When the user reports their own body weight for today ("שקלתי 72.4", "72.4 הבוקר"), put it in weight_kg (in kilograms; convert pounds) and write nothing about it yet - the app then works out the trend in code and sends you the figures: today's weight, how it sits against the trend, the rate, and flags from the previous 1-2 days (sodium, carbs, alcohol, restaurant, late meal, training). Only then do you write the weigh-in reply.
- weight_kg only when weigh-ins are part of their tracking (WEIGH-INS ARE TRACKED below) and the weight is theirs, today. A weight from another day, a goal, or someone else's is not a weigh-in.
- Reply in 2-4 short lines: the number, how it compares to the trend (not to yesterday), the most likely reason for any change, and what it means.
- Always separate water from fat. A jump after salt, carbs, alcohol or a restaurant meal is water and will pass in 1-3 days. Gaining 1 kg of fat requires ~7,700 kcal surplus; use the logged data to show whether that's even possible.
- Never suggest eating less, skipping meals or "compensating" after a weight increase. The plan stays the same.
- Celebrate new lows, weekly average drops and milestones, but keep the focus on the trend.
- If the "expected vs actual" flag is on: explain gently that either some food isn't being logged or the maintenance estimate needs adjusting, and suggest reviewing the target. No blame.
- If the user hides the number, never mention it. Talk only about the trend.
- If the user shows distress about their weight or wants to cut drastically, follow the safety rules.
- A weigh-in turn logs no food: action none, no items, unless the same message also reports food.
- With weekly weigh-ins the trend is this week against last week; say so rather than comparing days.
- Never bring up weighing yourself. Only when the state says WEIGH-IN NUDGE, end the reply with ONE short line suggesting today's weigh-in ("אם עוד לא נשקלת היום, זה הזמן") - unless the reply is about distress or safety.

## Nutrition labels
- When an item comes from a nutrition label in a photo, fill its label fields: per_100g and per_package (kcal, protein, carbs, fat - each exactly as printed in THAT column), package_weight_g if printed, and what was eaten: portion_fraction of the package ("half" is 0.5, "the whole bag" is 1) or portion_g when they give grams. The app works out the item from these and tells you the figures. In the reply, name the column in a few words at most ("לפי עמודת השקית") - no calculation.
- Israeli labels often have two columns: per 100g and per package. Read each value from ONE column only.
- Prefer the per-package column when the user ate a whole or a fraction of a package. Use per-100g only when the user gives grams.
- Never mix values from different columns in the same item.
- Logged items carry the label data they were logged from (label). Use it to recalculate when asked; it is the source.

## Honesty when challenged
- Never say "I checked again" unless you actually have the label data or image in front of you now.
- If the user says a number is wrong and you don't have the source, say so plainly and ask for the label or the correct number. Don't defend the previous number.
- When the user disputes a value, treat it as likely that you made a mistake. Recalculate from the stored label data first.

## Edits and habits
- A message with an item_id and edited text is a correction to that item. Return action=update for that id only. Reply in one short line stating what changed and the kcal difference (plus the habit question below, when it applies). No "remaining today" block.
- The user profile includes "habits". Apply them by default when the user doesn't specify (e.g. assume no oil if the habit says so), and mention it briefly: "חישבתי בלי שמן כמו תמיד".
- If the user explicitly says otherwise in a message, the message wins over the habit.
- Count this message together with the recent corrections list: when the same kind of correction (for example "no oil", "milk 1%", "half a portion") appears 3 times or more, ask in THIS reply, in one short line, whether to remember it, and put it in habit_offer. Never save a habit without the user's confirmation.
- Recent history includes the recent corrections list. When you ask, put the habit, worded as it should be saved, in habit_offer. Never offer one that is already in the habits or in habits already offered.
- Only when the user has just said yes to saving it, put the habit text in habit_save. Nothing else ever saves one.

## Every logged item
- sodium_level: "high" for soy sauce, teriyaki, sushi, pickles, salty cheese, cured meat, snacks, instant noodles and most restaurant or takeaway food; "low" for plain fruit, vegetables, plain grains, plain meat or fish cooked at home; "medium" otherwise.
- restaurant: true when it came from a restaurant, takeaway or delivery.

## Safety
- Don't recommend intakes below about 1,500 kcal for men or 1,200 for women, or rapid-loss plans.
- If messages suggest disordered eating (fear around eating, purging, extreme restriction), step back from numbers, respond with care, and gently suggest professional support.`;

      const TOOL = {
        name: 'reply',
        description: 'The coach\'s answer, and whatever it changes about the day.',
        input_schema: {
          type: 'object',
          properties: {
            /* FIRST, so it is written before anything the words could bend:
               told "twice", the model kept counting six rolls standing in
               pairs as three per plate, while every "once" counted six */
            photo_count: { type: 'string', description: 'When there is a photo of food: what you see in it, piece by piece, counted as if they had eaten it ONCE - before reading anything they wrote. Empty when there is no photo.' },
            action: { type: 'string', enum: ['add', 'update', 'delete', 'none'] },
            date: { type: 'string', description: 'YYYY-MM-DD, the day these rows belong to' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'string' },
                  calories: { type: 'number' },
                  protein: { type: 'number' },
                  carbs: { type: 'number' },
                  fat: { type: 'number' },
                  assumption: { type: 'string' },
                  portions: { type: 'number', description: 'how many times this portion was eaten; 1 if not said' },
                  unit_count: { type: 'number', description: 'pieces in ONE portion, for food that comes in pieces' },
                  kcal_per_unit: { type: 'number' },
                  protein_per_unit: { type: 'number' },
                  carbs_per_unit: { type: 'number' },
                  fat_per_unit: { type: 'number' },
                  label: {
                    type: 'object',
                    description: 'ONLY for an item read from a nutrition label in a photo',
                    properties: {
                      per_100g: LABEL_COL, per_package: LABEL_COL,
                      package_weight_g: { type: 'number' },
                      portion_fraction: { type: 'number', description: 'part of the package eaten: 0.5 for half, 1 for all' },
                      portion_g: { type: 'number', description: 'grams eaten, when they said grams' },
                    },
                  },
                  sodium_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                  restaurant: { type: 'boolean' },
                  meal: {
                    type: 'string',
                    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'drink'],
                    description:
                      'Which meal of the day this belongs to. Leave it out and the app '
                      + 'files it by the clock; set it when they say which meal it was, '
                      + 'or when moving something already logged.',
                  },
                },
                required: ['id', 'name', 'quantity', 'calories', 'protein', 'carbs', 'fat'],
              },
            },
            question: { type: 'string' },
            habit_offer: { type: 'string', description: 'a habit you are asking whether to remember, worded as it would be saved' },
            habit_save: { type: 'string', description: 'ONLY when the user just confirmed saving a habit: its text' },
            weight_kg: { type: 'number', description: 'ONLY when the user reports their own body weight for today, in kg' },
            steps_reported: { type: 'number', description: 'ONLY when the user reports how many steps they walked today' },
            workout_reported: { type: 'string', enum: ['', 'strength', 'cardio'], description: 'ONLY when the user reports a workout today' },
            cardio_minutes: { type: 'number' },
            asked_steps: { type: 'boolean', description: 'true when this reply ends with the steps question' },
            message: { type: 'string', description: 'what the person reads, in their language' },
          },
          required: ['photo_count', 'action', 'date', 'items', 'message'],
        },
      };

      /* Everything it needs, every turn. It keeps nothing between calls. */
      const STATE =
        'Today is ' + day + '.\n' +
        'You are speaking to: ' + (gender === 'f' ? 'a woman - address her in the feminine'
          : gender === 'm' ? 'a man - address him in the masculine'
          : 'someone whose gender is not recorded - write so it does not show') + '\n' +
        'Targets: ' + JSON.stringify(targets) + (phase ? '   phase: ' + phase : '') + '\n' +
        'Already logged today: ' + JSON.stringify(logged) + '\n' +
        'Left of each target: ' + JSON.stringify(left) + '\n' +
        'Recent morning weigh-ins: ' + (wctx && wctx.hidden ? 'hidden by the user - never mention a weight'
          : weights.length ? JSON.stringify(weights) : 'none recorded') + '\n' +
        'Their habits: ' + (habits.length ? JSON.stringify(habits) : 'none saved') + '\n' +
        'Habits already offered (never offer again): ' + (offered.length ? JSON.stringify(offered) : 'none') + '\n' +
        'Their recent corrections, oldest first: ' + (recentFix.length ? JSON.stringify(recentFix) : 'none') +
        (wctx ? '\nWEIGH-INS ARE TRACKED (' + wctx.mode + (wctx.hidden ? ', THE USER HIDES THE NUMBER - never state or repeat any weight, even one they typed' : '') + ').' : '\nWeigh-ins are not part of their tracking.') +
        (weighNudge ? '\nWEIGH-IN NUDGE: today is a weigh-in day and they have not weighed in yet.' : '') +
        (actx ? '\nToday\'s activity so far (computed by the app): ' + JSON.stringify({ steps: actx.steps, strength: actx.strength,
          cardio_minutes: actx.cardio_min, bonus_kcal: activityBonus(actx).kcal, time_now: actx.now }) : '') +
        (askSteps ? '\nSTEPS QUESTION: if this reply logs a dinner, end with the steps question.' : '');

      /* A DISPUTE ("טעית", "זה לא נכון", "תבדוק שוב"), found by the app. A
         separate call reads the label again from scratch - the original
         picture and the stored label data, and NOT the coach's earlier reply,
         which is the thing in question - and the code compares. The coach
         then answers from that: corrected, explained, or "I don't have the
         source". */
      let disp = null;
      if (dispute) {
        const was = logged.find((x) => String(x && x.id) === dispute.id) || null;
        if (!dispute.image && !dispute.label) disp = { id: dispute.id, outcome: 'no_source', was };
        else {
          const rc = await labelRecheck(env, dispute, was, fetch);
          const now = rc && labelCompute(rc);
          if (!now || now.kcal === null) disp = { id: dispute.id, outcome: dispute.image ? 'unreadable' : 'no_source', was };
          else {
            const k0 = Number(was && was.calories) || 0, p0 = Number(was && was.protein) || 0;
            const changed = Math.abs(now.kcal - k0) > Math.max(5, k0 * 0.03) || Math.abs(now.p - p0) > 1.5;
            disp = { id: dispute.id, outcome: changed ? 'fixed' : 'confirmed', was, now, label: rc };
          }
        }
      }
      const dispNote = !disp ? '' : disp.outcome === 'fixed'
        ? '\nDISPUTE RECHECKED (by a separate reading of the label, compared in code): "' + ((disp.was && disp.was.name) || 'the item') +
          '" was logged as ' + JSON.stringify(disp.was && { kcal: disp.was.calories, protein: disp.was.protein }) +
          '; read again it is ' + JSON.stringify({ kcal: disp.now.kcal, protein: disp.now.p, carbs: disp.now.c, fat: disp.now.f }) +
          ' from the ' + disp.now.column + ' column (' + disp.now.how + '). In one or two short lines: they were right, you made a mistake, the new figures instead of the old. No calculation. The app updates the item.'
        : disp.outcome === 'confirmed'
        ? '\nDISPUTE RECHECKED (by a separate reading of the label, compared in code): the figures stand - ' +
          JSON.stringify({ kcal: disp.now.kcal, protein: disp.now.p }) + ' from the ' + disp.now.column + ' column (' + disp.now.how +
          '). Do not just insist: in one short line, say where the number comes from (for example "חצי מ-323 שבעמודת השקית"), kindly. No longer working.'
        : '\nDISPUTE WITHOUT SOURCE: you have neither the label image nor stored label data for "' + ((disp.was && disp.was.name) || 'that item') +
          '". Say so plainly, do not defend the number, and ask for a photo of the label or the correct number.';

      const msgs = [];
      for (let hi = 0; hi < history.length; hi++) {
        const t = history[hi];
        const role = (t && t.role) === 'assistant' ? 'assistant' : 'user';
        const text = String((t && t.text) || '').slice(0, 1200);
        const pics = role === 'user' ? histImages.filter((x) => Number(x && x.h) === hi) : [];
        if (pics.length) msgs.push({ role, content: pics.map((im) => ({ type: 'image',
          source: { type: 'base64', media_type: String(im.mime || 'image/jpeg'), data: String(im.data) } }))
          .concat([{ type: 'text', text: text || '(a photo)' }]) });
        else if (text) msgs.push({ role, content: text });
      }
      const content = [];
      for (const im of images)
        content.push({ type: 'image', source: { type: 'base64', media_type: String(im.mime || 'image/jpeg'), data: String(im.data) } });
      content.push({ type: 'text', text: STATE + dispNote + '\n\n' +
        (editId ? 'EDIT of item_id' + (editIds.length > 1 ? 's=' + editIds.join(',') : '=' + editId) +
          (editWas ? '. They had written: "' + editWas + '"' : '') + '. What it really was: ' : '') +
        (message || '(no words, only the picture)') });
      msgs.push({ role: 'user', content });

      /* One request, as a function, so a reply can be sent back once. */
      const MLP = medline.length ? '\n\n## Reference: MedlinePlus (U.S. National Library of Medicine)\nUse this as your factual basis on these conditions. When your answer relies on it, name the source as MedlinePlus and give the link once, at the end. Do not quote it at length; explain in the user\'s language.\n' +
        medline.map((m) => '### ' + m.title + ' (' + m.url + ')\n' + m.summary).join('\n\n') : '';
      const SYS = health.length ? SYSTEM + MLP + '\n\n## Health conditions the user chose to share\n' + health.join(', ') +
        '.\nTake them into account, following mainstream guidance from recognised medical bodies. You are NOT a doctor: never diagnose, never advise on medication or doses, and if they describe warning signs (for myasthenia: weakness in breathing, swallowing or vision; for diabetes: symptoms of a low) tell them to stop and contact their doctor. Whenever your reply touches their health or one of these conditions, end it with one short line, in their language, saying that you are not a doctor, that this is general information and not medical advice, and that they should check with their own doctor.' : SYSTEM;
      const ask = async (messages) => {
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
              /* Sonnet: it is looking at plates and reading labels, not
                 matching a word against a table. */
              model: 'claude-sonnet-5',
              max_tokens: 1600,
              system: SYS,
              tools: [TOOL],
              tool_choice: { type: 'tool', name: 'reply' },
              messages,
            }),
          });
        } catch {
          return { err: json({ error: 'the coach could not be reached' }, 502) };
        }
        if (!r.ok) {
          let why = '';
          try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
          return { err: json({ error: 'the coach refused', why }, 502) };
        }
        let dd;
        try { dd = await r.json(); } catch { return { err: json({ error: 'unreadable answer' }, 502) }; }
        const u0 = ((dd && dd.content) || []).find((c) => c && c.type === 'tool_use' && c.name === 'reply');
        if (!u0 || !u0.input) return { err: json({ error: 'no answer' }, 502) };
        return { d: dd, use: u0 };
      };

      let got = await ask(msgs), retried = false;
      if (got.err) return got.err;
      /* THE LABEL, IN CODE. A bag of chips was logged at 225 kcal - the per
         100 g column halved - with 10 g of protein - the per-bag column
         halved: two columns in one item. The model now only copies the
         columns; what was eaten is worked out here, the two columns are
         checked against each other, and the reply is written again from the
         figures - or, when the columns disagree, it asks instead of logging. */
      const labelNotes = [];
      for (const it of (got.use.input.items || [])) {
        const L = labelClean(it && it.label);
        if (!L) continue;
        const r = labelCompute(L);
        if (r.mismatch) labelNotes.push('"' + it.name + '": the columns disagree - per 100 g x ' + L.package_g + ' g = ' +
          r.mismatch.expected + ' kcal, but the package column says ' + r.mismatch.printed + '. Do NOT log it: show both and ask them to confirm which is right.');
        else if (r.kcal !== null) labelNotes.push('"' + it.name + '": ' + JSON.stringify({ kcal: r.kcal, protein: r.p, carbs: r.c, fat: r.f }) +
          ' from the ' + r.column + ' column (' + r.how + ').');
      }
      if (labelNotes.length) {
        const again = await ask(msgs.concat([
          { role: 'assistant', content: got.d.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: got.use.id,
            content: 'The app worked out the label items (in code - use these figures, do not recompute): ' +
              labelNotes.join(' ') + ' Send the whole reply again with these figures - short, naming the column in a few words, with no calculation.' }] },
        ]));
        if (!again.err) got = again;
      }
      /* THE CALORIES MUST BE THE MACROS. Asked to add half a tub of cottage
         5%, it once answered with the calories and no protein; her bars took
         the calories and not the protein, and only her own suspicion - "you
         did not add the cottage, did you" - corrected it. Nothing here could
         have caught it: the shape was perfect, only the numbers were not.
         So before anything reaches her day, every item's protein, carbs and
         fat must account for most of its calories, and a reply that fails is
         sent back ONCE, saying which item and why. A false alarm - wine,
         whose calories are alcohol - costs one more call and then stands as
         it was; it can never put a wrong number in her log. */
      const act0 = got.use.input.action;
      if (act0 === 'add' || act0 === 'update') {
        const short = coachMacrosShort((got.use.input.items || []).map(coachTotals));
        /* probeRetry walks the send-back with a reply that was fine, so the
           path can be seen working against the live API - the only place it
           can run. It changes no figure; it costs one more call. */
        if (b && b.probeRetry === 1 && !short.length && got.use.input.items && got.use.input.items[0])
          short.push(String(got.use.input.items[0].name || 'an item'));
        if (short.length) {
          const again = await ask(msgs.concat([
            { role: 'assistant', content: got.d.content },
            { role: 'user', content: [{ type: 'tool_result', tool_use_id: got.use.id, is_error: true,
              content: 'Not logged yet. For ' + short.join(', ') + ' the calories are not explained by the ' +
                'protein, carbs and fat you gave (4 kcal per gram of protein and of carbs, 9 per gram of ' +
                'fat). Send the whole reply again with all four figures for every item. Leave a ' +
                'macronutrient at 0 only if the food truly has none of it.' }] },
          ]));
          if (!again.err) { got = again; retried = true; }
        }
      }
      /* A WEIGH-IN. The model only noticed the number; the arithmetic is
         done here, from the trend the app sent, and the reply is written
         from those figures in a second pass. */
      let weighedKg = null;
      const wk = Number(got.use.input.weight_kg);
      if (wctx && isFinite(wk) && wk >= 20 && wk <= 400) {
        weighedKg = Math.round(wk * 100) / 100;
        const fig = weighResult(wctx, weighedKg);
        const again = await ask(msgs.concat([
          { role: 'assistant', content: got.d.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: got.use.id,
            content: 'The app recorded the weigh-in and worked out (in code - use these, do not recompute): ' +
              JSON.stringify(fig) + '. Send the reply again: the weigh-in reply under the Weigh-ins rules, ' +
              'keeping any food from the same message.' + (wctx.hidden ? ' The number is hidden: no weight anywhere in it.' : '') }] },
        ]));
        if (!again.err) got = again;
      }
      /* ACTIVITY. Same shape as a weigh-in: the model noticed the steps or
         the workout, the bonus is worked out here, the reply is written from
         it. The latest steps replace the earlier ones, never add to them. */
      let actOut = null;
      const rs = Number(got.use.input.steps_reported), rw = String(got.use.input.workout_reported || '');
      if (actx && ((isFinite(rs) && rs > 0) || rw === 'strength' || rw === 'cardio')) {
        const nx = Object.assign({}, actx);
        if (isFinite(rs) && rs > 0) nx.steps = Math.min(200000, Math.round(rs));
        if (rw === 'strength') nx.strength = true;
        if (rw === 'cardio') nx.cardio_min = Math.max(0, Math.min(600, Math.round(Number(got.use.input.cardio_minutes) || 60)));
        const was = activityBonus(actx), now = activityBonus(nx);
        actOut = { steps: nx.steps, strength: nx.strength, cardio_min: nx.cardio_min, bonus: now.kcal };
        const fig = { steps: nx.steps, baseline_steps: nx.base, strength: nx.strength, cardio_minutes: nx.cardio_min,
          bonus_kcal: now.kcal, bonus_carbs_g: now.carbs, bonus_fat_g: now.fat, base_target_kcal: actx.target,
          target_today_kcal: actx.target + now.kcal, left_today_kcal: Math.round(actx.left + now.kcal - was.kcal),
          capped: now.capped };
        const again = await ask(msgs.concat([
          { role: 'assistant', content: got.d.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: got.use.id,
            content: 'The app recorded the activity and worked out (in code - use these, do not recompute): ' +
              JSON.stringify(fig) + '. Send the reply again under the Activity rules, keeping any food from the same message.' }] },
        ]));
        if (!again.err) got = again;
      }
      const d = got.d, use = got.use;

      const out = use.input;
      /* The tool fixes the SHAPE, not the values: a date is still a string it
         chose, and this one is written into a day of her food. */
      const at = /^\d{4}-\d{2}-\d{2}$/.test(String(out.date || '')) ? out.date : day;
      let items = (Array.isArray(out.items) ? out.items : []).slice(0, 30).map((it) => ({
        id: String(it.id || '').slice(0, 40) || ('c' + Math.random().toString(36).slice(2, 8)),
        name: String(it.name || '').slice(0, 120),
        quantity: String(it.quantity || '').slice(0, 80),
        ...coachTotals(it),
        ...labelItem(it),
        assumption: String(it.assumption || '').slice(0, 200),
        /* one of the five or nothing: an unknown slot would be written
           into her day and then shown as a meal that does not exist */
        meal: ['breakfast', 'lunch', 'dinner', 'snack', 'drink']
          .indexOf(String(it.meal || '')) >= 0 ? String(it.meal) : '',
        sodium_level: ['low', 'medium', 'high'].indexOf(String(it.sodium_level || '')) >= 0 ? String(it.sodium_level) : '',
        restaurant: it.restaurant === true,
      })).filter((it) => it.name);
      let action = ['add', 'update', 'delete', 'none'].indexOf(out.action) >= 0 ? out.action : 'none';
      if (editId) ({ action, items } = coachEditOnly(action, items, editIds));
      /* a label whose columns disagree is asked about, never logged */
      items = items.filter((it) => !it.label_mismatch).map((it) => { const o = Object.assign({}, it); delete o.label_mismatch; return o; });
      if (!items.length && (action === 'add' || action === 'update')) action = 'none';
      /* a dispute decides its own outcome: corrected, or nothing changes */
      if (disp) {
        if (disp.outcome === 'fixed') {
          const w = disp.was || {};
          action = 'update';
          items = [{ id: disp.id, name: String(w.name || '').slice(0, 120), quantity: String(w.quantity || '').slice(0, 80),
            calories: disp.now.kcal, protein: disp.now.p, carbs: disp.now.c, fat: disp.now.f, portions: 1, units: 0,
            assumption: '', meal: '', sodium_level: '', restaurant: false, label: disp.label }];
        } else if (action === 'update' && items.some((it) => it.id === disp.id)) { action = 'none'; items = []; }
      }
      /* hidden: the number she typed is not said back to her, whatever the
         model wrote - any figure within three kilos of it goes */
      /* a line break the model wrote as the two characters \ and n reached
         her screen as "n\" in the middle of a word, and broke the bold */
      let msgOut = String(out.message || '').replace(/\\n/g, '\n').slice(0, 4000);
      if (weighedKg !== null && wctx.hidden) msgOut = weighScrub(msgOut, weighedKg);
      const hs = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 120);

      /* what the turn cost, as the API counted it - estimates of this were
         out by a factor of two in both directions */
      const u = (d && d.usage) || {};
      return json({
        ok: true,
        usage: { in: u.input_tokens || 0, out: u.output_tokens || 0 },
        retried,   // sent back once because its numbers did not add up
        action,
        date: at,
        items,
        question: String(out.question || '').slice(0, 300),
        habit_offer: hs(out.habit_offer),
        habit_save: hs(out.habit_save),
        message: msgOut,
        weight_kg: weighedKg,
        dispute: disp ? { id: disp.id, outcome: disp.outcome,
          before: disp.was ? { kcal: Number(disp.was.calories) || 0, protein: Number(disp.was.protein) || 0 } : null,
          after: disp.now ? { kcal: disp.now.kcal, protein: disp.now.p } : null } : null,
        weigh_nudged: weighNudge,   // the app remembers, so it is said once a day
        activity: actOut,
        asked_steps: askSteps && out.asked_steps === true,
        /* due, and this reply logged a dinner: when the model left the
           question out anyway - it did, live - the app adds it itself */
        steps_due: askSteps && action === 'add' &&
          items.some((it) => it.meal === 'dinner' || (!it.meal && actx.now >= '18:00')),
      });
    }

    /* ── THE WEEKLY LETTER ──
       The app draws the week's charts itself. This says what they mean, in
       four to six sentences, and the prompt spends most of its length on
       what not to write - no figure already on the screen, no sentence that
       would fit anyone else's week, no guilt.
       Plain text, not a tool: nothing here reaches her food log, so there is
       no shape to enforce. */
    if (url.pathname === '/week' && req.method === 'POST') {
      if (!env.AI_KEY) return json({ error: 'the coach is not configured' }, 503);

      let b;
      try { b = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

      const from = String((b && b.from) || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) return json({ error: 'bad week' }, 400);
      const LANG = langName(b && b.lang);
      const units = (b && b.units) === 'imperial' ? 'imperial' : 'metric';
      const gender = (b && b.gender) === 'f' ? 'f' : (b && b.gender) === 'm' ? 'm' : '';
      const targets = (b && b.targets) || {};
      /* seven, and seven is the whole point - more would be another feature */
      const days = (Array.isArray(b && b.days) ? b.days : []).slice(0, 7);
      if (!days.length) return json({ error: 'nothing to look at' }, 400);
      const weights = (Array.isArray(b && b.weights) ? b.weights : []).slice(-14);

      /* READ ONCE A WEEK. Anything past a handful of calls in a day is a
         loop, not a person, so the cap is small on purpose. */
      const cap = Number(env.WEEK_DAILY_CAP || 8);
      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const today = new Date().toISOString().slice(0, 10);
      const ipKey = 'wk:' + today + ':' + ip;
      const used = Number((await env.SUBS.get(ipKey)) || 0);
      if (used >= cap) return json({ error: 'too many for today' }, 429);
      await env.SUBS.put(ipKey, String(used + 1), { expirationTtl: 172800 });

      /* kept in coach/week-prompt.txt so the repo and the worker cannot
         drift apart */
      const SYSTEM = `You write one short weekly letter to someone using "Olimei". You are the same coach they talk to every day, looking back over their week.

You are given, for each of the seven days: what they ate against their targets, whether they trained, how they rated the day, their steps, and their morning weight. You are given the weekly averages and the targets themselves. The app has already computed every number and is already showing the charts above your words, so you never repeat a figure they can see - you say what it MEANS.

Write in the reader's language, addressing them in the grammatical gender you are given. Hebrew marks it on the verb, so it shows in every sentence.

## What the letter is
Four to six sentences. No headings, no bullet list, no emoji beyond one at most. It reads like a person who watched the week, not like a report.

1. Open with the one thing that actually characterises the week. Not "you logged 6 days" - something they would recognise: the protein held every day except the two they went out, the weight is flat but the average moved, the weekend is where it goes.
2. Name one thing that went well, specifically enough that it is clearly about THIS week.
3. Name one thing worth changing, and make it a single concrete action for next week - not a principle. "Put 40 g of protein in the first meal" rather than "watch your protein".
4. Close in a way that does not demand anything.

## What you never do
- Never total or re-state figures the charts already show. One number, at most, and only if the sentence needs it to make sense.
- Never praise a deficit for being large, and never suggest making up for a heavy week. If the week was heavy, say it plainly and move on.
- Never speak about a single day's weight. The weekly average is the only weight that means anything.
- Never say "keep it up" or anything that would fit any week. If the sentence would be true of someone else's week, it is the wrong sentence.
- No guilt. Ever.

## When there is not much there
If they logged two or three days, say so without reproach and write about what those days show. A short honest letter beats a padded one. If there is genuinely nothing to say, say that the week was quiet and that next week will have more to go on - in one sentence, not four.`;

      const WHO = gender === 'f' ? 'a woman - address her in the feminine'
                : gender === 'm' ? 'a man - address him in the masculine'
                : 'someone whose gender is not recorded - write so it does not show';
      const STATE =
        'Answer in ' + LANG + '. Units are ' + units + '.\n' +
        'You are writing to: ' + WHO + '\n' +
        'The week starting ' + from + '.\n' +
        'Daily targets: ' + JSON.stringify(targets) + '\n' +
        'The seven days: ' + JSON.stringify(days) + '\n' +
        'Morning weigh-ins: ' + (weights.length ? JSON.stringify(weights) : 'none recorded');

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
            model: 'claude-sonnet-5',
            max_tokens: 700,
            system: SYSTEM,
            messages: [{ role: 'user', content: STATE }],
          }),
        });
      } catch {
        return json({ error: 'the coach could not be reached' }, 502);
      }
      if (!r.ok) {
        let why = '';
        try { const e = await r.json(); why = String((e && e.error && e.error.message) || '').slice(0, 200); } catch {}
        return json({ error: 'the coach refused', why }, 502);
      }
      let d;
      try { d = await r.json(); } catch { return json({ error: 'unreadable answer' }, 502); }
      const text = ((d && d.content) || []).map((c) => c.text || '').join('').trim();
      /* AN EMPTY ANSWER AND WHY. "no answer" said the text was empty and
         nothing about the cause, which is the difference between a refusal,
         a truncation and a block of a kind we do not read. */
      if (!text) return json({ error: 'no answer',
        stop: (d && d.stop_reason) || '',
        kinds: ((d && d.content) || []).map((c) => c && c.type).join(','),
        n: ((d && d.content) || []).length }, 502);
      const u = (d && d.usage) || {};
      return json({ ok: true, text: text.slice(0, 2000),
                    usage: { in: u.input_tokens || 0, out: u.output_tokens || 0 } });
    }

    if (url.pathname === '/analyze' && req.method === 'POST') {
      /* EITHER provider, now that Gemini can use the tools too. */
      if (!env.AI_KEY && !env.GEMINI_KEY) return json({ error: 'analysis is not configured' }, 503);

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

      let r, why = '';
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
            /* Gemini's signatures come off here and nowhere else. */
            messages: stripGemSig(messages),
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

      /* WHOEVER ANSWERS - and with Gemini the whole turn comes back already
         translated into Anthropic's shape, so the return below is unchanged
         and the app never learns who was asked. */
      let out = null;
      if (r && r.ok) { try { out = await r.json(); } catch { out = null; } }
      if (!out || !Array.isArray(out.content) || !out.content.length) {
        const g = await geminiTurn(SYSTEM, TOOLS, messages, 1500);
        if (g) out = g;
      }
      if (!out) {
        return (r && !r.ok)
          ? json({ error: 'the model refused', status: r.status, why, gem_why: gemWhy }, 502)
          : json({ error: 'could not reach the model', gem_why: gemWhy }, 502);
      }

      return json({
        ok: true,
        stop_reason: out.stop_reason || '',
        content: Array.isArray(out.content) ? out.content : [],
      });
    }

    return json({ error: 'not found' }, 404);
}
