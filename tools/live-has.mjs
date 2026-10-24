/* Does the live page serve a given identifier yet?
 *   node tools/live-has.mjs <path-under-site> <identifier>
 * Checks for code, never for commit text - see release-carries-the-other-session. */
const [p, id] = process.argv.slice(2);
const url = 'https://asafyaniv123-dotcom.github.io/Nutrition-/' + p + '?nocache=' + Date.now();
const r = await fetch(url, { cache: 'no-store' });
const t = await r.text();
console.log(r.status, t.includes(id) ? 'LIVE' : 'NOT YET');
