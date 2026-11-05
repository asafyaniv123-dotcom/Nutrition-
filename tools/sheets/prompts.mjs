// The three prompts of one exercise, built from its research file - so 200 exercises get the
// wording that was proven on round 3, not 200 hand-written variations (5 Nov).
// node tools/sheets/prompts.mjs <research.json>   -> prints JSON {start, end, video}
//
// What each line is there for, learned on round 3:
//  - the end of the range is stated as numbers, or the model stops halfway (leg curl: 84 -> 52)
//  - "shaped like the real muscle, never a flat oval patch", or the glow comes out as stickers
//  - "exactly two arms/legs", "proportions of the start image", or a limb swells or doubles
//  - "first frame exactly the start image", "EXACTLY ONE repetition", or it squats or does two reps
import fs from 'fs';
const R = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const lib = JSON.parse(fs.readFileSync(new URL('../../data/exercises.json', import.meta.url), 'utf8')).exercises.find((e) => e.id === R.id);
const MUSCLE = { 'חזה': 'chest', 'כתפיים': 'shoulders (deltoids)', 'גב רחב': 'lats', 'גב': 'upper and middle back', 'טרפז': 'trapezius', 'גב תחתון': 'lower back', 'יד קדמית': 'biceps', 'יד אחורית': 'triceps', 'אמה': 'forearms', 'ארבע ראשי': 'quadriceps (front of the thighs)', 'ירך אחורית': 'hamstrings (back of the thighs)', 'ישבן': 'glutes', 'מקרבים': 'inner thighs (adductors)', 'מרחיקים': 'outer hips (abductors)', 'תאומים': 'calves', 'בטן': 'abdominals', 'אלכסונים': 'obliques', 'אירובי': null };
const glowOf = (lib.m || []).map((m) => MUSCLE[m]).filter(Boolean);
const glow = glowOf.length ? `The ${glowOf.join(' and ')} ${glowOf.length > 1 || /s$/.test(glowOf[0].split(' (')[0]) ? 'glow' : 'glows'} noticeably brighter, a warm pale-gold light from inside, shaped like the real muscle and fading softly into the body - never a flat oval patch; the rest of the body stays amber.` : 'The whole figure glows evenly; no single muscle is highlighted.';
const GEAR = { 'משקולות יד': 'dumbbells', 'מוט': 'barbell', 'מוט EZ': 'EZ bar', 'ספסל': 'bench', 'מכונה': 'machine', 'פולי': 'cable machine', 'משקל גוף': 'bodyweight', 'מזרן': 'mat', 'גומייה': 'resistance band', 'מתח': 'pull-up bar', 'פלטה': 'weight plate', 'סמית׳': 'Smith machine', 'קטלבל': 'kettlebell', 'מדרגה': 'step', 'מכשיר אירובי': 'cardio machine', 'רצועות TRX': 'TRX straps', 'מוט טרפז': 'trap bar', 'מזחלת': 'sled', 'חבל קרב': 'battle rope' };
const gear = (lib.q || []).map((g) => GEAR[g] || g).join(' + ') || 'bodyweight';
const cam = String(R.camera.view_en || R.camera.view).replace(/[.\s]+$/, '');
const STYLE ='Image 1 is the STYLE: a softly glowing amber-orange athletic man made of warm light, on a warm dark brown ground, gentle rim glow.';
const start = `${STYLE} Draw that man doing the ${lib.en} (${gear}), at the START of one repetition. Camera: ${cam}. ${String(R.drawing).split(/\bEND:/)[0].trim()} Show ONLY this start position. The man has exactly two arms and two legs with natural human proportions. ${glow} Equipment is real and clean, in dark warm metal matching image 1. No text, no labels, no numbers.`;
const end = `Make the SAME image as image 1 - same man, glow, equipment, camera, lighting, background - with ONE change: the END of the full range of motion. ${(String(R.drawing).match(/\bEND:[\s\S]*/) || [R.drawing])[0].trim()} Show this END position. Everything the exercise keeps still stays exactly where it is in image 1. The man has exactly two arms and two legs and keeps the proportions of image 1. ${glow} No text.`;
const video = `Static camera, no camera movement, no cuts. The first frame is exactly the start image and the last frame is exactly the end image. EXACTLY ONE slow, controlled repetition of the ${lib.en} filling the 4 seconds, in one continuous movement from the start position to the end position. The movement is slow: it takes the whole 4 seconds to travel from start to end once, never reverses, never repeats, and ends on the end image. What must not move: ${String(R.still_en || R.still).replace(/[.\s]+$/, '')}. The body keeps exactly the proportions of the start image in every frame - no limb grows, swells, doubles or changes shape. ${glowOf.length ? 'The glow on the ' + glowOf.join(' and ') + ' brightens gently at the end of the movement.' : ''} No text.`;
console.log(JSON.stringify({ id: R.id, start, end, video }, null, 1));
