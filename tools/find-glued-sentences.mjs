/* Find sentences that were built by gluing pieces together.

   The shape that breaks in translation is: a translated fragment, then a value,
   then another translated fragment. Each half is meaningless alone and the
   order is fixed by the language it was written in, so no dictionary can
   repair it - agoText was the first of these, and there are more.

   Reports them ranked by how many _t fragments the sentence spans, because
   that is roughly how badly it breaks. */
import fs from 'fs';

const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
const s = fs.readFileSync('dev/index.html', 'utf8').split(CR + LF).join(LF);
const gs = s.indexOf('id="game-src"'), ge = s.indexOf('</script>', gs);
const app = s.slice(0, gs) + s.slice(ge);

/* A _t call, then up to ~60 characters of anything that is not a _t call, then
   another _t call - all inside one expression (no semicolons or line breaks). */
const re = /_t\((['"])((?:(?!\1).)*)\1\)((?:[^;\n]{0,70}?))_t\((['"])((?:(?!\4).)*)\4\)/g;

const hits = [];
let m;
while ((m = re.exec(app)) !== null) {
  const between = m[3];
  if (!/\+/.test(between)) continue;
  if (/<\/?[a-z]/i.test(between)) continue;         // separated by markup, not one sentence

  /* The overwhelming majority of matches are ARRAYS of labels -
     ['ינואר','פברואר',…] - where all that sits between two _t calls is a comma
     and the empty strings the extraction left behind. Those are independent
     words, each translatable on its own, and nothing is glued.

     A real glued sentence has a VALUE interpolated between the fragments. So
     strip the string literals out of the gap; what remains must still contain
     an identifier. */
  const bare = between.replace(/(['"])(?:(?!\1).)*\1/g, '').replace(/[\s+,]/g, '');
  if (!/[A-Za-z_$]/.test(bare)) continue;
  if (/^[[\]{}:()]*$/.test(bare)) continue;

  /* Two more shapes that look glued and are not.
     An OBJECT LITERAL - {sleep:'שינה', work:'עבודה'} - puts a key between two
     labels, and a key is an identifier, so the test above lets it through.
     A TERNARY chooses between two whole labels rather than joining them.

     Both are recognisable once the string literals are stripped: an object key
     leaves "work:" and a ternary leaves ":allGood?", while a real interpolated
     value leaves "tot.p" or "ms[i].text||". A leading or trailing colon is the
     tell. */
  if (/:$/.test(bare) || /^:/.test(bare)) continue;
  const line = app.slice(0, m.index).split(LF).length;
  hits.push({ line, a: m[2], between: between.trim(), b: m[5] });
  re.lastIndex = m.index + 1;                        // allow overlapping chains
}

/* group by line so a three-part sentence shows as one finding */
const byLine = {};
for (const h of hits) (byLine[h.line] = byLine[h.line] || []).push(h);

const rows = Object.entries(byLine)
  .map(([line, hs]) => ({ line: +line, n: hs.length, hs }))
  .sort((a, b) => b.n - a.n || a.line - b.line);

console.log('glued sentences found: ' + rows.length + '  (across ' + hits.length + ' fragment pairs)');
console.log('');
for (const r of rows.slice(0, 22)) {
  const h = r.hs[0];
  const mid = h.between.replace(/\s+/g, ' ').slice(0, 34);
  console.log('  line ' + String(r.line).padStart(6) + '  [' + r.n + ']  ' +
    JSON.stringify(h.a).slice(0, 34) + '  <' + mid + '>  ' + JSON.stringify(h.b).slice(0, 30));
}
