// Builds exercise-sheets/plan.html: every library exercise without a demo, split easy / hard by the skill's table
// (8 Nov), grouped by muscle, so Asaf can send the easy recordings in one batch.
import fs from 'fs';
const R = 'C:/Projects/Nutrition-/';
const d = JSON.parse(fs.readFileSync(R + 'data/exercises.json', 'utf8')); const L = d.exercises || d;
const html = fs.readFileSync(R + 'dev/index.html', 'utf8');
// EX_DEMO carries /* comments */ between ids; strip them, or the id after each comment reads as missing (x13 did)
const demo = new Set(html.match(/EX_DEMO\s*=\s*\{([^}]*)\}/)[1].replace(/\/\*[\s\S]*?\*\//g, '').split(',').map((x) => x.split(':')[0].trim()));
const EASY = new Set(('x2 x3 x5 x10 x11 x12 x13 x21 x26 x39 x42 x43 x45 x47 x49 x50 x58 x59 x60 x61 x62 x64 x65 x66 x68 x69 '
  + 'x73 x76 x77 x79 x81 x83 x85 x88 x89 x90 x91 x92 x94 x95 x97 x98 x99 x101 x103 x104 x105 x106 x109 x110 x111 x116 '
  + 'x120 x121 x123 x124 x127 x129 x133 x134 x141 x147 x148 x151 x152 x158 x159 x161 x163 x167 x169 x171 x175 x179 x181 '
  + 'x188 x189 x193 x196 x200 x202 x205 x206 x232 x233 x234 x235 x241 x242').split(' '));
const WHY = { // why a hard one is hard, in the skill's words
  machine: 'מכונה עם חלק נע', body: 'כל הגוף זז מול מוט או ספסל', floor: 'שכיבה ותנועה גדולה', swap: 'איברים מתחלפים',
  multi: 'יותר משתי תנוחות', walk: 'הליכה, ריצה או קפיצה', cross: 'כבלים שנחצים', retry: 'נכשל כבר, ברשימת החזרה' };
const HARD = { x7: 'machine', x8: 'machine', x9: 'retry', x14: 'cross', x15: 'cross', x16: 'cross', x22: 'body', x23: 'body',
  x25: 'machine', x28: 'body', x29: 'body', x30: 'body', x31: 'body', x32: 'body', x33: 'machine', x35: 'machine', x36: 'machine',
  x37: 'machine', x38: 'machine', x40: 'machine', x46: 'machine', x51: 'machine', x52: 'machine', x54: 'machine', x55: 'body',
  x56: 'body', x63: 'machine', x70: 'swap', x75: 'machine', x80: 'machine', x87: 'cross', x93: 'body', x107: 'machine',
  x112: 'retry', x113: 'retry', x117: 'body', x118: 'body', x119: 'retry', x122: 'machine', x125: 'machine', x126: 'walk',
  x132: 'machine', x136: 'machine', x137: 'machine', x138: 'machine', x139: 'machine', x143: 'retry', x144: 'retry',
  x146: 'body', x154: 'machine', x155: 'machine', x156: 'body', x157: 'machine', x160: 'machine', x166: 'machine',
  x168: 'walk', x170: 'retry', x172: 'floor', x173: 'body', x174: 'retry', x176: 'machine', x177: 'machine', x178: 'machine',
  x180: 'retry', x182: 'retry', x184: 'machine', x185: 'retry', x186: 'floor', x191: 'body', x194: 'floor', x195: 'swap',
  x197: 'swap', x198: 'floor', x201: 'multi', x203: 'swap', x204: 'swap', x207: 'cross', x208: 'machine', x209: 'walk',
  x210: 'walk', x211: 'machine', x212: 'machine', x213: 'machine', x214: 'machine', x215: 'machine', x216: 'machine',
  x217: 'machine', x218: 'machine', x220: 'multi', x221: 'walk', x222: 'walk', x224: 'swap', x225: 'multi', x226: 'multi',
  x227: 'multi', x228: 'multi', x230: 'retry', x231: 'retry', x243: 'retry', x250: 'retry', x255: 'retry' };
const left = L.filter((e) => !demo.has(e.id));
const miss = left.filter((e) => !EASY.has(e.id) && !HARD[e.id]).map((e) => e.id);
if (miss.length) throw new Error('unsorted: ' + miss.join(' '));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const group = (list, hard) => {
  const by = {}; for (const e of list) (by[e.m[0]] ||= []).push(e);
  return Object.entries(by).map(([m, es]) => `<h3>${esc(m)} <span>${es.length}</span></h3><ul>` + es.map((e) =>
    `<li><b>${esc(e.n)}</b> <i>${esc(e.en)}</i> <code>${e.id}</code>${hard ? ` <em>${WHY[HARD[e.id]]}</em>` : ''}</li>`).join('') + '</ul>').join('');
};
const easy = left.filter((e) => EASY.has(e.id)), hard = left.filter((e) => HARD[e.id]);
const page = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>תרגילים בלי הדגמה</title><style>
body{margin:0;padding:16px;background:#15100b;color:#f3e6d3;font:15px/1.5 system-ui,sans-serif}h1{font-size:20px;margin:0 0 4px}
p{color:#c9b79f;margin:0 0 16px}h2{font-size:18px;margin:24px 0 4px;color:#ffc46b}h3{font-size:15px;margin:14px 0 4px;color:#e8a54a}
h3 span,h2 span{color:#9c8a73;font-weight:400}ul{margin:0;padding:0 18px 0 0}li{margin:3px 0}i{color:#b9a68c;font-style:normal;font-size:13px}
code{color:#8f7d66;font-size:12px}em{color:#d98a6a;font-style:normal;font-size:13px}</style></head><body>
<h1>תרגילים בלי הדגמה</h1><p>${left.length} תרגילים, נכון ל-8.11. קלים: עמידה, ישיבה או ספסל, ואיבר אחד זז. קשים: הסיבה כתובה ליד כל אחד.</p>
<h2>קלים <span>${easy.length}</span></h2>${group(easy, false)}<h2>קשים <span>${hard.length}</span></h2>${group(hard, true)}</body></html>`;
fs.writeFileSync(R + 'exercise-sheets/plan.html', page);
console.log('easy', easy.length, 'hard', hard.length, 'total', left.length);
