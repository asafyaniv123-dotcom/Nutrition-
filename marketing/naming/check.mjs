/* Availability of candidate app names, read from the wire.
 *   node marketing/naming/check.mjs names.txt > out.json
 * For each name (and its handle form, lower-case, no spaces):
 *   appstore  - iTunes Search API: apps whose title starts with the name
 *   play      - Google Play search page: titles that start with the name
 *   youtube   - youtube.com/@handle answers 404 when the handle is free
 *   (TikTok and Instagram are not probed: logged out they cannot tell)
 *   dns       - handle.com / handle.app resolve or not (resolving = taken;
 *               not resolving is only a hint, a domain can be held unused)
 * Every probe reports what it saw; none is trusted alone.
 */
import fs from 'fs';
import dns from 'dns/promises';
const names = fs.readFileSync(process.argv[2], 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const get = async (url, redirect = 'follow') => { try { const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' }, redirect }); return { status: r.status, text: await r.text() }; } catch (e) { return { status: 0, text: String(e) }; } };
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const starts = (title, name) => norm(title).startsWith(norm(name));
const out = [];
for (const name of names) {
  const h = norm(name);
  const row = { name, handle: h };
  const as = await get(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=50&country=us`);
  try { const j = JSON.parse(as.text); row.appstore = j.results.filter((a) => starts(a.trackName, name)).map((a) => `${a.trackName} [${a.primaryGenreName}, ${a.userRatingCount || 0} ratings]`).slice(0, 6); } catch { row.appstore = ['ERR ' + as.status]; }
  const gp = await get(`https://play.google.com/store/search?q=${encodeURIComponent(name)}&c=apps&hl=en&gl=US`);
  const titles = [...new Set([...gp.text.matchAll(/<span class="DdYX5">([^<]+)<\/span>/g)].map((m) => m[1].replace(/&amp;/g, '&')))];
  row.play = titles.filter((t) => starts(t, name)).slice(0, 6);
  row.playSeen = titles.length;
  const yt = await get(`https://www.youtube.com/@${h}`, 'manual');   // following redirects lands on a consent page that answers 200 for anything
  row.youtube = yt.status === 404 ? 'free' : yt.status === 200 ? 'taken' : 'status ' + yt.status;
  /* TikTok and Instagram answer a logged-out visitor with the same page for a
     free handle and a famous one (measured: @mkbhd and a random string), so
     they are not probed: those two are checked by hand at the end. */
  /* A clean store search is not clean: Present Days had a same-name app whose
     only trace was presentdays.app, because it was not live in the store that
     day. So a domain that resolves is FETCHED, and its page title kept. */
  for (const tld of ['com', 'app']) {
    try { await dns.resolve(`${h}.${tld}`); row[tld] = 'resolves'; } catch { row[tld] = 'no-dns'; continue; }
    try { const r = await fetch(`https://${h}.${tld}`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8000) });
      const t = await r.text(); row[tld + 'Title'] = (r.status + ' ' + ((/<title[^>]*>([^<]*)/i.exec(t) || [])[1] || '').trim()).slice(0, 90);
    } catch (e) { row[tld + 'Title'] = 'no site (' + (e.cause?.code || e.name) + ')'; }
  }
  out.push(row);
  process.stderr.write(`${name}: AS ${row.appstore.length} GP ${row.play.length}/${row.playSeen} YT ${row.youtube} .com ${row.com} .app ${row.app}\n`);
}
console.log(JSON.stringify(out, null, 1));
