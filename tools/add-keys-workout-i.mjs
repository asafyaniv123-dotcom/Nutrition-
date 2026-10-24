import fs from 'fs';
const A={en:'Next',de:'Nächster',es:'Siguiente',fr:'Suivante',it:'Prossima',pt:'Próxima',ja:'次',['zh-Hans']:'下一组',['zh-Hant']:'下一組',ar:'التالية'};
for(const [l,v] of Object.entries(A)){const f='data/lang/'+l+'.json',d=JSON.parse(fs.readFileSync(f,'utf8'));d['הבא|סט']=v;fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
console.log('ok');
