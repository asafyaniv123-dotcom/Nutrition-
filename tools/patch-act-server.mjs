/* /act - the chat that DOES (Asaf, 25 Oct: "the whole idea of this screen is
 * not to ask questions about the app but to perform the same actions you can
 * on the other screen, just by chat").
 *
 * The model is the app's hands. It reads the person's own data through tools
 * the PHONE answers (nothing about their day lives on this server), and it
 * acts through write tools that the phone turns into a card the person
 * confirms - so a misheard sentence never writes anything by itself. Food is
 * handed to the nutrition coach, which already does it properly.
 * Same budget shape as /beem, its own key; Claude first, Gemini if Claude
 * cannot answer (which is what keeps it alive while the credit is out). */
import fs from 'fs';
const F = 'push-server/src/worker.js';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };

rep(`const ASK_TOOLS = [`, `/* The chat's tools. Reads are answered by the phone from its own storage;
   writes are PROPOSALS - the phone shows each as a card and writes only when
   the person confirms. Names (people, hobbies, exercises, topics) must be
   ones a read returned. */
const ACT_READS = [
  { name: 'get_plan', description: "The person's day plan: items with their time if they have one. Use for anything about what is on today, tomorrow or a date.",
    input_schema: { type: 'object', properties: { date: { type: 'string', description: 'YYYY-MM-DD, or "today" / "tomorrow".' } }, required: ['date'] } },
  { name: 'get_fitness', description: "Fitness: today's planned workout, the week plan, the person's programs with their exercises, recent workouts with their sets, personal records, current working weights. Read it before logging a set, so the exercise name is the one they use.",
    input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_hobbies', description: 'Hobbies: each with how it is tracked (time in minutes, a count, or done), today\\'s amount, the last 7 days, and the target.',
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
const ASK_TOOLS = [`);

rep(`    if (url.pathname === '/ask' && req.method === 'POST') {`, `    /* the chat that does: see ACT_READS / ACT_WRITES */
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
      const name = String((b && b.name) || '').replace(/[^\\p{L}\\p{M} '\\-]/gu, '').trim().slice(0, 24);
      const form = (b && b.form) === 'f' ? 'f' : (b && b.form) === 'm' ? 'm' : '';
      const today = /^\\d{4}-\\d{2}-\\d{2}$/.test(String((b && b.today) || '')) ? b.today : day;
      const now = /^\\d{2}:\\d{2}$/.test(String((b && b.now) || '')) ? b.now : '';
      const weekday = String((b && b.weekday) || '').slice(0, 12);
      const units = (b && b.units) === 'imperial' ? 'imperial' : 'metric';
      const SYSTEM =
        'You are Olimei\\'s chat: the person does here, in words, what they would otherwise do by tapping the app\\'s screens -\\n' +
        'nutrition, fitness, hobbies, people, planning, closet, insights and the end-of-day summary.\\n' +
        'Write everything in ' + lang + '.' +
        (lang === 'Hebrew' ? ' Address the person in the ' + (form === 'f' ? 'feminine' : 'masculine') + ' singular.' : '') +
        (name ? ' Their name is ' + name + '; use it rarely.' : '') + '\\n' +
        'Today, by the app\\'s clock (the day ends at 04:00), is ' + today + (weekday ? ' (' + weekday + ')' : '') + (now ? ', and it is ' + now : '') + '.\\n' +
        'They use ' + units + ' units.\\n' +
        (place ? 'They are in the ' + place + ' part of the chat: read what they say as being about that area.\\n' : 'They are in the general chat: it can be about any area.\\n') +
        '\\n' +
        'DO WHAT THEY ASK with the tools. Every write tool shows them a card to confirm, so call it with exactly what they said.\\n' +
        'Never invent a value they did not give - a time, a weight, a number of sets, a person. If something essential is missing, ask one short question instead of guessing.\\n' +
        'Names of people, hobbies, exercises and insight topics must be ones a read tool returned: read first, then write. If the name they used matches none, say so briefly and offer the closest one.\\n' +
        'Several things in one sentence: one write tool call for each.\\n' +
        'Food or drink other than plain water goes to log_food with their own words - never log food yourself.\\n' +
        'Questions about their own data: read, and state only numbers a tool returned in this conversation.\\n' +
        'After writes, answer in one short sentence - the cards show the details. Otherwise one to three short sentences. No lists unless they asked for one. No explanations of how the app works unless they ask.\\n' +
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

    if (url.pathname === '/ask' && req.method === 'POST') {`);
rep(`const METER_ROUTES = ['/parse',`, `const METER_ROUTES = ['/act', '/parse',`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
