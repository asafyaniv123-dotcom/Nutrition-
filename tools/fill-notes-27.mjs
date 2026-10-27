/* the 27 Oct strings: the stretch step (where), the fitness summary's title,
 * and the closet's cut-out step - in every language */
import fs from 'fs';
const K=['בלוח השבוע או החודש, תופסים את הנקודה הכתומה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם.',
 'התוכנית שמתאימה לך','ואז גוזרים אותו.',
 'מסמנים מסגרת, או מעבירים אצבע סביב הבגד. "הסר רקע" מוריד את הרצפה, ובעריכה אפשר למחוק עוד עם מברשת. נשאר רק הבגד.'];
const A={
 en:['On the week or the month, grab the orange dot at the end of a task and pull it across several days. It shows on all of them.','The plan that fits you','Then cut it out.','Draw a frame, or trace around the piece with your finger. "Remove background" takes the floor away, and in editing you can erase more with a brush. Only the piece is left.'],
 de:['Greif im Wochen- oder Monatsplan den orangen Punkt am Ende einer Aufgabe und zieh ihn über mehrere Tage. Dann steht sie an allen.','Der Plan, der zu dir passt','Dann schneidest du es aus.','Zieh einen Rahmen oder fahr mit dem Finger um das Teil. „Hintergrund entfernen“ nimmt den Boden weg, und beim Bearbeiten radierst du mit dem Pinsel mehr weg. Übrig bleibt nur das Teil.'],
 fr:['Sur la semaine ou le mois, attrape le point orange au bout d’une tâche et tire-le sur plusieurs jours. Elle apparaît sur chacun.','Le programme qui te va','Puis découpe-le.','Trace un cadre, ou fais le tour du vêtement avec le doigt. « Enlever le fond » retire le sol, et en retouche tu peux effacer davantage au pinceau. Il ne reste que le vêtement.'],
 it:['Nella settimana o nel mese, prendi il punto arancione alla fine di un’attività e trascinalo su più giorni. Comparirà su tutti.','Il piano adatto a te','Poi ritaglialo.','Disegna una cornice, o passa il dito intorno al capo. «Togli lo sfondo» elimina il pavimento, e in modifica puoi cancellare ancora col pennello. Resta solo il capo.'],
 es:['En la semana o el mes, agarra el punto naranja al final de una tarea y arrástralo sobre varios días. Aparece en todos.','El plan que te va bien','Luego recórtala.','Marca un marco o rodea la prenda con el dedo. «Quitar el fondo» elimina el suelo, y al editar puedes borrar más con un pincel. Solo queda la prenda.'],
 pt:['Na semana ou no mês, segure o ponto laranja na ponta de uma tarefa e puxe por vários dias. Ela aparece em todos.','O plano que combina com você','Depois, recorte.','Marque uma moldura ou contorne a peça com o dedo. “Remover o fundo” tira o chão, e na edição dá para apagar mais com um pincel. Só a peça fica.'],
 ar:['في الأسبوع أو الشهر، الإمساك بالنقطة البرتقالية في طرف المهمة وسحبها على عدة أيام يجعلها تظهر عليها كلها.','الخطة التي تناسبك','ثم قصّها.','رسم إطار، أو تمرير الإصبع حول القطعة. «أزل الخلفية» تزيل الأرضية، وفي التعديل يمكن مسح المزيد بالفرشاة. تبقى القطعة وحدها.'],
 ja:['週か月のカレンダーで、タスクの端にあるオレンジの点をつかんで、何日分か引っぱってね。全部の日に表示されるよ。','あなたに合うプラン','それから切り抜こう。','枠をかこむか、指で服のまわりをなぞってね。「背景を消す」で床が消えて、編集ではブラシでさらに消せるよ。服だけが残る。'],
 'zh-Hans':['在周或月日历里，抓住任务末端的橙色圆点，拖过好几天。它会出现在每一天上。','适合你的计划','然后把它剪出来。','画一个框，或用手指沿着衣服描一圈。“去掉背景”会去掉地面，编辑时还能用画笔再擦。只留下衣服。'],
 'zh-Hant':['在週或月行事曆裡，抓住任務末端的橘色圓點，拖過好幾天。它會出現在每一天上。','適合你的計畫','然後把它剪出來。','畫一個框，或用手指沿著衣服描一圈。「去掉背景」會去掉地面，編輯時還能用筆刷再擦。只留下衣服。']};
const DROP=['מה שהבנתי','רואה את האור? כך מתמלא סיום היום, בכל ערב שתסכם.','תופסים את הנקודה בקצה של משימה ומושכים אותה על פני כמה ימים. כך היא מופיעה על כולם, וגם בתצוגת החודש.'];
for(const [l,v] of Object.entries(A)){const f=`data/lang/${l}.json`,d=JSON.parse(fs.readFileSync(f,'utf8'));K.forEach((k,i)=>d[k]=v[i]);DROP.forEach(k=>delete d[k]);fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');}
const X='data/he-x.json',x=JSON.parse(fs.readFileSync(X,'utf8'));x['התוכנית שמתאימה לך']='התוכנית שמתאימה לכם';fs.writeFileSync(X,JSON.stringify(x,null,2)+'\n');
console.log('ok');
