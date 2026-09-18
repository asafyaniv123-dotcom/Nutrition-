/* A whole tool-using conversation, driven through the translator with no
 * network at all.
 *
 *     node tools/test-tool-adapter.mjs
 *
 * /ask and /analyze hand the app Anthropic's content array verbatim, because
 * the app appends it to a conversation and answers with tool_result blocks.
 * When Gemini answers instead, the worker has to produce that same shape out
 * of a different protocol — and get it right in BOTH directions, because the
 * app's reply comes straight back and has to be translated the other way.
 *
 * The translators are pure, which is the whole reason this test can exist: a
 * multi-turn exchange can be walked end to end here in milliseconds, instead
 * of spending a real conversation and a real quota on every run. What is NOT
 * covered is Gemini itself — whether it chooses to call a tool at all is the
 * model's business, and no test here can make it.
 *
 * The three things that would break it silently, each asserted below:
 *
 *   THE ID ROUND TRIP. Gemini has no tool-call id and matches results to
 *   calls by NAME. The id handed to the app carries the name inside it, and
 *   the tool_result that comes back is read for it. Lose that and every
 *   result is delivered to the wrong function, or to none.
 *
 *   THE ROLE. Gemini's assistant is called "model". Send it "assistant" and
 *   the turn is not rejected — it is ignored, which is worse.
 *
 *   THE RESULT'S TYPE. The app sends tool_result.content as a JSON STRING
 *   because that is what Anthropic takes. Gemini wants an object, and handing
 *   it the string gets a model reading its own data as a quoted blob.
 */
import {
  toGeminiTools, toGeminiContents, fromGeminiContent, geminiCallId, nameFromCallId,
  stripGemSig,
} from '../push-server/src/worker.js';

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* the real tool, copied from the route rather than invented */
const TOOLS = [{
  name: 'get_day',
  description: "One day of the user's own food log.",
  input_schema: {
    type: 'object',
    properties: { date: { type: 'string', description: 'YYYY-MM-DD, or "today".' } },
    required: ['date'],
  },
}, {
  name: 'search_food',
  description: 'Look a food up in the tables.',
  input_schema: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] },
}];

console.log('the tools themselves');
const gt = toGeminiTools(TOOLS);
ok(Array.isArray(gt) && gt.length === 1, 'become one tools entry');
ok(gt[0].functionDeclarations.length === 2, 'holding both declarations');
ok(gt[0].functionDeclarations[0].name === 'get_day', 'by name');
ok(eq(gt[0].functionDeclarations[0].parameters, TOOLS[0].input_schema),
   'with input_schema carried across as parameters, unchanged');
ok(toGeminiTools([]) === undefined, 'and no tools at all sends no tools field');

console.log('');
console.log('turn one: the question goes out');
const q = 'כמה חלבון אכלתי היום?';
let messages = [{ role: 'user', content: [{ type: 'text', text: q }] }];
let contents = toGeminiContents(messages);
ok(contents.length === 1 && contents[0].role === 'user', 'one user turn');
ok(eq(contents[0].parts, [{ text: q }]), 'carrying the question and nothing else');

console.log('');
console.log('turn one: Gemini asks for the day');
/* what the provider sends back when it wants a tool */
const geminiWantsTool = {
  content: { role: 'model', parts: [{ functionCall: { name: 'get_day', args: { date: 'today' } } }] },
};
const first = fromGeminiContent(geminiWantsTool);
ok(first.stop_reason === 'tool_use', 'which is reported as a tool_use turn');
ok(first.content.length === 1 && first.content[0].type === 'tool_use', 'as one tool_use block');
ok(first.content[0].name === 'get_day', 'naming the function');
ok(eq(first.content[0].input, { date: 'today' }), 'with its arguments as input, which is what the app reads');
ok(nameFromCallId(first.content[0].id) === 'get_day',
   'and an id the name can be read back out of (' + first.content[0].id + ')');

console.log('');
console.log('the app runs the tool and answers, exactly as it does today');
/* verbatim from askTurn: the assistant turn, then a tool_result carrying the
   id and a STRINGIFIED value */
const value = { kcal: 1840, p: 137.5, c: 160, f: 61 };
messages = messages.concat([
  { role: 'assistant', content: first.content },
  { role: 'user', content: [{ type: 'tool_result', tool_use_id: first.content[0].id, content: JSON.stringify(value) }] },
]);

contents = toGeminiContents(messages);
ok(contents.length === 3, 'three turns go back to Gemini');
ok(contents[1].role === 'model', 'the assistant turn is called "model" (got ' + contents[1].role + ')');
ok(eq(contents[1].parts, [{ functionCall: { name: 'get_day', args: { date: 'today' } } }]),
   'and is a functionCall again, not a tool_use block');
const fr = contents[2].parts[0].functionResponse;
ok(!!fr, 'the result is a functionResponse');
ok(fr.name === 'get_day', 'addressed to the function that asked (got ' + fr.name + ')');
ok(typeof fr.response === 'object' && fr.response.p === 137.5,
   'carrying a real object, not the JSON string the app sent (p=' + fr.response.p + ')');

console.log('');
console.log('turn two: the answer');
const geminiAnswers = {
  content: { role: 'model', parts: [{ text: 'אכלת היום 137.5 גרם חלבון.' }] },
};
const second = fromGeminiContent(geminiAnswers);
ok(second.stop_reason === 'end_turn', 'no more tools wanted');
ok(second.content.length === 1 && second.content[0].type === 'text', 'just text');
ok(/137.5/.test(second.content[0].text), 'built from the data the tool returned');

console.log('');
console.log('two tools in one turn, which the app loops over');
const twoCalls = fromGeminiContent({
  content: { parts: [
    { text: 'רגע' },
    { functionCall: { name: 'get_day', args: { date: 'today' } } },
    { functionCall: { name: 'search_food', args: { q: 'יוגורט' } } },
  ] },
});
ok(twoCalls.content.length === 3, 'text and both calls come through');
const ids = twoCalls.content.filter((c) => c.type === 'tool_use').map((c) => c.id);
ok(ids.length === 2 && ids[0] !== ids[1], 'with two distinct ids (' + ids.join(', ') + ')');
ok(ids.map(nameFromCallId).join(',') === 'get_day,search_food',
   'each decoding to its own function');

console.log('');
console.log("Gemini's signature makes the whole round trip");
/* This model signs every function call and refuses the next turn without it:
   "Function call is missing a thought_signature". Anthropic's protocol has
   nowhere to put one, so it rides inside the tool_use block the app hands
   back verbatim — and must be gone again before Anthropic ever sees it. */
const signed = fromGeminiContent({ content: { parts: [
  { functionCall: { name: 'get_day', args: { date: 'today' } }, thoughtSignature: 'SIG-abc' },
] } });
ok(signed.content[0]._gem_sig === 'SIG-abc', 'it comes off the part and onto the block');
const backToGemini = toGeminiContents([{ role: 'assistant', content: signed.content }]);
ok(backToGemini[0].parts[0].thoughtSignature === 'SIG-abc', 'and goes back on the way in');
const snake = fromGeminiContent({ content: { parts: [
  { functionCall: { name: 'get_day', args: {} }, thought_signature: 'SIG-snake' },
] } });
ok(snake.content[0]._gem_sig === 'SIG-snake', 'spelled either way');
const clean = stripGemSig([{ role: 'assistant', content: signed.content }]);
ok(!('_gem_sig' in clean[0].content[0]), 'Anthropic is never handed one');
ok(clean[0].content[0].name === 'get_day' && clean[0].content[0].id === signed.content[0].id,
   'and nothing else on the block is disturbed');
ok(stripGemSig([{ role: 'user', content: 'plain' }])[0].content === 'plain',
   'a turn with no blocks passes through untouched');
const unsigned = fromGeminiContent({ content: { parts: [{ functionCall: { name: 'x', args: {} } }] } });
ok(!('_gem_sig' in unsigned.content[0]), 'an unsigned call carries no empty field');

console.log('');
console.log('and the awkward shapes do not throw');
ok(eq(toGeminiContents([{ role: 'user', content: 'a bare string' }])[0].parts, [{ text: 'a bare string' }]),
   'a string content becomes a text part');
const notJson = toGeminiContents([{ role: 'user', content: [{ type: 'tool_result', tool_use_id: 'gem:get_day:0', content: 'not json at all' }] }]);
ok(notJson[0].parts[0].functionResponse.response.result === 'not json at all',
   'a result that is not JSON is wrapped rather than dropped');
ok(nameFromCallId('anthropic-style-id') === '', 'an id from the other provider decodes to nothing rather than guessing');
ok(toGeminiContents([{ role: 'user', content: [] }]).length === 0, 'an empty turn is left out entirely');
ok(fromGeminiContent(null).content.length === 0, 'and no candidate at all is an empty answer, not a crash');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('the loop survives the round trip, in both directions');
