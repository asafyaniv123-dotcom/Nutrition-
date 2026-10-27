/* The nine plain errors from tools/hebrew-wording-audit.md (1-9): rename the
 * key in dev/index.html and in every language file. The translations meant the
 * right thing all along, so their values stay; he-f / he-x get the same
 * correction made in their own wording. */
import fs from 'fs';
const P=[
 ['איך הייתה המזג שלך היום?','איך היה מצב הרוח שלך היום?'],
 ['הישאר על {w}, ישימות על טכניקה','הישאר על {w}, ושים דגש על טכניקה'],
 ['התמקד על טכניקה','התמקד בטכניקה'],
 ['מה המטרה עיקרית?','מה המטרה העיקרית?'],
 ['מה שתכבה לא ייכלל בסיכום ולא יישאל אותך. שום דבר לא נמחק — הדלקה חוזרת מחזירה גם את מה שכבר כתבת.','מה שתכבה לא ייכלל בסיכום ולא תישאל עליו. שום דבר לא נמחק — כשמדליקים שוב, גם מה שכבר כתבת חוזר.'],
 ['כל רכיב מתומחר מהערכים המדודים במאגר. מה שהוערך מסומן. תקן כמות וההכל מתעדכן.','כל רכיב מחושב לפי הערכים המדודים במאגר. מה שהוערך מסומן. תקן כמות והכל מתעדכן.'],
 ['פירוק מעמיק — מפרק למרכיבים ומתמחר כל אחד מהמאגר','פירוק מעמיק — מפרק למרכיבים ומחשב כל אחד לפי המאגר'],
 ['✓ ישמר לספרייה','✓ יישמר בספרייה'],
 ['חוזר בשנתי','חוזר כל שנה'],
 ['תרגיל שלא מרגיש נכון אחרי שתי ניסיונות — החלף אותו היום ותברר אחר כך.','תרגיל שלא מרגיש נכון אחרי שני ניסיונות — החלף אותו היום, ותבדוק את זה אחר כך.'],
 ['לשמור כרגע מהיום','לשמור ברגעים של היום'],
 ['לשמור כרגע מהיום?','לשמור ברגעים של היום?']];
let s=fs.readFileSync('dev/index.html','utf8'),n=0;
for(const [a,b] of P){for(const q of ["'",'"']){const x=q+a+q,y=q+b+q;const c=s.split(x).length-1;n+=c;s=s.split(x).join(y);}}
fs.writeFileSync('dev/index.html',s);console.log('code sites',n);
/* the same correction inside a gendered value: the fragments that changed */
const FR=[['הייתה המזג','היה מצב הרוח'],['ישימות על','ושימי דגש על'],['התמקדי על','התמקדי ב'],['מטרה עיקרית','המטרה העיקרית'],['יישאל אותך','תישאלי עליו'],['הדלקה חוזרת מחזירה גם את מה','כשמדליקים שוב, גם מה'],['שתי ניסיונות','שני ניסיונות'],['ותבררי אחר כך','ותבדקי את זה אחר כך'],['ותבררו אחר כך','ותבדקו את זה אחר כך'],['מתומחר מהערכים','מחושב לפי הערכים'],['וההכל','והכל'],['כרגע מהיום','ברגעים של היום']];
for(const l of ['en','de','fr','it','es','pt','ar','ja','zh-Hans','zh-Hant','_template']){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8')),o={};for(const k in d){const p=P.find(x=>x[0]===k);o[p?p[1]:k]=d[k];}fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');}
for(const f of ['data/he-f.json','data/he-x.json']){const d=JSON.parse(fs.readFileSync(f,'utf8')),o={};let m=0;for(const k in d){const p=P.find(x=>x[0]===k);let v=d[k];if(p){m++;if(typeof v==='string')for(const [a,b] of FR)v=v.split(a).join(b);}o[p?p[1]:k]=v;}fs.writeFileSync(f,JSON.stringify(o,null,2)+'\n');console.log(f,'rekeyed',m);}
