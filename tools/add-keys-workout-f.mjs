/* The workout screen's set cards and its one button (24 Oct). */
import fs from 'fs';
const K = ['סט {n}', 'רשום סט {n}'];
const A = { en: ['Set {n}', 'Log set {n}'], de: ['Satz {n}', 'Satz {n} eintragen'], es: ['Serie {n}', 'Registrar serie {n}'],
  fr: ['Série {n}', 'Noter la série {n}'], it: ['Serie {n}', 'Registra serie {n}'], pt: ['Série {n}', 'Registar série {n}'],
  ja: ['セット{n}', 'セット{n}を記録'], 'zh-Hans': ['第{n}组', '记录第{n}组'], 'zh-Hant': ['第{n}組', '記錄第{n}組'], ar: ['المجموعة {n}', 'سجّل المجموعة {n}'] };
for (const [l, v] of Object.entries(A)) {
  const f = 'data/lang/' + l + '.json', d = JSON.parse(fs.readFileSync(f, 'utf8'));
  K.forEach((k, i) => { d[k] = v[i]; }); fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
const x = JSON.parse(fs.readFileSync('data/he-x.json', 'utf8')); x['רשום סט {n}'] = 'רשמו סט {n}'; fs.writeFileSync('data/he-x.json', JSON.stringify(x, null, 2) + '\n');
const f2 = JSON.parse(fs.readFileSync('data/he-f.json', 'utf8')); f2['רשום סט {n}'] = 'רשמי סט {n}'; fs.writeFileSync('data/he-f.json', JSON.stringify(f2, null, 2) + '\n');
console.log('done');
