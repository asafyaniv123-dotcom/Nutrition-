/* The serving stepper in Japanese and Chinese (3 Nov). Smart add wrote a
 * shakshuka in Japanese as 大さじ2 オリーブオイル and 卵 6個: the amount after
 * the unit or the food, so the stepper - which moved only an amount at the
 * START of a line - left every line where it was. Lifted from the app.
 *
 *   node tools/test-rbx-scale-cjk.mjs [index.html]
 */
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync(process.argv[2] || new URL('../dev/index.html', import.meta.url), 'utf8');
const a = src.indexOf('var RBX_VF='), z = src.indexOf('/* ── STATE ── */', a);
const ctx = { nfmt: (n) => String(n), esc: (s) => String(s) };
vm.createContext(ctx);
vm.runInContext(src.slice(a, z), ctx);
const plain = (h) => h.replace(/<[^>]+>/g, '');

const fails = [];
const ok = (got, want, what) => { const g = plain(ctx.rbxScaleHTML(...what)); const pass = g === want;
  console.log((pass ? '  ok   ' : '  FAIL ') + JSON.stringify(what[0]) + ' x' + what[1] + ' -> ' + g + (pass ? '' : '   (want ' + want + ')')); if (!pass) fails.push(what[0]); };

// Japanese and Chinese: the first number moves, wherever it is
ok(0, '大さじ4 オリーブオイル', ['大さじ2 オリーブオイル', 2]);
ok(0, '卵 3個', ['卵 6個', 0.5]);
ok(0, '玉ねぎ 2個', ['玉ねぎ 1個', 2]);
ok(0, '砂糖 小さじ1', ['砂糖 小さじ1/2', 2]);
ok(0, 'にんにく 4~6片', ['にんにく 2~3片', 2]);
ok(0, '鸡蛋 4个', ['鸡蛋 2个', 2]);
ok(0, '盐 少许', ['盐 少许', 2]);
ok(0, '2 大さじ 醤油', ['1 大さじ 醤油', 2]);   // a leading amount still wins
// Latin and Hebrew are unchanged: only the start of the line
ok(0, '4 EL Olivenöl', ['2 EL Olivenöl', 2]);
ok(0, 'תבנית בקוטר 24 ס"מ', ['תבנית בקוטר 24 ס"מ', 2]);
ok(0, 'שוקולד 70% 200 גרם', ['שוקולד 70% 200 גרם', 2]);
ok(0, '1½ כוס קמח', ['¾ כוס קמח', 2]);

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('a Japanese or Chinese amount moves wherever it stands; a Latin line only at its start');
