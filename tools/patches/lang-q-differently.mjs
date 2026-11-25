// מה היית משנה (25 Nov): "what would change?" and its four answers, in every language. Each answer is the
// speaker's own past act, so no language needs a gendered form. usage: node tools/patches/lang-q-differently.mjs
import fs from 'node:fs';
const T = {
  'מה היה משתנה?': { en: 'What would change?', de: 'Was wäre anders?', es: '¿Qué cambiaría?', ja: '変えたいのはどこ？', fr: "Qu'est-ce qui changerait ?", it: 'Cosa cambierebbe?', pt: 'O que mudaria?', 'zh-Hans': '想改变的是什么？', 'zh-Hant': '想改變的是什麼？', ar: 'ما الذي سيتغيّر؟' },
  'מה שאמרתי': { en: 'What I said', de: 'Was ich gesagt habe', es: 'Lo que dije', ja: '言ったこと', fr: "Ce que j'ai dit", it: 'Quello che ho detto', pt: 'O que eu disse', 'zh-Hans': '我说的话', 'zh-Hant': '我說的話', ar: 'ما قلته' },
  'מה שעשיתי': { en: 'What I did', de: 'Was ich getan habe', es: 'Lo que hice', ja: 'したこと', fr: "Ce que j'ai fait", it: 'Quello che ho fatto', pt: 'O que eu fiz', 'zh-Hans': '我做的事', 'zh-Hant': '我做的事', ar: 'ما فعلته' },
  'איך הגבתי': { en: 'How I reacted', de: 'Wie ich reagiert habe', es: 'Cómo reaccioné', ja: '反応のしかた', fr: 'Ma réaction', it: 'Come ho reagito', pt: 'Como eu reagi', 'zh-Hans': '我的反应', 'zh-Hant': '我的反應', ar: 'كيف تفاعلت' },
  'מה שבחרתי': { en: 'What I chose', de: 'Was ich gewählt habe', es: 'Lo que elegí', ja: '選んだこと', fr: "Ce que j'ai choisi", it: 'Quello che ho scelto', pt: 'O que eu escolhi', 'zh-Hans': '我的选择', 'zh-Hant': '我的選擇', ar: 'ما اخترته' },
};
const L = ['en', 'de', 'es', 'ja', 'fr', 'it', 'pt', 'zh-Hans', 'zh-Hant', 'ar'];
for (const l of L) {
  const f = 'data/lang/' + l + '.json', j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const k in T) { if (!T[k][l]) throw new Error(l + ' ' + k); j[k] = T[k][l]; }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
}
console.log('answered', Object.keys(T).length, 'keys in', L.length);
