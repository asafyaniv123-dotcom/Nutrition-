/* Insights in porcelain (Asaf, 27 Nov 2026): the seven categories wear the same
 * ivory objects with a thread of amber light as סיום יום, and a question is
 * asked the way the evening asks one - an object over it, the question in
 * plain large type, and a ruled writing well in the page's serif.
 * assets/ins-art.webp is one Higgsfield sheet (3x3 cells of 200px) brought to
 * the ground: mirror, lotus, rings / seedling, peak, globe / notebook, and two
 * spare cells (stairs, key) that nothing draws yet.
 * The category colour no longer paints a seam beside the question: he rejected
 * coloured seams on 24 Oct, and the object now says which category it is.
 *   node tools/patches/ins-porcelain.mjs [file]            apply
 *   node tools/patches/ins-porcelain.mjs [file] --reverse  undo */
import fs from 'fs';
const args = process.argv.slice(2), rev = args.includes('--reverse');
const file = args.find((a) => !a.startsWith('--')) || 'dev/index.html';

const PAIRS = [
  [String.raw`.ins-deep-w{margin:2px 0 20px}`,
   String.raw`.ins-deep-w{margin:2px 0 20px}
/* THE PORCELAIN (27 Nov): a cell of assets/ins-art.webp, 3 across and 3 down, drawn at --s */
.ins-pz{display:block;flex:none;width:var(--s);height:var(--s);background-repeat:no-repeat;
  background-size:calc(var(--s) * 3) calc(var(--s) * 3);
  background-position:calc(var(--s) * var(--c) * -1) calc(var(--s) * var(--r) * -1);
  -webkit-mask:radial-gradient(closest-side,#000 72%,transparent 100%);mask:radial-gradient(closest-side,#000 72%,transparent 100%)}
.ins-tile .ins-pz{--s:74px;margin:-10px -8px 4px}
.ins-hero{--s:132px;margin:-4px auto 8px}
/* the question, asked the way סיום יום asks one */
.ins-qt{font-size:19px;font-weight:800;line-height:1.42;text-wrap:balance;margin-bottom:18px}
.ins-qt-t{font-size:11px;font-weight:700;margin-bottom:6px}
.ins-ta.ins-lined{font-family:"Frank Ruhl Libre",Georgia,serif;font-size:16px;line-height:34px;padding:12px 18px;min-height:184px;outline:none}
/* after the field's own background shorthand, which would wipe the lines */
html body.mod-insights .ins-ta.ins-lined{
  background-image:repeating-linear-gradient(transparent 0 33px,rgba(176,168,156,.32) 33px 34px);background-position:0 12px;background-attachment:local}
html body.mod-insights .ins-qt{color:var(--nu-ink)}
html body.mod-insights .ins-qt-t{color:var(--nu-muted)}`],
  // the drawing, beside the other Insights helpers
  [String.raw`function insWideAnswer(catId){`,
   String.raw`var INS_ART={self:0,emotions:1,people:2,life:3,success:4,world:5,notebook:6};
function insArt(id,cls){
  var n=INS_ART[id];if(n==null)return '';
  return '<span class="ins-pz'+(cls?' '+cls:'')+'" style="background-image:url('+liveBase()+'assets/ins-art.webp);--c:'+(n%3)+';--r:'+Math.floor(n/3)+'"></span>';
}
function insWideAnswer(catId){`],
  // the seven tiles: the object, not a line icon in a coloured square
  [String.raw`    /* the category's colour survives as the ONE thing it draws: a line icon
       in its own raised square. It is what tells the seven apart. */
    h+='<button class="ins-tile" onclick="_insCat=\''+cat.id+'\';_insView=\'cat\';renderInsights()">';
    h+='<span class="ins-ic" style="color:'+cat.color+'">'+insIcon(cat.id)+'</span>';`,
   String.raw`    /* each category is a porcelain object - it is what tells the seven apart */
    h+='<button class="ins-tile" onclick="_insCat=\''+cat.id+'\';_insView=\'cat\';renderInsights()">';
    h+=insArt(cat.id);`],
  // a category opens under its object
  [String.raw`  h+=insWideCard(cat.id);
  for(var qi=0;qi<cat.questions.length;qi++){`,
   String.raw`  h+=insArt(cat.id,'ins-hero');
  h+=insWideCard(cat.id);
  for(var qi=0;qi<cat.questions.length;qi++){`],
  // a topic: the object, then the question
  [String.raw`  /* the question is pressed INTO the plaster and what you wrote is raised out
     of it: the prompt is the surface, your answer is the thing lying on it */
  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+esc(q)+'</div>';`,
   String.raw`  /* the question as סיום יום asks one; what you wrote is raised out of the surface */
  h+=insArt(cat.id,'ins-hero');
  h+='<div class="ins-qt">'+esc(q)+'</div>';`],
  // writing: the object, the question, and a ruled well
  [String.raw`  h+='<div class="ins-ask" style="--c:'+cat.color+'">'+(dq?'<div class="ins-ask-t">'+esc(q)+'</div>'+esc(dq):esc(q))+'</div>';
  h+='<div class="ins-lbl">'+_t('התובנה שלך')+'</div>';
  h+='<textarea id="ins-text" class="ins-ta" rows="5"`,
   String.raw`  h+=insArt(cat.id,'ins-hero');
  h+='<div class="ins-qt">'+(dq?'<div class="ins-qt-t">'+esc(q)+'</div>'+esc(dq):esc(q))+'</div>';
  h+='<textarea id="ins-text" class="ins-ta ins-lined" rows="5"`],
];

let s = fs.readFileSync(file, 'utf8');
const list = rev ? PAIRS.map(([a, b]) => [b, a]).reverse() : PAIRS;
for (const [from, to] of list) {
  const n = s.split(from).length - 1;
  if (n !== 1) { console.error('anchor found ' + n + ' times:\n' + from.slice(0, 200)); process.exit(1); }
  s = s.replace(from, () => to);
}
fs.writeFileSync(file, s);
console.log((rev ? 'reversed ' : 'applied ') + list.length + ' pairs to ' + file);
