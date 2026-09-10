/* Every exercise's name in the other nine languages.
 *
 * Keyed by the English name, which build-exercises.mjs already carries and
 * guarantees unique. Hebrew lives in the list itself as the STORED id, English
 * is the pivot the rest are written from, and these are the other nine.
 *
 * The register is the one used in a gym, not a dictionary's: German lifters say
 * Bankdrücken and Kniebeuge; Japanese uses katakana for the imported movements
 * (ベンチプレス) and its own words for the native ones (腕立て伏せ, 懸垂);
 * Chinese says 卧推 and 深蹲. Where a language has simply adopted the English -
 * Dips, Burpees, Thruster in half of Europe - that is what it says, and
 * inventing a local word would make the row harder to find rather than easier.
 *
 * These are searched as well as displayed, so a German typing Kniebeuge or a
 * Japanese typing スクワット reaches the squat. Split across three files only
 * because one list of 228 is unwieldy to edit; the split has no meaning.
 */
import { PART1 } from './exercise-names-1.mjs';
import { PART2 } from './exercise-names-2.mjs';
import { PART3 } from './exercise-names-3.mjs';

/* A name appearing in two parts would silently take whichever loaded last, so
   the merge refuses rather than picking. */
export const NAMES = {};
for (const [part, obj] of [['1', PART1], ['2', PART2], ['3', PART3]]) {
  for (const [k, v] of Object.entries(obj)) {
    if (NAMES[k]) throw new Error('"' + k + '" is in two name parts (part ' + part + ')');
    NAMES[k] = v;
  }
}
