/* When the matcher says no row is this food, it brings its own numbers.
 *
 *     node tools/test-est-on-refusal.mjs
 *
 * "לחמנייית כוסמין" was answered with "כוסמין, מבושל" — a spelt ROLL given
 * the figures for cooked spelt grain. Measured against the app's own scorer
 * and the app's own tables before anything was touched, and the cause was not
 * a near miss. It was this line of the /match prompt:
 *
 *     "WHEN NO BRAND IS NAMED, PREFER THE PLAIN TABLE ROW."
 *
 * No brand was named. The plainest row in the sixty was the grain. The rule
 * was written to stop "2 eggs" becoming one dairy's packaged eggs, where it
 * is right BECAUSE a plain row for the same food exists — and it never had
 * the precondition that makes that true.
 *
 * Two halves are asserted here, and only the second can be tested without a
 * network:
 *
 *   THE PROMPT, which is prose and can only be checked for saying the thing.
 *   A prompt assertion is weak on purpose, and the weakness is worth naming:
 *   it catches the rule being deleted and it can never catch the model
 *   disobeying it. Only a live call against the real tables can do that, and
 *   a live call costs a real call every run, so it is not in here.
 *
 *   cleanEst, which is arithmetic and is where the actual risk lives. An
 *   estimate reaching the log looks exactly like a measurement until someone
 *   checks it adds up, so this route applies the same clamps and the same
 *   Atwater test /estimate applies to its own reply — and REFUSES rather than
 *   downgrades, because /estimate is still behind it and the cost of refusing
 *   is one round trip.
 *
 * And the field is enforced rather than trusted: est is dropped whenever a
 * row WAS picked. A contract the server does not enforce is a contract the
 * next model version breaks quietly.
 */
import fs from 'fs';
/* Imported dynamically so that a revision WITHOUT cleanEst reports every
   assertion it fails rather than dying on the import — which is how this file
   was shown to detect the bug it was written for instead of being trusted. */
const cleanEst = await (async () => {
  const m = await import('../push-server/src/worker.js');
  return m.cleanEst || (() => { throw new Error('this revision has no cleanEst'); });
})();

const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const src = fs.readFileSync('push-server/src/worker.js', 'utf8');
const MATCH = src.slice(src.indexOf("url.pathname === '/match'"), src.indexOf("url.pathname === '/cross'"));

console.log('the rule that answered a roll with grain');
ok(/AN INGREDIENT IS NOT THE DISH/.test(MATCH),
   'the ingredient rule is in the /match prompt');
ok(/BUT ONLY[\s\S]{0,80}BETWEEN ROWS THAT ARE THE SAME FOOD/.test(MATCH),
   'and the plain-row rule now says between rows of THE SAME FOOD');
ok(/OUTRANKS THE RULE ABOVE/.test(MATCH),
   'with the two ordered, so a model reading both knows which wins');
ok(MATCH.indexOf('AN INGREDIENT IS NOT THE DISH') > MATCH.indexOf('PREFER THE PLAIN TABLE ROW'),
   'and the ingredient rule is read after the one it overrides');

console.log('');
console.log('est is offered, and only where there is nothing better');
ok(/"est":null/.test(MATCH), 'the reply shape the model is shown carries est');
ok(/ONLY when picks\\n' \+\s*'\s*is \[\]/.test(MATCH) || /ONLY when picks/.test(MATCH),
   'the prompt says est belongs only to an empty pick list');
ok(/const est = picks\.length \? null : cleanEst\(/.test(MATCH),
   'and the SERVER drops it when a row was picked, rather than trusting the prompt');
ok(/return json\(\{ ok: true, by, pick, picks, grams, terms, est,/.test(MATCH),
   'est rides back with the refusal');

console.log('');
console.log('no rows at all is a question, not an error');
/* The shortlist is built by string matching, so a query in a script the
   tables do not use reaches nothing — and /match used to refuse the empty
   list with a 400, which skipped the terms that exist to rescue exactly that.
   鶏肉 reached 0 of 7,240 rows and got a 400; شوفان survived only because it
   happened to reach ONE row through an aka entry. Measured after the change:
   鶏肉 -> terms ["עוף","חזה עוף","עוף שלם"] -> בשר עוף, חזה, לא מבושל. */
ok(/const askTermsOnly = !cands\.length;/.test(MATCH),
   'an empty candidate list sets the terms-only question');
ok(!/if \(!cands\.length\) return json\(\{ error: 'no candidates' \}, 400\);/.test(MATCH),
   'and is no longer refused outright');
ok(/ROWS: none - a plain text search of the table found nothing/.test(MATCH),
   'the model is told there is nothing to choose between');
ok(/Answer picks:\[\] and give TERMS/.test(MATCH),
   'and asked for the one thing still worth answering');

console.log('');
console.log('cleanEst: a guess that does not add up is not shown');
/* 215 kcal, 12.7 p, 38 c, 2 f — the אנג׳ל spelt roll, which is the row that
   was in the list all along and is a fair target for an estimate of one. */
const roll = { per100: { kcal: 215, p: 12.7, c: 38, f: 2 }, serving_g: 60, assumed: 'לחמנייה בינונית' };
const got = cleanEst(roll);
ok(!!got, 'a consistent estimate comes through');
ok(eq(got.per100, { kcal: 215, p: 12.7, c: 38, f: 2 }), 'with its macros unchanged');
ok(got.serving_g === 60, 'and the serving weight it named');
ok(got.assumed === 'לחמנייה בינונית', 'and the sentence the reader is shown');

/* 4*12.7 + 4*38 + 9*2 = 220.8 against 215 — 2.7% out, well inside. Now break
   the energy alone and leave the macros: the shape of a number that came from
   somewhere else. */
ok(cleanEst({ per100: { kcal: 90, p: 12.7, c: 38, f: 2 }, serving_g: 60 }) === null,
   'macros that do not add up to their own calories are refused, not downgraded');
ok(cleanEst({ per100: { kcal: 0, p: 10, c: 10, f: 1 } }) === null, 'no energy at all is nothing');
ok(cleanEst(null) === null, 'and no est at all is nothing');
ok(cleanEst({}) === null, 'an empty object too');
ok(cleanEst('215') === null, 'and a string is not an estimate');

console.log('');
console.log('and the clamps, which are the same ones /estimate uses');
ok(cleanEst({ per100: { kcal: 5000, p: 10, c: 10, f: 1 } }) === null,
   '5000 kcal per 100 g is out of range, so there is no energy left and no row');
/* AND WHAT THIS CANNOT SEE, recorded rather than asserted away. A negative
   macro is zeroed like any other out-of-range number — and the row then still
   comes through, because 4*0 + 4*38 + 9*2 = 170 against 215 is 21% out and
   the band is 35%. The band is wide because a real food's label rarely adds
   up exactly; it is not a check on any single macro, and nothing here is. A
   protein figure lost this way is silent, which is the honest limit of an
   arithmetic test against one number. */
const neg = cleanEst({ per100: { kcal: 215, p: -5, c: 38, f: 2 } });
ok(neg !== null && neg.per100.p === 0,
   'a negative macro is zeroed, and the row still passes — the band cannot see one macro');
const big = cleanEst({ per100: { kcal: 215, p: 12.7, c: 38, f: 2 }, serving_g: 99999 });
ok(big && big.serving_g === 0, 'a serving of a hundred kilos is dropped to none, not printed');
const rnd = cleanEst({ per100: { kcal: 215.44, p: 12.66, c: 38, f: 2 } });
ok(rnd && rnd.per100.kcal === 215.4 && rnd.per100.p === 12.7, 'and everything lands on one decimal');
const long = cleanEst({ per100: { kcal: 215, p: 12.7, c: 38, f: 2 }, assumed: 'x'.repeat(400) });
ok(long && long.assumed.length === 240, 'a runaway sentence is cut rather than carried');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED'); process.exit(1); }
console.log('an ingredient is not the dish, and a guess that does not add up is not shown');
