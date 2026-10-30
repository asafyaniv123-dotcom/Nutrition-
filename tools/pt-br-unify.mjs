/* Make data/lang/pt.json one voice: Brazilian Portuguese, addressing the
 * reader as "você".
 *
 * Most of the file already was. 106 values were not: European
 * "tu" forms (podes, tens, queres, o teu, contigo, treinaste), enclitic
 * -te / -me where Brazil puts the pronoun first (digo-te, Cria-me), the
 * European "estar a + infinitive", and European vocabulary (registar,
 * ecrã, definições, a app, cronómetro, ronda, saltar, passatempo, défice).
 * A Brazilian reader met both voices on the same screen.
 *
 * Found by scanning the values for those forms, then each one read against
 * its Hebrew key and its English value. Left alone on purpose:
 *   - a proclitic "te" in a você sentence ("Eu te lembro às {time}") -
 *     that is how Brazil writes, and the file already does it everywhere;
 *   - third-person verbs that look like tu imperatives ("Apaga todos os
 *     dados", "Adiciona só o que falta" describe what a button does);
 *   - "a App Store" (a loja) and "definição" as the fitness goal.
 *
 * Every entry holds the value it expects to replace, so a value someone
 * has changed since is reported instead of overwritten.
 *
 *     node tools/pt-br-unify.mjs          # write data/lang/pt.json
 *     node tools/pt-br-unify.mjs --list   # print old -> new, write nothing
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'data', 'lang', 'pt.json');
const LIST = process.argv.includes('--list');

/* [Hebrew key, old value, new value] */
const CHANGES = [
  // --- possessives: o teu / a tua -> seu / sua (the file's own habit drops the article)
  ['הגוף שלך', 'O teu corpo', 'Seu corpo'],
  ['השירים שלך', 'As tuas músicas', 'Suas músicas'],
  ['התמונות שלך', 'As tuas fotos', 'Suas fotos'],
  ['סיכום השבוע', 'A tua semana', 'Sua semana'],
  ['החלוקה שיצאה', 'A tua divisão', 'Sua divisão'],
  ['התוכנית שלך', 'O teu plano', 'Seu plano'],
  ['הקצב שלך', 'O teu ritmo', 'Seu ritmo'],
  ['מה שאמרת', 'Nas tuas palavras', 'Nas suas palavras'],
  ['במילים שלך…', 'Nas tuas palavras…', 'Nas suas palavras…'],
  ['לפי המטרה שלך: {g}', 'Para o teu objetivo: {g}', 'Para o seu objetivo: {g}'],
  ['ועכשיו, היום הראשון שלך.', 'E agora, o teu primeiro dia.', 'E agora, seu primeiro dia.'],
  ['שתי שאלות קטנות על היום הזה. ככה מתחיל היומן שלך.',
    'Duas pequenas perguntas sobre hoje. É assim que começa o teu diário.',
    'Duas pequenas perguntas sobre hoje. É assim que começa seu diário.'],
  ['כמה שאלות קצרות בערב, וכל יום נשמר כדף ביומן. ככה נראה דף כזה:',
    'Algumas perguntas curtas à noite, e cada dia fica guardado como uma página do teu diário. Uma página é assim:',
    'Algumas perguntas curtas à noite, e cada dia fica guardado como uma página do seu diário. Uma página é assim:'],
  ['{ex}: {n} חזרות. הטווח למטרה שבחרת הוא {lo} עד {hi}.',
    { one: '{ex}: uma repetição. O intervalo para o teu objetivo é de {lo} a {hi}.',
      other: '{ex}: {n} repetições. O intervalo para o teu objetivo é de {lo} a {hi}.' },
    { one: '{ex}: uma repetição. O intervalo para o seu objetivo é de {lo} a {hi}.',
      other: '{ex}: {n} repetições. O intervalo para o seu objetivo é de {lo} a {hi}.' }],
  ['לא רשימה. משפט אחד שיחכה לך בראש סיום היום, ושאפתח איתו את הסיכום הבא.',
    'Não é uma lista. Uma frase à tua espera no topo da noite, e por onde começo o próximo resumo.',
    'Não é uma lista. Uma frase esperando por você no topo da noite, e por onde começo o próximo resumo.'],

  // --- ti / contigo
  ['אימון שנבנה לך', 'Feito para ti', 'Feito para você'],
  ['דבר אחד לקחת איתך', 'Uma coisa para levar contigo', 'Uma coisa para levar com você'],
  ['אפנה אליכם בלשון רבים', 'Vou falar contigo no plural', 'Vou me dirigir a você no plural'],
  ['מה שכתבת לעצמך', 'O que escreveste para ti', 'O que você escreveu para si'],

  // --- tu verbs: present, preterite, future subjunctive, conditional
  ['או כתוב משפט משלך…', 'Ou escreve uma frase tua…', 'Ou escreva uma frase sua…'],
  ['איך הרגשת', 'Como te sentiste', 'Como você se sentiu'],
  ['הפירוק לא זמין כרגע. אפשר לחפש ידנית.',
    'A decomposição não está disponível agora. Podes procurar à mão.',
    'A decomposição não está disponível agora. Você pode buscar manualmente.'],
  ['יש עוד שאלות אם בא לך אחת. אפשר גם פשוט לסיים כאן.',
    'Há mais perguntas, se te apetecer alguma. Também podes simplesmente terminar aqui.',
    'Há mais perguntas, se você quiser. Também pode simplesmente terminar aqui.'],
  ['לא זיהיתי אוכל בתמונה. נסה מקרוב יותר, או כתוב מה אכלת.',
    'Não encontrei comida nessa foto. Tenta mais de perto, ou escreve o que comeste.',
    'Não encontrei comida nessa foto. Tente mais de perto, ou digite o que você comeu.'],
  ['תת-נושא הוא מה שעשית בתוך התחביב. הקשה על אחד מתחילה טיימר עליו.',
    'Um subtema é o que fazes dentro do passatempo. Tocar num deles inicia um cronómetro.',
    'Um subtema é o que você faz dentro do hobby. Tocar em um deles inicia um cronômetro.'],
  ['איפה אתה מתאמן', 'Onde treinas', 'Onde você treina'],
  ['כמה אתה מתאמן היום', 'Quanto treinas agora', 'Quanto você treina agora'],
  ['כמה זמן יש לך לאימון', 'Quanto tempo tens para um treino', 'Quanto tempo você tem para um treino'],
  ['כמה פעמים בשבוע אתה יכול להתאמן', 'Quantas vezes por semana podes treinar',
    'Quantas vezes por semana você pode treinar'],
  ['האפליקציה הזאת לא מחליפה רופא או פיזיותרפיסט. אם משהו כואב או שאתה לא בטוח — תשאל מישהו שמבין לפני שאתה מתחיל, ובזמן אימון תעצור על כאב חד או במפרק.',
    'Esta aplicação não substitui um médico nem um fisioterapeuta. Se algo doer ou não tiveres a certeza, pergunta a quem percebe antes de começares, e durante o treino para perante dor aguda ou numa articulação.',
    'Este app não substitui um médico nem um fisioterapeuta. Se algo doer ou você não tiver certeza, pergunte a quem entende antes de começar, e durante o treino pare diante de uma dor aguda ou numa articulação.'],
  ['יש משהו שכואב או מגביל לך את התנועה?', 'Há algo que doa ou te limite o movimento?',
    'Há algo que doa ou limite o seu movimento?'],
  ['לא כדי להסתיר תרגילים — כדי שיהיה רשום, ושתדע למה לשים לב.',
    'Não para esconder exercícios — para ficar registado e saberes ao que estar atento.',
    'Não para esconder exercícios — para ficar registrado e você saber no que prestar atenção.'],
  ['רשום, ולא מסתיר שום תרגיל. אם משהו ברשימה לא מתאים לך — תחליף אותו.',
    'Registado, e não esconde nenhum exercício. Se algo da lista não te servir, troca-o.',
    'Registrado, e não esconde nenhum exercício. Se algo da lista não servir para você, troque.'],
  ['אחרי שישה שבועות — שבוע הקלה, ואז ממשיכים. התוכנית מתחלפת כל 6–8 שבועות.',
    'Ao fim de seis semanas, uma semana mais leve e depois continuas. O plano muda a cada 6–8 semanas.',
    'Depois de seis semanas, uma semana mais leve, e aí você continua. O plano muda a cada 6–8 semanas.'],
  ['אפשר לשנות כל אחד מהם מתי שתרצה — או להתחיל אימון בלי תוכנית בכלל.',
    'Podes mudar qualquer um quando quiseres — ou treinar sem plano nenhum.',
    'Você pode mudar qualquer um quando quiser — ou treinar sem plano nenhum.'],
  ['כאן אתה בונה אימון, עוקב אחרי המשקלים ורואה את ההתקדמות לאורך זמן. כמה שאלות קצרות, ואתאים את זה אליך.',
    'Aqui montas um treino, acompanhas as cargas e vês a tua evolução ao longo do tempo. Umas perguntas curtas e ajusto isto a ti.',
    'Aqui você monta um treino, acompanha as cargas e vê sua evolução ao longo do tempo. Umas perguntas rápidas e eu ajusto tudo para você.'],
  ['רק משקל גוף: אפשר להתקדם, אבל העומס עולה בחזרות ובקושי התרגיל ולא במשקל — אז המעקב כאן נראה אחרת.',
    'Só peso do corpo: podes progredir, mas a carga sobe em repetições e dificuldade, não em peso — por isso o registo aqui é diferente.',
    'Só peso do corpo: você pode progredir, mas a carga sobe em repetições e dificuldade, não em peso — por isso o registro aqui é diferente.'],
  ['אפשר לבחור יותר מאחת. לפיהן אקבע את טווח החזרות, את המנוחה ואת הקפיצה במשקל.',
    'Podes escolher mais do que uma. A partir delas chego ao intervalo de repetições, ao descanso e ao salto de carga.',
    'Você pode escolher mais de uma. A partir delas chego ao intervalo de repetições, ao descanso e ao salto de carga.'],
  ['מה המטרה שלך?', 'O que queres alcançar?', 'O que você quer alcançar?'],
  ['התאמנת {n} פעמים בחמישה השבועות האחרונים.',
    { one: 'Treinaste uma vez nas últimas cinco semanas.', other: 'Treinaste {n} vezes nas últimas cinco semanas.' },
    { one: 'Você treinou uma vez nas últimas cinco semanas.', other: 'Você treinou {n} vezes nas últimas cinco semanas.' }],
  ['לא התאמנת בחמישה השבועות האחרונים.', 'Não treinaste nas últimas cinco semanas.',
    'Você não treinou nas últimas cinco semanas.'],
  ['התאמנת', 'Treinaste', 'Treinou'],
  ['אפשר לדלג. סבב אחד הוא מעבר אחד על כל הרשימה.',
    'Podes saltar isto. Uma ronda é uma passagem por toda a lista.',
    'Você pode pular isso. Uma rodada é uma passagem pela lista inteira.'],
  ['הגעת למכסה היומית של הצילומים.', 'Esgotaste as fotos de hoje.', 'Você já usou todas as fotos de hoje.'],
  ['יצא לך?', 'conseguiste?', 'conseguiu?'],
  ['לקחת לשבוע הזה', 'Levaste para esta semana', 'Você levou para esta semana'],
  ['מתוך מה שסימנת על השעון.', 'A partir das horas que marcaste no relógio.',
    'A partir das horas que você marcou no relógio.'],
  ['לא מצאתי תרגילים עם הציוד שסימנת', 'Não encontrei exercícios com o equipamento que marcaste',
    'Não encontrei exercícios com o equipamento que você marcou'],
  ['מה שסיפרת לי', 'O que me contaste', 'O que você me contou'],
  ['הסרטון עצמו לא נשמר — רק התמונה שתבחר.', 'O vídeo não fica guardado — só a imagem que escolheres.',
    'O vídeo não fica salvo — só a imagem que você escolher.'],
  ['היי {name}. מה תרצה לדעת?', 'Olá, {name}. O que gostarias de saber?', 'Olá, {name}. O que você gostaria de saber?'],
  ['היי. מה תרצה לדעת?', 'Olá. O que gostarias de saber?', 'Olá. O que você gostaria de saber?'],
  ['מה תרצה לדעת?', 'O que gostarias de saber?', 'O que você gostaria de saber?'],
  ['במה חשוב לך להתמקד?', 'Em que gostarias de te concentrar?', 'Em que você gostaria de se concentrar?'],
  ['יש לך שאלה על האפליקציה? לוחצים עליי כאן למעלה, ואני עונה.',
    'Tens uma pergunta sobre a app? Toca em mim aqui em cima e eu respondo.',
    'Tem uma pergunta sobre o app? Toque em mim aqui em cima e eu respondo.'],
  ['מתי תזכיר לי להתקשר?', 'Quando me lembras de ligar?', 'Quando você vai me lembrar de ligar?'],

  // --- tu imperatives -> você imperatives
  ['בחר שריר אחד לפחות', 'Escolhe pelo menos um músculo', 'Escolha pelo menos um músculo'],
  ['בחר את התמונה שתופיע בלוח השנה', 'Escolhe a imagem para o calendário', 'Escolha a imagem para o calendário'],
  ['אין כאן עדיין תחביב. הוסף את הראשון ונתחיל לספור.',
    'Ainda sem passatempos. Adiciona o primeiro e começamos a contar.',
    'Ainda sem hobbies. Adicione o primeiro e começamos a contar.'],
  ['הקלד משקל ואראה איך להרכיב', 'Escreve um peso e mostro como carregar',
    'Digite um peso e eu mostro como carregar a barra'],
  ['התמונה הזאת קטנה מדי ({n} פיקסלים) ותיראה מטושטשת. נסה את המקור.',
    'Esta foto é pequena demais ({n} píxeis) e vai ficar desfocada. Tenta a original.',
    'Esta foto é pequena demais ({n} pixels) e vai ficar desfocada. Tente a original.'],
  ['כדי לקבל תזכורת בטלפון, צריך להוסיף את האפליקציה למסך הבית.',
    'Para receber um lembrete no telefone, adiciona primeiro a app ao ecrã principal.',
    'Para receber um lembrete no telefone, adicione primeiro o app à tela inicial.'],
  ['ההתראות חסומות בהגדרות הטלפון. אפשר לאפשר אותן שם.',
    'As notificações estão bloqueadas nas definições do telefone. Podes permiti-las lá.',
    'As notificações estão bloqueadas nas configurações do telefone. Você pode permiti-las lá.'],
  ['פרק לי את זה', 'Divide isso para mim', 'Divida isso para mim'],
  ['קח את זה לשבוע הבא', 'Leva isto para a próxima semana', 'Leve isso para a próxima semana'],

  // --- enclitic -te / -me -> the pronoun first, as Brazil writes it
  ['שומן ומסה יחד: בעיקר בהתחלה, אחרי הפסקה, או כשיש מה להוריד. אחרת זה שלב אחרי שלב, ואגיד לך מתי להחליף.',
    'Gordura e músculo ao mesmo tempo: funciona sobretudo no início, depois de uma pausa, ou quando há o que perder. Caso contrário é uma fase de cada vez, e eu digo-te quando mudar.',
    'Gordura e músculo ao mesmo tempo: funciona sobretudo no início, depois de uma pausa, ou quando há o que perder. Caso contrário é uma fase de cada vez, e eu te digo quando mudar.'],
  ['שתיהן יחד — אפשרי. אגיד לך בהמלצה מה זה אומר.',
    'As duas ao mesmo tempo: é possível. Digo-te no plano o que isso significa.',
    'As duas ao mesmo tempo: é possível. Eu te digo no plano o que isso significa.'],
  ['להזכיר לך כל יום ב־{t}?', 'Lembro-te todos os dias às {t}?', 'Quer que eu te lembre todo dia às {t}?'],
  ['בנה לי תוכנית', 'Cria-me um plano', 'Crie um plano para mim'],
  ['בנה לי אחרת', 'Cria-me outro', 'Crie outro para mim'],
  ['לבנות לי תוכנית אישית', 'Cria-me um plano pessoal', 'Crie um plano pessoal para mim'],
  ['הראה לי את השאלות', 'Mostra-me as perguntas', 'Me mostre as perguntas'],
  ['אפשר לשאול אותי כל דבר על האפליקציה', 'Pergunta-me tudo sobre a app',
    'Me pergunte qualquer coisa sobre o app'],
  ['נשמע טוב', 'Parece-me bem', 'Parece bom'],
  ['להיראות ולהרגיש רזה יותר', 'Parecer e sentir-me mais seco', 'Parecer e me sentir mais seco'],

  // --- estar a + infinitive -> gerund
  ['מיפ חושב…', 'O Mip está a pensar…', 'O Mip está pensando…'],

  // --- European vocabulary
  ['אין עדיין מדידה של נתרן או סיבים במה שנרשם היום.',
    'Nada do que foi registado hoje traz uma medição de sódio ou de fibra.',
    'Nada do que foi registrado hoje traz uma medição de sódio ou de fibra.'],
  ['הוסף זמן ליום', 'Registar um dia anterior', 'Registrar um dia anterior'],
  ['רשום סט {n}', 'Registar série {n}', 'Registrar série {n}'],
  ['איך רושמים אימון?', 'Como registo um treino?', 'Como registro um treino?'],
  ['איך רושמים ארוחה?', 'Como registo uma refeição?', 'Como registro uma refeição?'],
  ['עוד לא נרשם כלום', 'ainda sem registos', 'ainda sem registros'],
  ['עוד לא רשמת אימון', 'Ainda sem treinos registados', 'Ainda sem treinos registrados'],
  ['להסיר את {name}? {n} סטים שנרשמו בו יימחקו.',
    { one: 'Remover {name}? A série registada também desaparece.',
      other: 'Remover {name}? As {n} séries registadas também desaparecem.' },
    { one: 'Remover {name}? A série registrada também desaparece.',
      other: 'Remover {name}? As {n} séries registradas também desaparecem.' }],
  ['יש אימון פעיל שכבר נרשמו בו סטים. להתחיל חדש במקומו?',
    'Há um treino a decorrer com séries já registadas. Começar um novo em vez disso?',
    'Há um treino em andamento com séries já registradas. Começar um novo em vez disso?'],
  ['כבר נרשמו סטים בתרגיל הזה. אפשר להסיר אותו, או להוסיף תרגיל חדש.',
    'Este exercício já tem séries registadas. Pode removê-lo, ou acrescentar um exercício novo.',
    'Este exercício já tem séries registradas. Pode removê-lo, ou acrescentar um exercício novo.'],
  ['יצירת קשר: {how}', 'Contacto: {how}', 'Contato: {how}'],
  ['גרעון מצטבר — {when}', 'Défice acumulado — {when}', 'Déficit acumulado — {when}'],
  ['התחביבים שלי', 'Os meus passatempos', 'Meus hobbies'],
  ['סטופר', 'Cronómetro', 'Cronômetro'],
  ['סטופר וטיימרים', 'Cronómetro e temporizadores', 'Cronômetro e temporizadores'],
  ['סבבים', 'Rondas', 'Rodadas'],
  ['סבב {n} מתוך {total}', 'Ronda {n} de {total}', 'Rodada {n} de {total}'],
  ['מה עושים בכל סבב', 'O que entra em cada ronda', 'O que entra em cada rodada'],
  ['בלוק אחד ארוך: כמה סבבים שתספיק בתוכו.',
    'Um bloco longo: tantas rondas quantas couberem lá dentro.',
    'Um bloco longo: quantas rodadas couberem dentro dele.'],
  ['עבודה, מנוחה, מספר סבבים — מה שתגדיר.',
    'Trabalho, descanso, número de rondas — como definir.',
    'Trabalho, descanso, número de rodadas — do jeito que você definir.'],
  ['יותר מסבב אחד — כל הרשימה תחזור על עצמה מההתחלה.',
    'Mais do que uma ronda: a lista inteira repete-se desde o início.',
    'Mais de uma rodada: a lista inteira se repete desde o início.'],
  ['אפשר לדלג על שאלה?', 'Posso saltar uma pergunta?', 'Posso pular uma pergunta?'],

  // --- saving data is "salvar" in Brazil; "guardar" stays where it means keep
  ['שמור את התוכנית', 'Guardar o plano', 'Salvar o plano'],
  ['שמור כתמונת היום', 'Guardar como imagem do dia', 'Salvar como imagem do dia'],
  ['לשמור ברגעים של היום?', 'Guardar como um momento de hoje?', 'Salvar como um momento de hoje?'],
  ['לשמור ברגעים של היום', 'Guardar como um momento de hoje', 'Salvar como um momento de hoje'],
  ['נשמר גם לפעם הבאה', 'Guardado também para a próxima vez', 'Salvo também para a próxima vez'],
  ['לאימון הזה בלבד - הוא לא נשמר כתבנית', 'Apenas para este treino — não está guardado como rotina',
    'Apenas para este treino — não fica salvo como rotina'],
  ['איפה התשובות שלי נשמרות?', 'Onde ficam guardadas as minhas respostas?', 'Onde ficam salvas minhas respostas?'],
  ['נשמר רק בטלפון שלך. לא נשמר בגיבוי ולא משותף עם אף אחד.',
    'Guardado só no seu celular. Não vai no backup nem é compartilhado com ninguém.',
    'Salvo só no seu celular. Não vai no backup nem é compartilhado com ninguém.'],
];

const holes = v => JSON.stringify((typeof v === 'string' ? [v] : Object.values(v))
  .map(s => (s.match(/\{[^}]+\}/g) || []).sort()));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const pt = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let changed = 0, already = 0;
const problems = [];
const seen = new Set();
for (const [key, oldV, newV] of CHANGES) {
  if (seen.has(key)) { problems.push('listed twice: ' + key); continue; }
  seen.add(key);
  if (!(key in pt)) { problems.push('no such key: ' + key); continue; }
  const cur = pt[key];
  if (same(cur, newV)) { already++; continue; }
  if (!same(cur, oldV)) { problems.push('changed since: ' + key + '\n    now:  ' + JSON.stringify(cur)); continue; }
  if (typeof oldV !== typeof newV || (typeof oldV === 'object' && !same(Object.keys(oldV), Object.keys(newV)))) {
    problems.push('shape differs: ' + key); continue;
  }
  if (holes(oldV) !== holes(newV)) { problems.push('placeholders differ: ' + key); continue; }
  if (LIST) {
    console.log(key + '\n  - ' + JSON.stringify(oldV) + '\n  + ' + JSON.stringify(newV));
  }
  pt[key] = newV;
  changed++;
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
if (!LIST && changed) fs.writeFileSync(FILE, JSON.stringify(pt, null, 2) + '\n');
console.log((LIST ? 'would change ' : 'changed ') + changed + ' values' + (already ? ', ' + already + ' already done' : ''));
