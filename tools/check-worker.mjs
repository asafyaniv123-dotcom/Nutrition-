/* Does the Worker actually compile, and do its prompts actually build?
 *
 * `node --check push-server/src/worker.js` REPORTED OK on a file containing
 * `'an honest \\'I cannot see it\\''` - a string that closes early and leaves a
 * bare identifier behind. vm.Script rejects the same file in a tenth of a
 * second. I do not know why --check passes it; I know not to trust it again.
 *
 * And compiling is not enough either, which is this repo's oldest lesson:
 * a prompt is built by concatenating thirty string literals at CALL time, so a
 * broken one throws only when that route is hit. So every SYSTEM prompt is
 * evaluated here too, and printed long enough to see that it is prose.
 */
import fs from 'fs';
import vm from 'vm';

const W = 'push-server/src/worker.js';
const src = fs.readFileSync(W, 'utf8');

/* It is a module; a Script cannot hold either export form, so both are turned
   into ordinary statements. Nothing else is touched - the point is to compile
   the real bytes, not a paraphrase of them. */
const asScript = src
  .replace(/^export default/m, 'const __default =')
  .replace(/^export \{[^}]*\};?/m, '');
try {
  new vm.Script(asScript, { filename: W });
  console.log('worker compiles');
} catch (e) {
  console.log('WORKER DOES NOT COMPILE: ' + e.message);
  process.exit(1);
}

/* Every prompt, built the way the route builds it. */
const re = /const SYSTEM =\n([\s\S]*?);\n/g;
let m, n = 0, bad = 0;
while ((m = re.exec(src))) {
  n++;
  /* The prompts read a handful of locals. They are stubbed rather than
     substituted textually, so what is compiled is the real expression. */
  const sandbox = {
    LANG: 'Japanese',
    langName: () => 'Japanese',
    country: 'france',
    where: 'in france',
    tag: 'en:france',
    b: { lang: 'ja' },
  };
  try {
    const v = vm.runInNewContext('(' + m[1] + ')', sandbox);
    if (typeof v !== 'string' || v.length < 40) throw new Error('not prose: ' + JSON.stringify(v).slice(0, 60));
    console.log('  prompt ' + n + ': ' + v.length + ' chars, starts "' + v.slice(0, 46).replace(/\n/g, ' ') + '..."');
  } catch (e) {
    bad++;
    console.log('  prompt ' + n + ' DOES NOT BUILD: ' + e.message);
  }
}
console.log(n + ' prompts, ' + bad + ' broken');
process.exit(bad ? 1 : 0);
