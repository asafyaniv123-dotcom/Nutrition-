// node tools/patches/x344-add.mjs <built-exercises.json> <exercises.json> [--undo] - adds x344 Elevated Glute Bridge (28 Nov) to the
//   library exactly as build-exercises.mjs makes it, plus its steps and mistakes in the nine languages ex-sl-merge.mjs carries,
//   each written from the English. The library is NOT rebuilt: the build drops those nine languages (and disagrees on x226/x228).
//   --undo removes x344 again, which must give back the original file byte for byte.
import fs from 'node:fs';
const [BUILT, F] = process.argv.slice(2), undo = process.argv.includes('--undo');
const J = JSON.parse(fs.readFileSync(F, 'utf8'));
if (undo) { J.exercises = J.exercises.filter(e => e.id !== 'x344'); fs.writeFileSync(F, JSON.stringify(J)); console.log('removed'); process.exit(0); }
if (J.exercises.some(e => e.id === 'x344')) throw new Error('x344 already there');
const e = JSON.parse(fs.readFileSync(BUILT, 'utf8')).exercises.find(e => e.id === 'x344');
const L = {
  de: { s: ['Leg dich auf den Rücken vor eine Box, ein Sofa oder einen stabilen Stuhl, die Fersen auf der Kante und die Knie gebeugt.',
            'Leg die Arme seitlich auf den Boden oder auf die Hüfte.',
            'Drück dich über die Fersen ab und heb die Hüfte, bis Knie, Hüfte und Schultern eine gerade Linie bilden.',
            'Halte oben kurz inne und senk dich langsam ab, bis die Hüfte fast den Boden berührt.'],
        k: ['Ins Hohlkreuz gehen, statt die Hüfte zu strecken.', 'Eine Unterlage, die unter den Fersen rutscht oder wackelt.', 'Über die Zehen statt über die Fersen drücken.'] },
  es: { s: ['Túmbate boca arriba frente a un cajón, un sofá o una silla estable, con los talones en el borde y las rodillas flexionadas.',
            'Apoya los brazos en el suelo a los lados o sobre la cadera.',
            'Empuja con los talones y sube la cadera hasta que rodillas, cadera y hombros formen una línea recta.',
            'Haz una pausa arriba y baja despacio hasta que la cadera casi toque el suelo.'],
        k: ['Arquear la zona lumbar en lugar de extender la cadera.', 'Una superficie que resbala o se mueve bajo los talones.', 'Empujar con los dedos de los pies en vez de con los talones.'] },
  fr: { s: ['Allonge-toi sur le dos face à une box, un canapé ou une chaise stable, les talons sur le bord et les genoux fléchis.',
            'Pose les bras au sol le long du corps ou sur les hanches.',
            'Pousse dans les talons et monte le bassin jusqu’à aligner genoux, hanches et épaules.',
            'Marque une pause en haut, puis redescends lentement jusqu’à ce que le bassin frôle le sol.'],
        k: ['Cambrer le bas du dos au lieu d’ouvrir la hanche.', 'Un support qui glisse ou bouge sous les talons.', 'Pousser avec les orteils plutôt qu’avec les talons.'] },
  it: { s: ['Sdraiati sulla schiena davanti a un box, un divano o una sedia stabile, i talloni sul bordo e le ginocchia piegate.',
            'Appoggia le braccia a terra lungo i fianchi o sul bacino.',
            'Spingi con i talloni e solleva il bacino finché ginocchia, anche e spalle formano una linea retta.',
            'Fermati un attimo in alto e scendi lentamente finché il bacino quasi tocca terra.'],
        k: ['Inarcare la zona lombare invece di estendere l’anca.', 'Un appoggio che scivola o si muove sotto i talloni.', 'Spingere con le punte invece che con i talloni.'] },
  pt: { s: ['Deite-se de costas de frente para uma caixa, um sofá ou uma cadeira firme, com os calcanhares na borda e os joelhos dobrados.',
            'Apoie os braços no chão ao lado do corpo ou sobre o quadril.',
            'Empurre pelos calcanhares e suba o quadril até joelhos, quadril e ombros formarem uma linha reta.',
            'Faça uma pausa no alto e desça devagar até o quadril quase tocar o chão.'],
        k: ['Arquear a lombar em vez de estender o quadril.', 'Uma superfície que escorrega ou balança sob os calcanhares.', 'Empurrar com a ponta dos pés em vez dos calcanhares.'] },
  ja: { s: ['ボックス、ソファ、または安定した椅子の前で仰向けになり、かかとを縁にのせて膝を曲げます。',
            '腕は体の横の床か、腰の上に置きます。',
            'かかとで押してお尻を持ち上げ、膝・腰・肩が一直線になるまで上げます。',
            '上で一瞬止め、お尻が床につく直前までゆっくり下ろします。'],
        k: ['股関節を伸ばさずに腰を反らせてしまう。', 'かかとの下の台が滑ったりぐらついたりする。', 'かかとではなくつま先で押してしまう。'] },
  'zh-Hans': { s: ['面对跳箱、沙发或稳固的椅子仰卧，脚跟放在边缘，屈膝。',
            '双臂放在身体两侧的地面上，或放在髋部。',
            '用脚跟发力抬起臀部，直到膝盖、髋部和肩膀成一条直线。',
            '在顶端稍作停顿，然后慢慢下放，直到臀部几乎碰到地面。'],
        k: ['靠拱起下背部代替伸髋。', '脚跟下的支撑面打滑或晃动。', '用脚尖而不是脚跟发力。'] },
  'zh-Hant': { s: ['面對跳箱、沙發或穩固的椅子仰躺，腳跟放在邊緣，屈膝。',
            '雙臂放在身體兩側的地面上，或放在髖部。',
            '用腳跟發力抬起臀部，直到膝蓋、髖部和肩膀成一直線。',
            '在頂端稍作停頓，然後慢慢放下，直到臀部幾乎碰到地面。'],
        k: ['靠拱起下背部代替伸髖。', '腳跟下的支撐面打滑或晃動。', '用腳尖而不是腳跟發力。'] },
  ar: { s: ['استلقِ على ظهرك أمام صندوق أو أريكة أو كرسي ثابت، والكعبان على الحافة والركبتان مثنيتان.',
            'ضع ذراعيك على الأرض بجانب جسمك أو على الوركين.',
            'ادفع بكعبيك وارفع الحوض حتى تصبح الركبتان والوركان والكتفان في خط مستقيم.',
            'توقف لحظة في الأعلى، ثم انزل ببطء حتى يكاد الحوض يلمس الأرض.'],
        k: ['تقويس أسفل الظهر بدل مدّ الورك.', 'سطح ينزلق أو يهتز تحت الكعبين.', 'الدفع بأصابع القدمين بدل الكعبين.'] },
};
const en = e.sl.en;
for (const [l, v] of Object.entries(L)) {
  if (v.s.length !== en.s.length || v.k.length !== en.k.length) throw new Error(l + ': line count differs from English');
  if ([...v.s, ...v.k].some(x => !x.trim() || /[֐-׿]/.test(x))) throw new Error(l + ': empty or Hebrew');
  e.sl[l] = v;
}
J.exercises.push(e);
fs.writeFileSync(F, JSON.stringify(J));
console.log('added x344 with', Object.keys(e.sl).join(' '));
