/* Rebuilds data/foods.off.json from the Open Food Facts bulk export.
 *
 *   node tools/off-from-dump.mjs <path-to-en.openfoodfacts.org.products.csv.gz>
 *
 * Why this replaces asking their API product by product: the per-product
 * endpoint is the polite way to ask about one thing and the wrong way to ask
 * about two thousand. Three runs of tools/backfill-servings.mjs took the count
 * of products with a known serving from 263 to 473 and were refused at every
 * backoff step up to thirty seconds - their limit is a budget, not a pace. The
 * export is the answer they publish for exactly this, and it carries the
 * serving size for every product rather than the few hundred the throttled
 * search endpoint would hand over.
 *
 * It is a 1.2GB gzip of roughly 9GB of tab-separated text, so nothing is held
 * in memory: the file is streamed, decompressed and read a line at a time, and
 * only Israeli rows are kept.
 *
 * LICENCE: Open Food Facts is ODbL. Attribution is required and share-alike
 * applies to a database derived from it, which this file is. The app credits
 * them on every result that comes from here. Still worth settling properly
 * before the App Store.
 */
import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';

const SRC=process.argv[2];
const OUT='data/foods.off.json';
if(!SRC||!fs.existsSync(SRC)){
  console.error('give me the path to en.openfoodfacts.org.products.csv.gz');
  process.exit(1);
}

const num=v=>{const n=parseFloat(v);return isFinite(n)?n:null;};
const r1=n=>Math.round(n*10)/10;

/* The columns wanted, by name - the export has around 200 and their order is
   not promised, so they are found in the header rather than counted to. */
const WANT=['code','product_name','product_name_he','brands','countries_tags',
            'serving_size','product_quantity','quantity',
            'energy-kcal_100g','proteins_100g','carbohydrates_100g','fat_100g'];
let col=null;

/* Same reading of a serving as the API path: what the label declares, and
   failing that the package when it plainly holds one sitting. */
function servingOf(r){
  const m=String(r.serving_size||'').match(/([\d.]+)\s*(ml|מ"ל|מל|g|gr|גרם|ג)\b/i);
  if(m){const g=Math.round(parseFloat(m[1]));if(g>0&&g<2000)return g;}
  let q=num(r.product_quantity);
  if(q===null){
    // some rows carry it only as text: "350 ml", "1 L"
    const t=String(r.quantity||'').match(/([\d.]+)\s*(ml|l|g|kg)\b/i);
    if(t){
      q=parseFloat(t[1]);
      const u=t[2].toLowerCase();
      if(u==='l'||u==='kg')q*=1000;
    }
  }
  if(q&&q>=20&&q<=1000)return Math.round(q);
  return 0;
}

function shape(r){
  const k=num(r['energy-kcal_100g']);
  if(k===null||k<0||k>1000)return null;
  let name=(r.product_name_he||r.product_name||'').replace(/\s+/g,' ').trim();
  if(!name||name.length<2)return null;
  if(/^[\d\s-]+$/.test(name))return null;
  const pr=num(r.proteins_100g)||0, ca=num(r.carbohydrates_100g)||0, fa=num(r.fat_100g)||0;
  if(!k&&!pr&&!ca&&!fa)return null;
  /* ── does the row agree with itself? ──
     Open Food Facts is filled in by people, and about three in a hundred rows
     contradict their own macros: a brownie whose fat and carbs add up to
     18,446 kcal, a cheese declaring 670 kcal on thirty grams of protein and
     nine of fat, which is 201. Where the two numbers disagree there is no way
     to tell which one is wrong, so the row is left out rather than imported
     and believed.

     The test has to spare alcohol. Whisky is 250 kcal with no protein, carbs
     or fat at all - the energy is in the ethanol, which no macro column
     carries - and a plain "kcal is higher than the macros explain" test would
     throw out every spirit in the file. So that direction is only refused when
     there is real substance there to account for it. */
  const mass=pr+ca+fa;
  if(mass>105)return null;                    // more than 100g of matter in 100g
  const at=4*pr+4*ca+9*fa;
  if(at>k*1.5+50)return null;                 // the macros hold more energy than declared
  if(mass>20&&k>at*1.8+50)return null;        // declared far beyond what that much food can hold
  const brand=String(r.brands||'').split(',')[0].trim();
  if(brand&&name.toLowerCase().indexOf(brand.toLowerCase())<0)name+=', '+brand;
  const o={id:'off:'+r.code,n:name,k:Math.round(k),p:r1(pr),c:r1(ca),f:r1(fa),off:1};
  const u=servingOf(r);
  if(u)o.u=u;
  return o;
}

/* Anything the earlier runs learned is kept: a weight already in the file is
   not thrown away because this row happens not to declare one. */
const byId=new Map();
try{
  const prev=JSON.parse(fs.readFileSync(OUT,'utf8'));
  for(const f of prev.foods||[])byId.set(f.id,f);
  console.log('starting from '+byId.size+' already in the file');
}catch(e){}

let lines=0,israeli=0,kept=0,fresh=0,keptHe=0;
const rl=readline.createInterface({
  input:fs.createReadStream(SRC).pipe(zlib.createGunzip()),
  crlfDelay:Infinity
});

for await (const line of rl){
  lines++;
  if(!col){
    const h=line.split('\t');
    col={};
    for(const w of WANT){
      const i=h.indexOf(w);
      if(i>=0)col[w]=i;
    }
    const missing=WANT.filter(w=>col[w]===undefined);
    if(missing.length)console.log('columns not in this export: '+missing.join(', '));
    continue;
  }
  // cheap reject before splitting: most of nine gigabytes is not Israeli
  if(line.indexOf('en:israel')<0)continue;
  const c=line.split('\t');
  const r={};
  for(const w in col)r[w]=c[col[w]];
  if(String(r.countries_tags||'').indexOf('en:israel')<0)continue;
  israeli++;
  const o=shape(r);
  if(!o)continue;
  const had=byId.get(o.id);
  if(had&&had.u&&!o.u)o.u=had.u;   // keep a weight already known
  /* The export has no product_name_he - only product_name, which for an
     Israeli product is as often English as Hebrew. The API we used before did
     return the Hebrew one, so rebuilding blindly from here would quietly
     replace שוקולד פרה with "Cow Chocolate" across the whole file. A name we
     already hold in Hebrew wins. */
  if(had&&/[֐-׿]/.test(had.n)&&!/[֐-׿]/.test(o.n)){o.n=had.n;keptHe++;}
  if(!had)fresh++;
  byId.set(o.id,o);
  kept++;
  if(lines%500000===0)process.stdout.write('\r'+(lines/1e6).toFixed(1)+'M lines, '+israeli+' Israeli, '+kept+' usable   ');
}

const foods=[...byId.values()].sort((a,b)=>a.n.localeCompare(b.n,'he'));
fs.writeFileSync(OUT,JSON.stringify({
  source:'Open Food Facts',
  licence:'ODbL - attribution required, share-alike on derived databases',
  url:'https://world.openfoodfacts.org',
  country:'israel',
  fetched:new Date().toISOString().slice(0,10),
  from:'bulk export',
  basis:'100g',
  foods:foods
}));
const withU=foods.filter(f=>f.u).length;
console.log('\nread '+lines.toLocaleString()+' lines');
console.log('Israeli rows: '+israeli+'   usable: '+kept+'   new to the file: '+fresh);
 console.log('Hebrew names protected from an English overwrite: '+keptHe);
console.log('products now: '+foods.length);
console.log('with a serving size: '+withU+' ('+Math.round(withU/foods.length*100)+'%)');
console.log(OUT+': '+fs.statSync(OUT).size+' bytes');
