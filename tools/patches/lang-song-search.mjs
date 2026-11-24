// the six strings of rf-song-search.mjs, in every language and both Hebrew forms. English first, written as the
// original: the song step is now a search box with a list of songs under it.
import fs from 'node:fs';
const T = {
  'חפש שיר או אמן': { en: 'Search for a song or artist', de: 'Song oder Künstler suchen', es: 'Busca una canción o un artista',
    ja: '曲名かアーティストで検索', fr: 'Cherche une chanson ou un artiste', it: 'Cerca una canzone o un artista',
    pt: 'Busque uma música ou um artista', 'zh-Hans': '搜索歌曲或歌手', 'zh-Hant': '搜尋歌曲或歌手', ar: 'ابحث عن أغنية أو فنان' },
  'לא מצאת? אפשר לכתוב בעצמך': { en: 'Can’t find it? Type it in yourself', de: 'Nicht gefunden? Schreib ihn selbst',
    es: '¿No la encuentras? Escríbela tú', ja: '見つからない？自分で入力する', fr: 'Introuvable ? Écris-la toi-même',
    it: 'Non la trovi? Scrivila tu', pt: 'Não encontrou? Escreva você mesmo', 'zh-Hans': '找不到？自己输入',
    'zh-Hant': '找不到？自己輸入', ar: 'لم تجدها؟ اكتبها بنفسك' },
  'חזרה לחיפוש': { en: 'Back to search', de: 'Zurück zur Suche', es: 'Volver a buscar', ja: '検索に戻る', fr: 'Retour à la recherche',
    it: 'Torna alla ricerca', pt: 'Voltar à busca', 'zh-Hans': '返回搜索', 'zh-Hant': '返回搜尋', ar: 'العودة إلى البحث' },
  'החלף שיר': { en: 'Change song', de: 'Anderen Song wählen', es: 'Cambiar canción', ja: '曲を変える', fr: 'Changer de chanson',
    it: 'Cambia canzone', pt: 'Trocar música', 'zh-Hans': '换一首', 'zh-Hant': '換一首', ar: 'تغيير الأغنية' },
  'החיפוש לא זמין כרגע': { en: 'Search isn’t available right now', de: 'Die Suche ist gerade nicht verfügbar',
    es: 'La búsqueda no está disponible ahora', ja: '今は検索できません', fr: 'La recherche n’est pas disponible pour le moment',
    it: 'La ricerca non è disponibile ora', pt: 'A busca não está disponível agora', 'zh-Hans': '暂时无法搜索',
    'zh-Hant': '暫時無法搜尋', ar: 'البحث غير متاح الآن' },
  'לא נמצאו שירים': { en: 'No songs found', de: 'Keine Songs gefunden', es: 'No se encontraron canciones', ja: '曲が見つかりません',
    fr: 'Aucune chanson trouvée', it: 'Nessuna canzone trovata', pt: 'Nenhuma música encontrada', 'zh-Hans': '没有找到歌曲',
    'zh-Hant': '沒有找到歌曲', ar: 'لم يتم العثور على أغانٍ' },
};
const F = { 'חפש שיר או אמן': 'חפשי שיר או אמן', 'החלף שיר': 'החליפי שיר' };
const X = { 'חפש שיר או אמן': 'חפשו שיר או אמן', 'החלף שיר': 'החליפו שיר', 'לא מצאת? אפשר לכתוב בעצמך': 'לא מצאתם? אפשר לכתוב בעצמכם' };
const langs = Object.keys(Object.values(T)[0]);
for (const l of langs) { const f = `data/lang/${l}.json`, j = JSON.parse(fs.readFileSync(f, 'utf8')); for (const k in T) j[k] = T[k][l]; fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n'); }
for (const [file, M] of [['data/he-f.json', F], ['data/he-x.json', X]]) { const j = JSON.parse(fs.readFileSync(file, 'utf8')); Object.assign(j, M); fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n'); }
console.log('ok');
