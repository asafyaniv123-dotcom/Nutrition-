/* Pulls the Israeli products out of Open Food Facts into data/foods.off.json.
 *
 * The Ministry of Health table is strong on generic foods and cooked dishes
 * and thin on what is actually on a supermarket shelf. This fills that in.
 *
 *   node tools/fetch-off-il.mjs
 *
 * Two endpoints, because neither is enough on its own:
 *
 *   search.openfoodfacts.org  is fast and will hand over the whole country in
 *   36 pages, but returns no serving size and no Hebrew-specific name field.
 *
 *   the legacy cgi/search.pl  returns both, and throttles so hard that it
 *   gives up around page 11 - about 500 products - however patiently it is
 *   asked. It is used for as far as it will go, and what it gives is layered
 *   over the fast set, so those products keep their packet weight and can be
 *   counted in units rather than weighed.
 *
 * Anything already in the file is kept, so running this again only adds. The
 * file is rewritten after every page: a run that dies half way is still worth
 * having.
 *
 * LICENCE: Open Food Facts is ODbL. Free to use, including commercially, but
 * it asks for attribution and puts share-alike obligations on a database
 * derived from it - which this file is. The app credits them on every result
 * that comes from here. Worth settling properly before the App Store, and not
 * something this script can settle for you.
 */
import fs from 'fs';

const UA='BetterMe/0.1 (personal nutrition prototype)';
const FAST='https://search.openfoodfacts.org/search';
const LEGACY='https://world.openfoodfacts.org/cgi/search.pl';
const OUT='data/foods.off.json';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const num=v=>{const n=parseFloat(v);return isFinite(n)?n:null;};
const r1=n=>Math.round(n*10)/10;

async function grab(url,tries){
  tries=tries||0;
  try{
    const r=await fetch(url,{headers:{'User-Agent':UA}});
    const t=await r.text();
    if(t[0]!=='{')throw new Error('not json');
    return JSON.parse(t);
  }catch(e){
    if(tries>=8)return null;
    await sleep(Math.min(20000,1500*Math.pow(1.7,tries)));
    return grab(url,tries+1);
  }
}

function shape(p){
  const n=p.nutriments||{};
  const k=num(n['energy-kcal_100g']);
  if(k===null||k<0||k>1000)return null;          // nothing edible is over 1000/100g
  let name=(p.product_name_he||p.product_name||p.product_name_en||'').replace(/\s+/g,' ').trim();
  if(!name||name.length<2)return null;
  if(/^[\d\s-]+$/.test(name))return null;        // named after its own barcode
  const pr=num(n.proteins_100g)||0, ca=num(n.carbohydrates_100g)||0, fa=num(n.fat_100g)||0;
  if(!k&&!pr&&!ca&&!fa)return null;              // an empty record, not a food
  const brand=String(p.brands||'').split(',')[0].trim();
  if(brand&&name.toLowerCase().indexOf(brand.toLowerCase())<0)name+=', '+brand;
  const o={id:'off:'+p.code,n:name,k:Math.round(k),p:r1(pr),c:r1(ca),f:r1(fa),off:1};
  /* A declared serving is what lets a thing be counted in ones rather than
     weighed. This used to accept grams only - and a drink states its serving
     in millilitres, so every shake, milk and yoghurt lost it. A 350ml protein
     shake arrived in the app as 100g, which is the whole reason it showed
     7.2g of protein where the bottle says 25. Millilitres are taken as grams:
     for a drink the two are within a few percent, and a few percent is
     nothing beside being out by a factor of three and a half.

     And where nothing is declared but the package holds one portion, the
     package is the serving - nobody drinks a third of a 350ml bottle. Over a
     litre it is no longer one sitting, so it is left alone. */
  const m=String(p.serving_size||'').match(/([\d.]+)\s*(ml|מ"ל|מל|g|gr|גרם|ג)\b/i);
  if(m){const g=Math.round(parseFloat(m[1]));if(g>0&&g<2000)o.u=g;}
  if(!o.u){
    const q=num(p.product_quantity);
    if(q&&q>=20&&q<=1000)o.u=Math.round(q);
  }
  return o;
}

// whatever a previous run managed is the starting point
const byId=new Map();
try{
  const prev=JSON.parse(fs.readFileSync(OUT,'utf8'));
  for(const f of prev.foods||[])byId.set(f.id,f);
  console.log('starting from '+byId.size+' already in the file');
}catch(e){}

function keep(o,rich){
  if(!o)return false;
  const had=byId.get(o.id);
  // a legacy record knows the packet weight; never let a fast one overwrite that
  if(had&&!rich&&had.u&&!o.u)return false;
  if(had&&had.u&&!o.u)o.u=had.u;
  byId.set(o.id,o);
  return true;
}

function write(final){
  const foods=[...byId.values()].sort((a,b)=>a.n.localeCompare(b.n,'he'));
  fs.writeFileSync(OUT,JSON.stringify({
    source:'Open Food Facts',
    licence:'ODbL - attribution required, share-alike on derived databases',
    url:'https://world.openfoodfacts.org',
    country:'israel',
    fetched:new Date().toISOString().slice(0,10),
    basis:'100g',
    partial:!final,
    foods:foods
  }));
  return foods.length;
}

// ── the fast pass: the whole country, in pages of a hundred ──
process.stdout.write('fast pass ');
let page=1,pages=1;
while(page<=pages){
  const url=FAST+'?q='+encodeURIComponent('countries_tags:"en:israel"')+'&page_size=100&page='+page;
  const j=await grab(url);
  if(!j){process.stdout.write('x');page++;continue;}
  pages=j.page_count||pages;
  for(const p of (j.hits||[]))keep(shape(p),false);
  process.stdout.write('.');
  write(false);
  page++;
  await sleep(300);
}
console.log('\nafter the fast pass: '+byId.size+' products');

// ── the slow pass: as far as they will let us, for servings and Hebrew names ──
process.stdout.write('detail pass ');
let lp=1,added=0;
while(lp<=200){
  const url=LEGACY+'?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=israel'+
            '&json=1&page_size=50&page='+lp+
            '&fields=code,product_name,product_name_he,brands,serving_size,product_quantity,nutriments';
  const j=await grab(url);
  if(!j){process.stdout.write('\nthey stopped answering at page '+lp+' - keeping what we have\n');break;}
  const hits=j.products||[];
  if(!hits.length)break;
  for(const p of hits)if(keep(shape(p),true))added++;
  process.stdout.write('.');
  write(false);
  if(lp*50>=(j.count||0))break;
  lp++;
  await sleep(2000);
}

const n=write(true);
const withServing=[...byId.values()].filter(f=>f.u).length;
console.log('\nkept: '+n+' products');
console.log('with a packet weight (countable in units): '+withServing);
console.log(OUT+': '+fs.statSync(OUT).size+' bytes');
