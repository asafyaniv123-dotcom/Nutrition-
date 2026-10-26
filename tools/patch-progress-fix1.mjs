/* the checks on the progress screen: no unit glued to a signed count (the
 * labels say what is counted); the distance through fmtDist; the muted
 * colours deepened to read at 4.5:1; the finished-book tab renamed. Applied to
 * tools/prg.* and dev/index.html alike. */
import fs from 'fs';
const R = [
  [`chip:prgSigned(now-prev)+' '+_t('ימים'),`, `chip:prgSigned(now-prev),`],
  [`chip:prgSigned(tot-prev)+' '+_t('סטים'),`, `chip:prgSigned(tot-prev),`],
  [`thenL:_t('שבוע שעבר'),thenV:nfmt(prev)+'<small>'+_t('ימים ביעד')+'</small>',nowL:_t('השבוע'),nowV:nfmt(now)+'<small>'+_t('ימים ביעד')+'</small>'`,
   `thenL:_t('ימים ביעד, שבוע שעבר'),thenV:nfmt(prev),nowL:_t('ימים ביעד, השבוע'),nowV:nfmt(now)`],
  [`thenL:_t('שבוע שעבר'),thenV:nfmt(prev)+'<small>'+_t('סטים')+'</small>',nowL:_t('השבוע'),nowV:nfmt(tot)+'<small>'+_t('סטים')+'</small>'`,
   `thenL:_t('סטים, שבוע שעבר'),thenV:nfmt(prev),nowL:_t('סטים, השבוע'),nowV:nfmt(tot)`],
  [`var km=tot*0.00075,dist=APP_UNITS==='imperial'?_t('כ-{n} מייל השבוע',{n:nfmt(Math.round(km/1.609*10)/10)}):_t('כ-{n} ק״מ השבוע',{n:nfmt(Math.round(km*10)/10)});`,
   `var dist=_t('כ-{d} השבוע',{d:fmtDist(tot*0.75)});`],
  [`bookdone:_t('ספר שהסתיים')`, `bookdone:_t('סיום ספר')`],
  [`t:_t('ספר שהסתיים')`, `t:_t('סיום ספר')`],
  [`.prg .lb{font-size:11.5px;font-weight:700;color:#7d756b}`, `.prg .lb{font-size:11.5px;font-weight:700;color:#6d675e}`],
  [`.prg .b2p small{display:block;font-size:10.5px;font-weight:700;color:#7d756b;line-height:1.2}`, `.prg .b2p small{display:block;font-size:10.5px;font-weight:700;color:#6d675e;line-height:1.2}`],
  [`.prg .dates i{flex:1;text-align:center;font-style:normal;font-size:10.5px;font-weight:700;color:#7d756b}`, `.prg .dates i{flex:1;text-align:center;font-style:normal;font-size:10.5px;font-weight:700;color:#6d675e}`],
  [`font-size:11px;color:#7d756b;font-weight:700;margin-top:3px}`, `font-size:11px;color:#6d675e;font-weight:700;margin-top:3px}`],
  [`font-size:13px;font-weight:800;color:#4f7d4b;direction:rtl;`, `font-size:13px;font-weight:800;color:#3f6b3c;direction:rtl;`],
  [`.prg .b2p .now{color:#b5583a;`, `.prg .b2p .now{color:#99482e;`],
  [`.prg .fint{margin-top:16px;font-size:13px;font-weight:800;color:#93641a}`, `.prg .fint{margin-top:16px;font-size:13px;font-weight:800;color:#7a5216}`],
  [`.prg .b2n .star{color:#e2a93f;`, `.prg .b2n .star{color:#86621a;`],
];
for (const F of ['tools/prg.js', 'tools/prg.css', 'dev/index.html']) {
  let s = fs.readFileSync(F, 'utf8'), n = 0;
  for (const [a, b] of R) if (s.includes(a)) { s = s.split(a).join(b); n++; }
  fs.writeFileSync(F, s); console.log(F, n);
}
