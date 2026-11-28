// node tools/patches/x345-x352-add.mjs <built-exercises.json> <exercises.json> [--undo] - adds Asaf's 28 Nov exercises x345-x352 to the
//   library exactly as build-exercises.mjs makes them, plus their steps and mistakes in the nine languages the build cannot carry, each
//   written from the English; and gives x161 Single Leg Hip Thrust the band above the knees he asked for (steps 1 and 3 and a fourth
//   mistake, in all eleven languages, and the band in its equipment). The library is NOT rebuilt (see x344-add.mjs for why).
//   The x161 record as it was is kept in x161-before.json beside this file; --undo puts it back and removes the eight, which must give
//   back the original file byte for byte.
import fs from 'node:fs';
const [BUILT, F] = process.argv.slice(2), undo = process.argv.includes('--undo');
const IDS = ['x345', 'x346', 'x347', 'x348', 'x349', 'x350', 'x351', 'x352'];
const BEFORE = new URL('./x161-before.json', import.meta.url);
const J = JSON.parse(fs.readFileSync(F, 'utf8'));
const i161 = J.exercises.findIndex((e) => e.id === 'x161');
if (undo) {
  J.exercises = J.exercises.filter((e) => !IDS.includes(e.id));
  J.exercises[J.exercises.findIndex((e) => e.id === 'x161')] = JSON.parse(fs.readFileSync(BEFORE, 'utf8'));
  fs.writeFileSync(F, JSON.stringify(J)); console.log('removed'); process.exit(0);
}
if (J.exercises.some((e) => IDS.includes(e.id))) throw new Error('already there');
const built = JSON.parse(fs.readFileSync(BUILT, 'utf8')).exercises;

const L = {
  x345: {
    de: { s: ['Geh in den Stütz mit gestreckten Armen, die Hände unter den Schultern und die Schienbeine auf einem Gymnastikball.', 'Spann den Rumpf an, sodass dein Körper vom Kopf bis zu den Fersen eine gerade Linie bildet.', 'Heb mit gestreckten Beinen die Hüfte zur Decke und roll den Ball zu den Händen, bis dein Körper ein umgedrehtes V bildet.', 'Senk die Hüfte langsam zurück in den Stütz und roll den Ball wieder nach hinten.'],
          k: ['Die Knie beugen, statt die Beine gestreckt zu halten.', 'Die Schultern hinter die Hände wandern lassen.', 'Beim Zurückkommen in den Stütz im unteren Rücken durchhängen.'] },
    es: { s: ['Colócate en plancha con los brazos estirados, las manos bajo los hombros y las espinillas sobre un fitball.', 'Activa el abdomen para que el cuerpo forme una línea recta de la cabeza a los talones.', 'Con las piernas rectas, sube la cadera hacia el techo y rueda el balón hacia las manos hasta que el cuerpo forme una V invertida.', 'Baja la cadera despacio hasta la plancha y vuelve a rodar el balón hacia atrás.'],
          k: ['Doblar las rodillas en lugar de mantener las piernas rectas.', 'Dejar que los hombros se vayan por detrás de las manos.', 'Hundir la zona lumbar al volver a la plancha.'] },
    fr: { s: ['Mets-toi en planche bras tendus, les mains sous les épaules et les tibias sur un ballon de gym.', 'Gaine le tronc pour que ton corps forme une ligne droite de la tête aux talons.', 'Jambes tendues, monte le bassin vers le plafond en faisant rouler le ballon vers les mains, jusqu’à former un V inversé.', 'Redescends lentement le bassin en planche en faisant rouler le ballon vers l’arrière.'],
          k: ['Plier les genoux au lieu de garder les jambes tendues.', 'Laisser les épaules reculer derrière les mains.', 'Creuser le bas du dos en revenant en planche.'] },
    it: { s: ['Mettiti in plank a braccia tese, le mani sotto le spalle e gli stinchi su una fitball.', 'Attiva il core in modo che il corpo formi una linea retta dalla testa ai talloni.', 'A gambe tese, solleva il bacino verso il soffitto e fai rotolare la palla verso le mani finché il corpo forma una V rovesciata.', 'Riporta lentamente il bacino in plank e fai rotolare di nuovo indietro la palla.'],
          k: ['Piegare le ginocchia invece di tenere le gambe tese.', 'Lasciare che le spalle vadano dietro le mani.', 'Cedere con la zona lombare tornando in plank.'] },
    pt: { s: ['Fique em prancha com os braços estendidos, as mãos sob os ombros e as canelas sobre uma bola suíça.', 'Contraia o abdômen para que o corpo forme uma linha reta da cabeça aos calcanhares.', 'Com as pernas retas, suba o quadril em direção ao teto e role a bola até as mãos, até o corpo formar um V invertido.', 'Desça o quadril devagar de volta à prancha, rolando a bola para trás.'],
          k: ['Dobrar os joelhos em vez de manter as pernas retas.', 'Deixar os ombros irem para trás das mãos.', 'Deixar a lombar afundar ao voltar à prancha.'] },
    ja: { s: ['腕を伸ばしたプランクの姿勢になり、手を肩の真下に、すねをバランスボールにのせます。', '体幹を固め、頭からかかとまでを一直線に保ちます。', '脚を伸ばしたままお尻を天井へ持ち上げ、ボールを手のほうへ転がして、体が逆V字になるまで上げます。', 'お尻をゆっくり下ろしてプランクに戻り、ボールを元の位置へ転がします。'],
          k: ['脚を伸ばさずに膝を曲げてしまう。', '肩が手より後ろに流れてしまう。', 'プランクに戻るときに腰が落ちてしまう。'] },
    'zh-Hans': { s: ['直臂平板支撑，双手在肩膀正下方，小腿放在瑞士球上。', '收紧核心，让身体从头到脚跟成一条直线。', '保持双腿伸直，把臀部向天花板抬起，同时把球滚向双手，直到身体成倒V形。', '慢慢放下臀部回到平板支撑，把球滚回原位。'],
          k: ['屈膝而不是保持双腿伸直。', '肩膀移到双手后方。', '回到平板支撑时下背塌陷。'] },
    'zh-Hant': { s: ['直臂平板支撐，雙手在肩膀正下方，小腿放在瑞士球上。', '收緊核心，讓身體從頭到腳跟成一直線。', '保持雙腿伸直，把臀部向天花板抬起，同時把球滾向雙手，直到身體成倒V形。', '慢慢放下臀部回到平板支撐，把球滾回原位。'],
          k: ['屈膝而不是保持雙腿伸直。', '肩膀移到雙手後方。', '回到平板支撐時下背塌陷。'] },
    ar: { s: ['اتخذ وضع البلانك بذراعين مستقيمتين، اليدان تحت الكتفين والساقان على كرة التوازن.', 'شدّ عضلات البطن ليكون جسمك خطاً مستقيماً من الرأس إلى الكعبين.', 'مع إبقاء الساقين مستقيمتين، ارفع الحوض نحو السقف ودحرج الكرة نحو يديك حتى يصبح جسمك على شكل V مقلوب.', 'أنزل الحوض ببطء إلى وضع البلانك ودحرج الكرة إلى الخلف.'],
          k: ['ثني الركبتين بدل إبقاء الساقين مستقيمتين.', 'ترك الكتفين ترجعان خلف اليدين.', 'هبوط أسفل الظهر عند العودة إلى البلانك.'] },
  },
  x346: {
    de: { s: ['Stell dich auf einem Bein auf eine niedrige Box und halte eine Kurzhantel aufrecht vor der Brust.', 'Beug das Standknie und senk das freie Bein hinter dir schräg an der Box vorbei ab, wie bei einem Knicks.', 'Tipp mit den Zehen leicht den Boden an, ohne das Gewicht daraufzuverlagern.', 'Drück dich über die Ferse des Standfußes wieder nach oben.'],
          k: ['Das Standknie nach innen fallen lassen.', 'Auf den freien Fuß fallen, statt kontrolliert abzusenken.', 'Den Oberkörper weit nach vorn lehnen.'] },
    es: { s: ['Ponte de pie sobre una pierna en un cajón bajo, con una mancuerna vertical contra el pecho.', 'Flexiona la rodilla de apoyo y baja la pierna libre por detrás y en diagonal, más allá del cajón, como en una reverencia.', 'Toca el suelo suavemente con los dedos del pie sin cargar el peso en ellos.', 'Empuja con el talón del pie de apoyo para volver a subir.'],
          k: ['Dejar que la rodilla de apoyo se vaya hacia dentro.', 'Dejarse caer sobre el pie libre en lugar de bajar con control.', 'Inclinar mucho el torso hacia delante.'] },
    fr: { s: ['Tiens-toi sur une jambe sur une box basse, un haltère tenu à la verticale contre la poitrine.', 'Plie le genou d’appui et descends la jambe libre derrière toi en diagonale, au-delà de la box, comme pour une révérence.', 'Touche légèrement le sol avec les orteils sans y mettre de poids.', 'Pousse dans le talon du pied d’appui pour remonter.'],
          k: ['Laisser le genou d’appui rentrer vers l’intérieur.', 'Tomber sur le pied libre au lieu de descendre sous contrôle.', 'Pencher fortement le buste vers l’avant.'] },
    it: { s: ['Stai su una gamba su un box basso, con un manubrio tenuto in verticale contro il petto.', 'Piega il ginocchio d’appoggio e porta la gamba libera dietro di te in diagonale, oltre il box, come in un inchino.', 'Tocca leggermente il pavimento con le dita del piede senza caricarci il peso.', 'Spingi con il tallone del piede d’appoggio per tornare su.'],
          k: ['Lasciare che il ginocchio d’appoggio cada verso l’interno.', 'Lasciarsi cadere sul piede libero invece di scendere con controllo.', 'Inclinare molto il busto in avanti.'] },
    pt: { s: ['Fique em pé sobre uma perna em um step baixo, segurando um haltere na vertical junto ao peito.', 'Dobre o joelho de apoio e desça a perna livre para trás e na diagonal, além do step, como em uma reverência.', 'Toque o chão de leve com os dedos do pé sem passar o peso para eles.', 'Empurre pelo calcanhar do pé de apoio para subir de novo.'],
          k: ['Deixar o joelho de apoio cair para dentro.', 'Cair sobre o pé livre em vez de descer com controle.', 'Inclinar muito o tronco para a frente.'] },
    ja: { s: ['低いボックスの上に片脚で立ち、ダンベルを1つ縦にして胸の前で持ちます。', '軸脚の膝を曲げ、反対の脚をカーテシーのように後ろ斜めへ、ボックスの外まで下ろします。', 'つま先で床に軽く触れ、体重はのせません。', '軸足のかかとで押して立ち上がります。'],
          k: ['軸脚の膝が内側に入ってしまう。', 'コントロールして下ろさずに、反対の足へ落ちてしまう。', '上半身が大きく前に傾いてしまう。'] },
    'zh-Hans': { s: ['单腿站在矮跳箱上，一只哑铃竖直贴在胸前。', '弯曲支撑腿的膝盖，把另一条腿像屈膝礼一样向后斜方放下，越过跳箱边缘。', '用脚尖轻点地面，不要把重心移过去。', '支撑脚用脚跟发力，重新站起。'],
          k: ['支撑腿膝盖内扣。', '没有控制地下放，而是直接落到另一只脚上。', '上身过度前倾。'] },
    'zh-Hant': { s: ['單腿站在矮跳箱上，一隻啞鈴豎直貼在胸前。', '彎曲支撐腿的膝蓋，把另一條腿像屈膝禮一樣向後斜方放下，越過跳箱邊緣。', '用腳尖輕點地面，不要把重心移過去。', '支撐腳用腳跟發力，重新站起。'],
          k: ['支撐腿膝蓋內扣。', '沒有控制地下放，而是直接落到另一隻腳上。', '上身過度前傾。'] },
    ar: { s: ['قف على رجل واحدة فوق صندوق منخفض، ممسكاً دمبل واحداً عمودياً أمام صدرك.', 'اثنِ ركبة الرجل الثابتة وأنزل الرجل الحرة خلفك بشكل مائل، إلى ما بعد الصندوق، كما في الانحناءة.', 'المس الأرض بأصابع القدم برفق دون أن تنقل وزنك إليها.', 'ادفع بكعب القدم الثابتة لتعود إلى الوقوف.'],
          k: ['ترك ركبة الرجل الثابتة تنحني إلى الداخل.', 'السقوط على القدم الحرة بدل النزول بتحكم.', 'إمالة الجذع كثيراً إلى الأمام.'] },
  },
  x347: {
    de: { s: ['Stell dich auf ein Bein neben eine hohe Bank und leg den anderen Fuß seitlich mit gestrecktem Bein darauf ab.', 'Halte eine Kurzhantel in einer Hand, der Arm lang vor dem Oberschenkel.', 'Beug dich mit geradem Rücken aus der Hüfte und führ die Hantel am Standbein entlang nach unten, bis du eine Dehnung im hinteren Oberschenkel spürst.', 'Schieb die Hüfte nach vorn und richte dich wieder auf, ohne den Fuß von der Bank zu heben.'],
          k: ['Den Rücken rund machen, um tiefer zu kommen.', 'Das Standknie zur Kniebeuge beugen.', 'Sich auf das Bein auf der Bank stützen, statt das Standbein arbeiten zu lassen.'] },
    es: { s: ['Ponte sobre una pierna junto a un banco alto y apoya en él el otro pie, hacia un lado y con la pierna recta.', 'Sujeta una mancuerna en una mano, con el brazo largo delante del muslo.', 'Flexiona la cadera con la espalda recta y baja la mancuerna a lo largo de la pierna de apoyo hasta notar estiramiento en la parte posterior del muslo.', 'Lleva la cadera hacia delante para volver a erguirte, sin levantar el pie del banco.'],
          k: ['Redondear la espalda para bajar más.', 'Doblar la rodilla de apoyo como en una sentadilla.', 'Apoyarse en la pierna del banco en lugar de trabajar con la de apoyo.'] },
    fr: { s: ['Tiens-toi sur une jambe à côté d’un banc haut et pose l’autre pied dessus, sur le côté, jambe tendue.', 'Tiens un haltère dans une main, le bras long devant la cuisse.', 'Bascule depuis la hanche, dos plat, et descends l’haltère le long de la jambe d’appui jusqu’à sentir un étirement à l’arrière de la cuisse.', 'Pousse les hanches vers l’avant pour te redresser, sans décoller le pied du banc.'],
          k: ['Arrondir le dos pour descendre plus bas.', 'Plier le genou d’appui comme pour un squat.', 'S’appuyer sur la jambe posée sur le banc au lieu de faire travailler la jambe d’appui.'] },
    it: { s: ['Stai su una gamba accanto a una panca alta e appoggiaci l’altro piede, di lato, con la gamba tesa.', 'Tieni un manubrio in una mano, il braccio lungo davanti alla coscia.', 'Piegati dall’anca con la schiena dritta e porta il manubrio giù lungo la gamba d’appoggio finché senti allungarsi il retro della coscia.', 'Spingi il bacino in avanti per tornare dritto, senza staccare il piede dalla panca.'],
          k: ['Arrotondare la schiena per scendere di più.', 'Piegare il ginocchio d’appoggio come in uno squat.', 'Appoggiarsi sulla gamba sulla panca invece di far lavorare quella d’appoggio.'] },
    pt: { s: ['Fique sobre uma perna ao lado de um banco alto e apoie nele o outro pé, para o lado, com a perna reta.', 'Segure um haltere em uma mão, com o braço estendido à frente da coxa.', 'Incline a partir do quadril com as costas retas e desça o haltere ao longo da perna de apoio até sentir alongar a parte de trás da coxa.', 'Leve o quadril à frente para voltar a ficar ereto, sem tirar o pé do banco.'],
          k: ['Arredondar as costas para descer mais.', 'Dobrar o joelho de apoio como em um agachamento.', 'Apoiar-se na perna do banco em vez de trabalhar a perna de apoio.'] },
    ja: { s: ['高いベンチの横に片脚で立ち、反対の足を横に伸ばしたままベンチにのせます。', 'ダンベルを片手で持ち、腕を太ももの前に長く下ろします。', '背中をまっすぐ保ったまま股関節から体を倒し、太ももの裏が伸びるまでダンベルを軸脚に沿って下ろします。', 'お尻を前に押し出して立ち上がります。ベンチの足は離しません。'],
          k: ['深く下げようとして背中が丸まる。', '軸脚の膝を曲げてスクワットになってしまう。', '軸脚ではなく、ベンチにのせた脚に体重を預けてしまう。'] },
    'zh-Hans': { s: ['单腿站在高凳旁，另一只脚向侧面伸直搭在凳上。', '一只手握哑铃，手臂自然垂在大腿前方。', '保持背部平直，从髋部前屈，让哑铃沿支撑腿下放，直到大腿后侧有拉伸感。', '向前推髋重新站直，凳上的脚不要离开。'],
          k: ['为了放得更低而弓背。', '支撑腿屈膝变成深蹲。', '把重量压在凳上的腿上，而不是让支撑腿发力。'] },
    'zh-Hant': { s: ['單腿站在高凳旁，另一隻腳向側面伸直搭在凳上。', '一隻手握啞鈴，手臂自然垂在大腿前方。', '保持背部平直，從髖部前屈，讓啞鈴沿支撐腿下放，直到大腿後側有伸展感。', '向前推髖重新站直，凳上的腳不要離開。'],
          k: ['為了放得更低而弓背。', '支撐腿屈膝變成深蹲。', '把重量壓在凳上的腿上，而不是讓支撐腿發力。'] },
    ar: { s: ['قف على رجل واحدة بجانب مقعد مرتفع وضع القدم الأخرى عليه جانباً والرجل مستقيمة.', 'أمسك دمبل بيد واحدة، والذراع ممدودة أمام الفخذ.', 'انحنِ من الورك والظهر مستقيم، وأنزل الدمبل على طول الرجل الثابتة حتى تشعر بتمدد في خلف الفخذ.', 'ادفع الحوض إلى الأمام لتعود إلى الوقوف، دون رفع القدم عن المقعد.'],
          k: ['تقويس الظهر للنزول أكثر.', 'ثني ركبة الرجل الثابتة كأنها قرفصاء.', 'الاتكاء على الرجل التي على المقعد بدل تشغيل الرجل الثابتة.'] },
  },
  x348: {
    de: { s: ['Geh in den Vierfüßlerstand: Hände unter den Schultern, Knie unter der Hüfte, Zehen aufgestellt.', 'Spann den Rumpf an und heb die Knie knapp von der Matte.', 'Halte die Position mit geradem Rücken und ruhigem Atem, die Knie schwebend.', 'Setz zum Schluss die Knie sanft auf der Matte ab.'],
          k: ['Die Hüfte hochschieben, statt den Rücken gerade zu halten.', 'Die Luft anhalten.', 'Die Knie nach vorn oder hinten wandern lassen.'] },
    es: { s: ['Ponte a cuatro patas: manos bajo los hombros, rodillas bajo la cadera y los dedos de los pies apoyados.', 'Activa el abdomen y despega las rodillas un poco de la esterilla.', 'Mantén la posición con la espalda recta y la respiración tranquila, las rodillas suspendidas.', 'Para terminar, apoya suavemente las rodillas en la esterilla.'],
          k: ['Subir la cadera en lugar de mantener la espalda recta.', 'Contener la respiración.', 'Dejar que las rodillas se muevan hacia delante o hacia atrás.'] },
    fr: { s: ['Mets-toi à quatre pattes : mains sous les épaules, genoux sous les hanches, orteils posés au sol.', 'Gaine le tronc et décolle légèrement les genoux du tapis.', 'Tiens la position dos plat et respiration calme, les genoux en suspension.', 'Pour finir, repose doucement les genoux sur le tapis.'],
          k: ['Monter les hanches au lieu de garder le dos plat.', 'Bloquer la respiration.', 'Laisser les genoux avancer ou reculer.'] },
    it: { s: ['Mettiti a quattro zampe: mani sotto le spalle, ginocchia sotto il bacino, dita dei piedi puntate.', 'Attiva il core e stacca di poco le ginocchia dal tappetino.', 'Mantieni la posizione con la schiena dritta e il respiro calmo, le ginocchia sospese.', 'Per finire, riappoggia piano le ginocchia sul tappetino.'],
          k: ['Alzare il bacino invece di tenere la schiena dritta.', 'Trattenere il respiro.', 'Lasciare che le ginocchia si spostino avanti o indietro.'] },
    pt: { s: ['Fique de quatro: mãos sob os ombros, joelhos sob o quadril e dedos dos pés apoiados.', 'Contraia o abdômen e tire os joelhos um pouco do colchonete.', 'Segure a posição com as costas retas e a respiração tranquila, os joelhos suspensos.', 'Para terminar, apoie os joelhos com suavidade no colchonete.'],
          k: ['Subir o quadril em vez de manter as costas retas.', 'Prender a respiração.', 'Deixar os joelhos irem para a frente ou para trás.'] },
    ja: { s: ['四つ這いになります。手は肩の真下、膝は腰の真下、つま先は立てます。', '体幹を固め、膝をマットからわずかに浮かせます。', '背中をまっすぐ、呼吸を落ち着けたまま、膝を浮かせてキープします。', '最後に膝をそっとマットに下ろします。'],
          k: ['背中をまっすぐ保たずにお尻を高く上げてしまう。', '息を止めてしまう。', '膝が前後に動いてしまう。'] },
    'zh-Hans': { s: ['四点跪姿：双手在肩膀正下方，膝盖在髋部正下方，脚尖踩地。', '收紧核心，让膝盖稍稍离开垫子。', '保持背部平直、呼吸平稳，膝盖悬空保持。', '结束时把膝盖轻轻放回垫子上。'],
          k: ['臀部抬高，背部没有保持平直。', '憋气。', '膝盖前后移动。'] },
    'zh-Hant': { s: ['四點跪姿：雙手在肩膀正下方，膝蓋在髖部正下方，腳尖踩地。', '收緊核心，讓膝蓋稍稍離開墊子。', '保持背部平直、呼吸平穩，膝蓋懸空保持。', '結束時把膝蓋輕輕放回墊子上。'],
          k: ['臀部抬高，背部沒有保持平直。', '憋氣。', '膝蓋前後移動。'] },
    ar: { s: ['اتخذ وضع الأربع: اليدان تحت الكتفين، والركبتان تحت الحوض، وأصابع القدمين على الأرض.', 'شدّ عضلات البطن وارفع الركبتين قليلاً عن الحصيرة.', 'اثبت والظهر مستقيم والتنفس هادئ، والركبتان معلقتان.', 'في النهاية أنزل الركبتين برفق إلى الحصيرة.'],
          k: ['رفع الحوض عالياً بدل إبقاء الظهر مستقيماً.', 'حبس النفس.', 'تحريك الركبتين إلى الأمام أو الخلف.'] },
  },
  x349: {
    de: { s: ['Stell dich mit dem Gesicht zur Wand und leg die Unterarme daran ab.', 'Heb ein Knie auf Hüfthöhe und klemm einen Gymnastikball zwischen Knie und Wand.', 'Drück das Knie in den Ball und halte, aufrecht auf dem anderen Bein.', 'Atme während des Haltens ruhig weiter, senk dann das Bein langsam ab und wechsle die Seite.'],
          k: ['Nach hinten lehnen, statt aufrecht zu stehen.', 'Den Ball rutschen lassen, weil das Knie nicht mehr drückt.', 'Den unteren Rücken rund machen, um das Knie höher zu heben.'] },
    es: { s: ['Colócate de frente a una pared y apoya en ella los antebrazos.', 'Sube una rodilla a la altura de la cadera y sujeta un fitball entre la rodilla y la pared.', 'Empuja la rodilla contra el balón y mantén, erguido sobre la otra pierna.', 'Respira con calma durante todo el aguante; luego baja la pierna despacio y cambia de lado.'],
          k: ['Inclinarse hacia atrás en lugar de mantenerse erguido.', 'Dejar que el balón resbale porque la rodilla deja de empujar.', 'Redondear la zona lumbar para subir más la rodilla.'] },
    fr: { s: ['Place-toi face à un mur et pose les avant-bras dessus.', 'Monte un genou à hauteur de hanche et coince un ballon de gym entre le genou et le mur.', 'Pousse le genou dans le ballon et tiens, bien droit sur l’autre jambe.', 'Respire calmement pendant tout le maintien, puis redescends la jambe lentement et change de côté.'],
          k: ['Se pencher en arrière au lieu de rester droit.', 'Laisser glisser le ballon parce que le genou ne pousse plus.', 'Arrondir le bas du dos pour monter le genou plus haut.'] },
    it: { s: ['Mettiti di fronte a un muro e appoggiaci gli avambracci.', 'Solleva un ginocchio all’altezza del bacino e blocca una fitball tra il ginocchio e il muro.', 'Spingi il ginocchio nella palla e mantieni, dritto sull’altra gamba.', 'Respira con calma per tutta la tenuta, poi abbassa piano la gamba e cambia lato.'],
          k: ['Inclinarsi all’indietro invece di stare dritto.', 'Lasciar scivolare la palla perché il ginocchio smette di spingere.', 'Arrotondare la zona lombare per alzare di più il ginocchio.'] },
    pt: { s: ['Fique de frente para uma parede e apoie nela os antebraços.', 'Suba um joelho à altura do quadril e prenda uma bola suíça entre o joelho e a parede.', 'Empurre o joelho contra a bola e segure, ereto sobre a outra perna.', 'Respire com calma durante toda a sustentação; depois desça a perna devagar e troque de lado.'],
          k: ['Inclinar-se para trás em vez de ficar ereto.', 'Deixar a bola escorregar porque o joelho parou de empurrar.', 'Arredondar a lombar para subir mais o joelho.'] },
    ja: { s: ['壁に向かって立ち、前腕を壁につけます。', '片膝を腰の高さまで上げ、膝と壁のあいだにバランスボールをはさみます。', '膝でボールを押し続け、反対の脚でまっすぐ立ったままキープします。', 'キープ中は呼吸を止めず、最後に脚をゆっくり下ろして反対側も行います。'],
          k: ['まっすぐ立たずに後ろへもたれてしまう。', '膝で押すのをやめてボールが滑り落ちる。', '膝を高く上げようとして腰が丸まる。'] },
    'zh-Hans': { s: ['面对墙站立，前臂贴在墙上。', '一侧膝盖抬到髋部高度，把瑞士球夹在膝盖和墙之间。', '膝盖持续向球施压并保持，另一条腿站直。', '保持过程中平稳呼吸，然后慢慢放下腿，换另一侧。'],
          k: ['身体后仰，没有站直。', '膝盖停止发力，球滑落下来。', '为了把膝盖抬得更高而弓起下背。'] },
    'zh-Hant': { s: ['面對牆站立，前臂貼在牆上。', '一側膝蓋抬到髖部高度，把瑞士球夾在膝蓋和牆之間。', '膝蓋持續向球施壓並保持，另一條腿站直。', '保持過程中平穩呼吸，然後慢慢放下腿，換另一側。'],
          k: ['身體後仰，沒有站直。', '膝蓋停止發力，球滑落下來。', '為了把膝蓋抬得更高而弓起下背。'] },
    ar: { s: ['قف مواجهاً الحائط وضع ساعديك عليه.', 'ارفع ركبة واحدة إلى مستوى الورك وثبّت كرة التوازن بين الركبة والحائط.', 'ادفع الركبة نحو الكرة واثبت، منتصباً على الرجل الأخرى.', 'تنفس بهدوء طوال الثبات، ثم أنزل الرجل ببطء وبدّل الجهة.'],
          k: ['الميل إلى الخلف بدل الوقوف منتصباً.', 'انزلاق الكرة لأن الركبة توقفت عن الدفع.', 'تقويس أسفل الظهر لرفع الركبة أعلى.'] },
  },
  x350: {
    de: { s: ['Geh in den Ausfallschritt, die Zehen des vorderen Fußes auf einem Keil und die Ferse am Boden.', 'Senk das hintere Knie, bis es knapp über dem Boden schwebt, und lass das vordere Knie über die Zehen nach vorn wandern.', 'Halte die untere Position mit aufrechtem Oberkörper und dem Gewicht auf dem vorderen Fuß.', 'Atme ruhig weiter, drück dich dann über den vorderen Fuß hoch und wechsle die Seite.'],
          k: ['Die vordere Ferse vom Boden abheben.', 'Das hintere Knie auf dem Boden ablegen, statt zu halten.', 'Den Oberkörper nach vorn lehnen, um das Halten leichter zu machen.'] },
    es: { s: ['Colócate en posición de zancada, con los dedos del pie delantero sobre una cuña y el talón en el suelo.', 'Baja la rodilla trasera hasta que quede justo encima del suelo, con la rodilla delantera avanzando por encima de los dedos.', 'Mantén la posición baja con el torso erguido y el peso en el pie delantero.', 'Respira con calma, luego empuja con el pie delantero para subir y cambia de lado.'],
          k: ['Levantar del suelo el talón delantero.', 'Apoyar la rodilla trasera en el suelo en lugar de mantener.', 'Inclinar el torso hacia delante para que el aguante sea más fácil.'] },
    fr: { s: ['Place-toi en fente, les orteils du pied avant sur une cale et le talon au sol.', 'Descends le genou arrière jusqu’à ce qu’il frôle le sol, le genou avant avançant au-dessus des orteils.', 'Tiens la position basse, buste droit et poids sur le pied avant.', 'Respire calmement, puis remonte en poussant dans le pied avant et change de côté.'],
          k: ['Laisser le talon avant se décoller du sol.', 'Poser le genou arrière au sol au lieu de tenir.', 'Pencher le buste en avant pour rendre le maintien plus facile.'] },
    it: { s: ['Mettiti in affondo, con le dita del piede anteriore su un cuneo e il tallone a terra.', 'Abbassa il ginocchio posteriore finché resta appena sopra il pavimento, con il ginocchio anteriore che avanza oltre le dita.', 'Mantieni la posizione bassa con il busto dritto e il peso sul piede anteriore.', 'Respira con calma, poi spingi con il piede anteriore per risalire e cambia lato.'],
          k: ['Staccare da terra il tallone anteriore.', 'Appoggiare a terra il ginocchio posteriore invece di mantenere.', 'Inclinare il busto in avanti per rendere più facile la tenuta.'] },
    pt: { s: ['Fique em posição de afundo, com os dedos do pé da frente sobre uma cunha e o calcanhar no chão.', 'Desça o joelho de trás até ficar logo acima do chão, com o joelho da frente avançando sobre os dedos.', 'Segure a posição baixa com o tronco ereto e o peso no pé da frente.', 'Respire com calma; depois empurre com o pé da frente para subir e troque de lado.'],
          k: ['Tirar do chão o calcanhar da frente.', 'Apoiar o joelho de trás no chão em vez de sustentar.', 'Inclinar o tronco para a frente para facilitar a sustentação.'] },
    ja: { s: ['前後に脚を開き、前足のつま先をウェッジにのせ、かかとは床につけます。', '後ろの膝を床すれすれまで下ろし、前の膝はつま先より前へ出します。', '上半身を起こし、体重を前足にのせたまま下の位置でキープします。', '呼吸を続け、前足で押して立ち上がり、反対側も行います。'],
          k: ['前足のかかとが床から浮いてしまう。', 'キープせずに後ろの膝を床につけてしまう。', '楽をしようとして上半身が前に倒れる。'] },
    'zh-Hans': { s: ['分腿站立，前脚脚尖踩在楔形板上，脚跟着地。', '后膝下降到刚好悬在地面上方，前膝向前越过脚尖。', '在底部保持，上身直立，重心放在前脚。', '保持平稳呼吸，然后用前脚发力站起，换另一侧。'],
          k: ['前脚脚跟离地。', '后膝放到地上，而不是悬空保持。', '为了更轻松而上身前倾。'] },
    'zh-Hant': { s: ['分腿站立，前腳腳尖踩在楔形板上，腳跟著地。', '後膝下降到剛好懸在地面上方，前膝向前越過腳尖。', '在底部保持，上身直立，重心放在前腳。', '保持平穩呼吸，然後用前腳發力站起，換另一側。'],
          k: ['前腳腳跟離地。', '後膝放到地上，而不是懸空保持。', '為了更輕鬆而上身前傾。'] },
    ar: { s: ['قف بوضع الطعن، وأصابع القدم الأمامية على إسفين والكعب على الأرض.', 'أنزل الركبة الخلفية حتى تكاد تلامس الأرض، والركبة الأمامية تتقدم فوق أصابع القدم.', 'اثبت في الوضع السفلي والجذع منتصب والوزن على القدم الأمامية.', 'تنفس بهدوء، ثم ادفع بالقدم الأمامية لتصعد وبدّل الجهة.'],
          k: ['رفع الكعب الأمامي عن الأرض.', 'وضع الركبة الخلفية على الأرض بدل الثبات.', 'إمالة الجذع إلى الأمام لتسهيل الثبات.'] },
  },
  x351: {
    de: { s: ['Knie dich auf eine Matte, die Schienbeine flach darauf, das Gesäß Richtung Fersen, die Arme hinter dir.', 'Schwing die Arme kräftig nach vorn und drück die Hüfte hoch, um beide Füße unter den Körper zu bringen.', 'Lande in einer tiefen Kniebeuge, die Füße flach und die Knie über den Zehen.', 'Spring explosiv gerade nach oben, lande weich und knie dich für die nächste Wiederholung wieder hin.'],
          k: ['Auf den Zehen statt auf ganzen Füßen landen.', 'Die Knie bei der Landung nach innen fallen lassen.', 'Abspringen, bevor die Kniebeuge stabil ist.'] },
    es: { s: ['Arrodíllate en una esterilla con las espinillas apoyadas, la cadera hacia los talones y los brazos atrás.', 'Lanza los brazos con fuerza hacia delante y sube la cadera para llevar los dos pies debajo del cuerpo.', 'Aterriza en una sentadilla profunda, con los pies planos y las rodillas sobre los dedos.', 'Salta con fuerza hacia arriba, aterriza con suavidad y vuelve a arrodillarte para la siguiente repetición.'],
          k: ['Aterrizar de puntillas en lugar de con los pies planos.', 'Dejar que las rodillas se vayan hacia dentro al aterrizar.', 'Saltar antes de que la sentadilla sea estable.'] },
    fr: { s: ['Mets-toi à genoux sur un tapis, les tibias à plat, les fesses vers les talons et les bras derrière toi.', 'Lance les bras vers l’avant avec force et pousse les hanches vers le haut pour ramener les deux pieds sous toi.', 'Réceptionne-toi en squat profond, pieds à plat et genoux au-dessus des orteils.', 'Saute de façon explosive vers le haut, réceptionne-toi en douceur et remets-toi à genoux pour la répétition suivante.'],
          k: ['Atterrir sur la pointe des pieds au lieu des pieds à plat.', 'Laisser les genoux rentrer à la réception.', 'Sauter avant que le squat soit stable.'] },
    it: { s: ['Inginocchiati su un tappetino con gli stinchi appoggiati, il bacino verso i talloni e le braccia dietro.', 'Slancia le braccia in avanti con forza e spingi il bacino in alto per portare entrambi i piedi sotto il corpo.', 'Atterra in uno squat profondo, i piedi piatti e le ginocchia sopra le dita.', 'Salta in modo esplosivo verso l’alto, atterra morbido e torna in ginocchio per la ripetizione successiva.'],
          k: ['Atterrare sulle punte invece che sui piedi piatti.', 'Lasciare che le ginocchia cadano verso l’interno all’atterraggio.', 'Saltare prima che lo squat sia stabile.'] },
    pt: { s: ['Ajoelhe-se em um colchonete com as canelas apoiadas, o quadril em direção aos calcanhares e os braços atrás.', 'Lance os braços com força para a frente e suba o quadril para trazer os dois pés para baixo do corpo.', 'Aterrisse em um agachamento profundo, com os pés apoiados e os joelhos sobre os dedos.', 'Salte com explosão para cima, aterrisse com suavidade e volte a ajoelhar para a próxima repetição.'],
          k: ['Aterrissar na ponta dos pés em vez de com os pés apoiados.', 'Deixar os joelhos caírem para dentro na aterrissagem.', 'Saltar antes de o agachamento estar estável.'] },
    ja: { s: ['マットにすねをつけてひざまずき、お尻をかかとのほうへ下げ、腕は後ろに引きます。', '腕を前へ勢いよく振り、腰を突き上げて両足を体の下に引き込みます。', '足裏全体で着地して深いスクワットになり、膝はつま先の上に保ちます。', 'そのまま真上へ爆発的にジャンプし、やわらかく着地して、次の回のためにひざまずきます。'],
          k: ['足裏全体ではなくつま先で着地してしまう。', '着地で膝が内側に入ってしまう。', 'スクワットが安定する前に跳んでしまう。'] },
    'zh-Hans': { s: ['跪在垫子上，小腿平贴垫面，臀部向脚跟坐，双臂在身后。', '双臂用力向前摆，同时向上顶髋，把双脚收到身体下方。', '全脚掌落地成深蹲，膝盖在脚尖上方。', '接着向上爆发跳起，轻柔落地，再跪下开始下一次。'],
          k: ['用脚尖落地，而不是全脚掌。', '落地时膝盖内扣。', '深蹲还没稳住就起跳。'] },
    'zh-Hant': { s: ['跪在墊子上，小腿平貼墊面，臀部向腳跟坐，雙臂在身後。', '雙臂用力向前擺，同時向上頂髖，把雙腳收到身體下方。', '全腳掌落地成深蹲，膝蓋在腳尖上方。', '接著向上爆發跳起，輕柔落地，再跪下開始下一次。'],
          k: ['用腳尖落地，而不是全腳掌。', '落地時膝蓋內扣。', '深蹲還沒穩住就起跳。'] },
    ar: { s: ['اركع على حصيرة والساقان ممدودتان عليها، والحوض نحو الكعبين، والذراعان خلفك.', 'أرجح ذراعيك بقوة إلى الأمام وادفع الحوض إلى الأعلى لتسحب قدميك تحت جسمك.', 'اهبط في قرفصاء عميقة، والقدمان مسطحتان والركبتان فوق أصابع القدمين.', 'اقفز بقوة إلى الأعلى، واهبط بنعومة، ثم عد إلى الركوع للتكرار التالي.'],
          k: ['الهبوط على أصابع القدمين بدل القدم كاملة.', 'انحناء الركبتين إلى الداخل عند الهبوط.', 'القفز قبل أن تستقر القرفصاء.'] },
  },
  x352: {
    de: { s: ['Knie dich auf eine Matte, eine Langhantel auf dem oberen Rücken, die Schienbeine flach auf der Matte und das Gesäß Richtung Fersen.', 'Halt die Stange fest und drück die Hüfte kräftig hoch, um beide Füße unter den Körper zu bringen.', 'Lande in einer tiefen Kniebeuge, die Füße flach und die Brust aufrecht.', 'Spring nach oben, lande weich in der Kniebeuge und knie dich kontrolliert wieder hin.'],
          k: ['Ein Gewicht, mit dem du nicht kontrolliert landen kannst.', 'Die Stange springt bei der Landung auf den Nacken.', 'Die Knie bei der Landung nach innen fallen lassen.'] },
    es: { s: ['Arrodíllate en una esterilla con una barra sobre la parte alta de la espalda, las espinillas apoyadas y la cadera hacia los talones.', 'Sujeta firme la barra y sube la cadera con fuerza para llevar los dos pies debajo del cuerpo.', 'Aterriza en una sentadilla profunda, con los pies planos y el pecho erguido.', 'Salta hacia arriba, aterriza con suavidad en sentadilla y vuelve a arrodillarte con control.'],
          k: ['Una carga con la que no puedes aterrizar con control.', 'La barra rebotando en el cuello al aterrizar.', 'Dejar que las rodillas se vayan hacia dentro al aterrizar.'] },
    fr: { s: ['Mets-toi à genoux sur un tapis, une barre sur le haut du dos, les tibias à plat et les fesses vers les talons.', 'Tiens fermement la barre et pousse fort les hanches vers le haut pour ramener les deux pieds sous toi.', 'Réceptionne-toi en squat profond, pieds à plat et poitrine haute.', 'Saute vers le haut, réceptionne-toi en douceur en squat et remets-toi à genoux sous contrôle.'],
          k: ['Une charge avec laquelle tu ne peux pas atterrir sous contrôle.', 'La barre qui rebondit sur la nuque à la réception.', 'Laisser les genoux rentrer à la réception.'] },
    it: { s: ['Inginocchiati su un tappetino con un bilanciere sulla parte alta della schiena, gli stinchi appoggiati e il bacino verso i talloni.', 'Tieni saldo il bilanciere e spingi forte il bacino in alto per portare entrambi i piedi sotto il corpo.', 'Atterra in uno squat profondo, i piedi piatti e il petto alto.', 'Salta verso l’alto, atterra morbido in squat e torna in ginocchio con controllo.'],
          k: ['Un carico con cui non riesci ad atterrare con controllo.', 'Il bilanciere che rimbalza sul collo all’atterraggio.', 'Lasciare che le ginocchia cadano verso l’interno all’atterraggio.'] },
    pt: { s: ['Ajoelhe-se em um colchonete com uma barra na parte alta das costas, as canelas apoiadas e o quadril em direção aos calcanhares.', 'Segure firme a barra e suba o quadril com força para trazer os dois pés para baixo do corpo.', 'Aterrisse em um agachamento profundo, com os pés apoiados e o peito erguido.', 'Salte para cima, aterrisse com suavidade no agachamento e volte a ajoelhar com controle.'],
          k: ['Uma carga com a qual você não consegue aterrissar com controle.', 'A barra quicando no pescoço na aterrissagem.', 'Deixar os joelhos caírem para dentro na aterrissagem.'] },
    ja: { s: ['バーベルを背中の上部にかつぎ、マットにすねをつけてひざまずき、お尻をかかとのほうへ下げます。', 'バーをしっかり握り、腰を力強く突き上げて両足を体の下に引き込みます。', '足裏全体で着地して深いスクワットになり、胸を起こします。', '上へジャンプし、スクワットにやわらかく着地して、コントロールしながらひざまずきます。'],
          k: ['コントロールして着地できない重さで行う。', '着地でバーが首の上で跳ねる。', '着地で膝が内側に入ってしまう。'] },
    'zh-Hans': { s: ['杠铃放在上背部，跪在垫子上，小腿平贴垫面，臀部向脚跟坐。', '握紧杠铃，用力向上顶髋，把双脚收到身体下方。', '全脚掌落地成深蹲，挺胸。', '向上跳起，轻柔落地成深蹲，再有控制地跪下。'],
          k: ['用无法控制落地的重量。', '落地时杠铃在颈部弹跳。', '落地时膝盖内扣。'] },
    'zh-Hant': { s: ['槓鈴放在上背部，跪在墊子上，小腿平貼墊面，臀部向腳跟坐。', '握緊槓鈴，用力向上頂髖，把雙腳收到身體下方。', '全腳掌落地成深蹲，挺胸。', '向上跳起，輕柔落地成深蹲，再有控制地跪下。'],
          k: ['用無法控制落地的重量。', '落地時槓鈴在頸部彈跳。', '落地時膝蓋內扣。'] },
    ar: { s: ['اركع على حصيرة والبار على أعلى ظهرك، والساقان ممدودتان على الحصيرة والحوض نحو الكعبين.', 'أمسك البار بثبات وادفع الحوض بقوة إلى الأعلى لتسحب قدميك تحت جسمك.', 'اهبط في قرفصاء عميقة، والقدمان مسطحتان والصدر مرفوع.', 'اقفز إلى الأعلى، واهبط بنعومة في القرفصاء، ثم عد إلى الركوع بتحكم.'],
          k: ['وزن لا تستطيع الهبوط به بتحكم.', 'ارتداد البار على الرقبة عند الهبوط.', 'انحناء الركبتين إلى الداخل عند الهبوط.'] },
  },
};

// x161: steps 1 and 3 name the band, and a fourth mistake - each language's own existing step 2 and 4 and mistakes 1-3 are kept
const X161 = {
  de: ['Setz dich auf den Boden, den oberen Rücken an eine Bank oder eine gepolsterte Box gelehnt, ein Band um beide Oberschenkel knapp über den Knien.', 'Drück die Hüfte nach oben, bis Knie und Schultern eine gerade Linie bilden, spann das Gesäß an und drück das Arbeitsknie gegen das Band nach außen.', 'Das Arbeitsknie fällt nach innen zum Band.'],
  es: ['Siéntate en el suelo con la parte alta de la espalda apoyada en un banco o un cajón acolchado y una banda alrededor de ambos muslos, justo encima de las rodillas.', 'Sube la cadera hasta formar una línea recta de la rodilla al hombro, aprieta los glúteos y empuja la rodilla de trabajo hacia fuera contra la banda.', 'La rodilla de trabajo que se va hacia dentro, hacia la banda.'],
  fr: ['Assieds-toi au sol, le haut du dos appuyé contre un banc ou une box rembourrée, un élastique autour des deux cuisses juste au-dessus des genoux.', 'Pousse les hanches vers le haut jusqu’à l’alignement du genou à l’épaule, contracte les fessiers et pousse le genou qui travaille vers l’extérieur contre l’élastique.', 'Le genou qui travaille rentre vers l’élastique.'],
  it: ['Siediti a terra con la parte alta della schiena appoggiata a una panca o a un box imbottito, un elastico attorno a entrambe le cosce appena sopra le ginocchia.', 'Spingi il bacino in alto fino a una linea retta dal ginocchio alla spalla, contrai i glutei e spingi il ginocchio che lavora verso l’esterno contro l’elastico.', 'Il ginocchio che lavora cade verso l’interno, verso l’elastico.'],
  pt: ['Sente-se no chão com a parte alta das costas apoiada em um banco ou em um caixote acolchoado, com um elástico em volta das duas coxas logo acima dos joelhos.', 'Suba o quadril até formar uma linha reta do joelho ao ombro, contraia os glúteos e empurre o joelho que trabalha para fora contra o elástico.', 'O joelho que trabalha caindo para dentro, em direção ao elástico.'],
  ja: ['床に座り、背中の上部をベンチかクッション付きのボックスにあずけ、膝のすぐ上で両方の太ももにバンドを巻きます。', '膝から肩まで一直線になるまでお尻を押し上げ、お尻を締めながら、動かす側の膝をバンドに逆らって外へ押します。', '動かす側の膝がバンドに引かれて内側に入る。'],
  'zh-Hans': ['坐在地上，上背部靠在长凳或带软垫的跳箱上，在膝盖上方把弹力带套在两侧大腿上。', '把臀部向上推到膝盖到肩膀成一条直线，夹紧臀部，并让发力侧膝盖向外顶住弹力带。', '发力侧膝盖向弹力带方向内扣。'],
  'zh-Hant': ['坐在地上，上背部靠在長凳或帶軟墊的跳箱上，在膝蓋上方把彈力帶套在兩側大腿上。', '把臀部向上推到膝蓋到肩膀成一直線，夾緊臀部，並讓發力側膝蓋向外頂住彈力帶。', '發力側膝蓋向彈力帶方向內扣。'],
  ar: ['اجلس على الأرض وأعلى ظهرك مستند إلى مقعد أو صندوق مبطن، مع شريط مطاطي حول الفخذين فوق الركبتين مباشرة.', 'ادفع الحوض إلى الأعلى حتى خط مستقيم من الركبة إلى الكتف، وشدّ الألوية وادفع ركبة الرجل العاملة إلى الخارج ضد الشريط.', 'انحناء ركبة الرجل العاملة إلى الداخل نحو الشريط.'],
};

const check = (id, l, v, en) => {
  if (v.s.length !== en.s.length || v.k.length !== en.k.length) throw new Error(id + ' ' + l + ': line count differs from English');
  if ([...v.s, ...v.k].some((x) => !x.trim() || /[֐-׿]/.test(x))) throw new Error(id + ' ' + l + ': empty or Hebrew');
};
for (const id of IDS) {
  const e = built.find((e) => e.id === id);
  if (!e) throw new Error(id + ' not in the build');
  for (const [l, v] of Object.entries(L[id])) { check(id, l, v, e.sl.en); e.sl[l] = v; }
  if (Object.keys(e.sl).length !== 10) throw new Error(id + ': ' + Object.keys(e.sl).length + ' step languages');
  J.exercises.push(e);
}
// x161 in place: what the build changed (equipment, Hebrew and English steps) plus the nine
const old = J.exercises[i161], b161 = built.find((e) => e.id === 'x161');
fs.writeFileSync(BEFORE, JSON.stringify(old));
const n = JSON.parse(JSON.stringify(old));
n.q = b161.q; n.eqt = b161.eqt; n.lv = b161.lv; n.s = b161.s; n.k = b161.k; n.sl.en = b161.sl.en;
for (const [l, [s1, s3, k4]] of Object.entries(X161)) {
  const v = n.sl[l]; if (!v) throw new Error('x161 has no ' + l);
  v.s[0] = s1; v.s[2] = s3; v.k = v.k.concat([k4]);
  check('x161', l, v, n.sl.en);
}
J.exercises[i161] = n;
fs.writeFileSync(F, JSON.stringify(J));
console.log('added', IDS.join(' '), '- x161 band in', Object.keys(n.sl).join(' '));
