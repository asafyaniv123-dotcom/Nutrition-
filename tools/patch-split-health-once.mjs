/* Two from the phone (Asaf, 25 Oct):
 *  - three days a week was given an AB split. The notebook (p. 140) puts 3 in
 *    both rows - Full Body 2-3, AB 3-4 - and the person reading it says three
 *    means Full Body: so up to three days is Full Body, four is AB.
 *  - the health question came back in fitness after it was answered in
 *    nutrition. It was asked whenever the acknowledgement was missing, and a
 *    "no" leaves it missing. Asked once now, whichever area asks first. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`  var d=(days<=2)?'full':(days<=4)?'ab':'abc';`, `  /* three is Full Body: the notebook's table lists 3 under both, and three
     sessions of the whole body is the reading its author gives it */
  var d=(days<=3)?'full':(days<=4)?'ab':'abc';`);
rep(`  if(!hlLoad().ack)out.push('health','hack','hconds','hcoach');`, `  if(!hlLoad().ack&&!asetSeen('health'))out.push('health','hack','hconds','hcoach');`);
rep(`  if(t.health==='yes'&&t.ack==='yes'&&t.hl.length)hlSave(`, `  if(_aset.steps.indexOf('health')>=0&&t.health)asetMark('health');   /* asked once, in whichever area came first */
  if(t.health==='yes'&&t.ack==='yes'&&t.hl.length)hlSave(`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');
