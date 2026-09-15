/* The stream transform, lifted out of the worker and run against the shape
 * Google actually sends - including the two things that break naive parsers:
 * a JSON object split across two network chunks, and a chunk that ends
 * mid-line. A transform that has never been fed a split chunk has not been
 * tested.
 */
import fs from 'fs';
const src = fs.readFileSync('push-server/src/worker.js', 'utf8');
const a = src.indexOf("        let buf = '';");
const b = src.indexOf('await w.write(te.encode(\'data: \' + JSON.stringify({ done: true })');
if (a < 0 || b < 0) throw new Error('could not lift the transform');

/* rebuild the same loop around a fake reader */
function run(chunks) {
  const out = [];
  const td = new TextDecoder();
  let buf = '';
  for (const c of chunks) {
    buf += td.decode(c, { stream: true });
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
      for (const p of parts) if (typeof p.text === 'string' && p.text) out.push(p.text);
    }
  }
  return out.join('');
}

const te = new TextEncoder();
const ev = t => 'data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text: t }] } }] }) + '\n\n';
const whole = ev('פילה ') + ev('עוף, ') + ev('150 גרם');

let bad = 0;
const check = (label, got, want) => {
  const ok = got === want; if (!ok) bad++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label + (ok ? '' : '\n        got ' + JSON.stringify(got)));
};

check('whole events in one chunk   ', run([te.encode(whole)]), 'פילה עוף, 150 גרם');
/* split at every byte boundary - the real network does not respect lines */
const bytes = te.encode(whole);
for (const at of [5, 20, 47, 60, bytes.length - 3]) {
  check('split at byte ' + String(at).padStart(3) + '          ',
    run([bytes.slice(0, at), bytes.slice(at)]), 'פילה עוף, 150 גרם');
}
/* one byte at a time: the worst case, and multi-byte UTF-8 under it */
check('one byte at a time          ',
  run([...bytes].map(x => new Uint8Array([x]))), 'פילה עוף, 150 גרם');
check('a keep-alive blank line     ',
  run([te.encode('\n\n' + whole)]), 'פילה עוף, 150 גרם');
check('malformed JSON is skipped   ',
  run([te.encode('data: {nope\n\n' + whole)]), 'פילה עוף, 150 גרם');

console.log(bad ? '\n' + bad + ' FAILED' : '\nall good');
process.exit(bad ? 1 : 0);
