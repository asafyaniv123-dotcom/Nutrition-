/* Better Me is Olimei (Asaf, 24 Oct: "the app's name changed to Olimei -
 * change it everywhere relevant"). One word, always; the Chinese name is
 * 欧丽美 / 歐麗美 (marketing/naming/olimei-languages.md).
 * What does NOT change, on purpose:
 *  - the bundle id com.asafyaniv.betterme - Apple's record is keyed on it
 *    and nobody sees it;
 *  - "BetterMe ASC" in codemagic.yaml - the name of the key in Codemagic's
 *    own settings, which would have to be renamed there first;
 *  - the tabs Better and Me - words in the app, not the name of it. */
import fs from 'fs';
const edit = (f, pairs) => {
  let s = fs.readFileSync(f, 'utf8');
  for (const [a, b] of pairs) { if (!s.includes(a)) { console.log('MISSING in', f, ':', a.slice(0, 60)); process.exit(1); } s = s.split(a).join(b); }
  fs.writeFileSync(f, s); console.log('edited', f);
};
/* the app */
edit('dev/index.html', [
  ['alt="Better Me"', 'alt="Olimei"'],
  ["_t('גיבוי Better Me')", "_t('גיבוי Olimei')"],
  ['ברוכים הבאים ל־Better Me', 'ברוכים הבאים ל־Olimei'],
  ['<div class="n">Better <b>Me</b></div>', '<div class="n">Olimei</div>'],
]);
/* the backup's title, in every language */
const ZH = { 'zh-Hans': '欧丽美 备份', 'zh-Hant': '歐麗美 備份' };
for (const f of fs.readdirSync('data/lang').filter(f => f.endsWith('.json'))) {
  const p = 'data/lang/' + f, d = JSON.parse(fs.readFileSync(p, 'utf8')), o = {};
  for (const k of Object.keys(d)) {
    if (k === 'גיבוי Better Me') { const l = f.replace('.json', ''); o['גיבוי Olimei'] = ZH[l] || (typeof d[k] === 'string' ? d[k].replace(/Better[- ]Me/g, 'Olimei') : d[k]); }
    else o[k] = d[k];
  }
  fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n');
}
/* what installs it */
edit('manifest.json', [['"name": "Better Me"', '"name": "Olimei"'], ['"short_name": "Better Me"', '"short_name": "Olimei"']]);
edit('dev/manifest.json', [['"name": "Better Me DEV"', '"name": "Olimei DEV"']]);
edit('native/capacitor.config.json', [['"appName": "Better Me"', '"appName": "Olimei"']]);
edit('native/ios/App/App/capacitor.config.json', [['"appName": "Better Me"', '"appName": "Olimei"']]);
edit('native/ios/App/App/Info.plist', [['<string>Better Me</string>', '<string>Olimei</string>'],
  ['Better Me uses the camera', 'Olimei uses the camera'], ['Better Me uses the microphone', 'Olimei uses the microphone'],
  ['Better Me lets you pick photos', 'Olimei lets you pick photos'], ['Better Me can save', 'Olimei can save']]);
/* what speaks for it: the coach and the weekly letter */
edit('push-server/src/worker.js', [["'BetterMe/0.1 (personal nutrition app)'", "'Olimei/0.1 (personal nutrition app)'"],
  ["'Better Me, a personal app", "'Olimei, a personal app"], ['inside "Better Me"', 'inside "Olimei"'], ['someone using "Better Me"', 'someone using "Olimei"']]);
/* the testers' agreement */
{
  let s = fs.readFileSync('testers/index.html', 'utf8');
  s = s.replace(/Better Me/g, 'Olimei').replace("'BetterMe-'", "'Olimei-'");
  fs.writeFileSync('testers/index.html', s); console.log('edited testers/index.html');
}
console.log('done');
