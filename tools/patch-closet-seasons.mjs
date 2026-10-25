/* The closet's seasons without emoji (Asaf, 25 Oct: "I don't like the
 * seasons with these emoji"). A colour emoji is a sticker in an app whose
 * icons are lines and whose colour is light. Each season is now a line icon
 * in the app's own stroke, unlit when its chip is not chosen and glowing its
 * own colour when it is - in the filter row and in a garment's seasons. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`var CLOSET_SEASONS=[
  {k:'w',ic:'\\u2744\\uFE0F',t:'חורף'},
  {k:'p',ic:'\\uD83C\\uDF38',t:'אביב'},
  {k:'s',ic:'\\u2600\\uFE0F',t:'קיץ'},
  {k:'a',ic:'\\uD83C\\uDF42',t:'סתיו'}
];`, `/* line icons in the app's stroke; the colour is the light when lit */
var CLOSET_SEASONS=[
  {k:'w',c:'#5b8fc7',ic:'<svg class="cl-sic" viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/></svg>',t:'חורף'},
  {k:'p',c:'#d4799a',ic:'<svg class="cl-sic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c-2-3.3-1-6 0-6.3 1 .3 2 3 0 6.3ZM14.1 11.3c3.7-1 5.9.8 5.9 1.8-.6.8-3.4 1.4-5.9-1.8ZM13.3 14c2 3.3.4 5.9-.6 6.1-.9-.6-1.3-3.4.6-6.1ZM10.7 14c-1.9 2.7-1.5 5.5-.6 6.1-1-.2-2.6-2.8-.6-6.1ZM9.9 11.3c-2.5 3.2-5.3 2.6-5.9 1.8 0-1 2.2-2.8 5.9-1.8Z"/></svg>',t:'אביב'},
  {k:'s',c:'#e9a23b',ic:'<svg class="cl-sic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',t:'קיץ'},
  {k:'a',c:'#c9763d',ic:'<svg class="cl-sic" viewBox="0 0 24 24"><path d="M5 19C5 10 10 5 19.5 4.5 19 14 14 19 5 19Z"/><path d="M5 19 13 11"/></svg>',t:'סתיו'}
];`);
rep(`    h+='<button class="cl-season'+(_closetSeason===sn.k?' on':'')+'" onclick="closetSeasonSet(\\''+sn.k+'\\')">'+`,
  `    h+='<button class="cl-season'+(_closetSeason===sn.k?' on':'')+'" style="--sc:'+sn.c+'" onclick="closetSeasonSet(\\''+sn.k+'\\')">'+`);
rep(`    h+='<button class="cl-iseason'+(a.indexOf(sn.k)>=0?' on':'')+'" '+`, `    h+='<button class="cl-iseason'+(a.indexOf(sn.k)>=0?' on':'')+'" style="--sc:'+sn.c+'" '+`);
rep(`.cl-seasons{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:0 2px 10px}`, `.cl-seasons{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:0 2px 10px}
.cl-sic{width:17px;height:17px;vertical-align:-3.5px;fill:none;stroke:var(--nu-muted,#6d675e);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;transition:stroke .25s,filter .25s}
.cl-season.on .cl-sic,.cl-iseason.on .cl-sic{stroke:var(--sc);filter:drop-shadow(0 0 3px var(--sc))}`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
