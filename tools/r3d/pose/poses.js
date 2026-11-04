// The keyframes, as arithmetic. Metres, y up; x runs along the body (feet toward +x),
// z is left (+) / right (-). Limb lengths stay the same between a pair of keyframes -
// only joints turn - so the two stills are one body. Every number traces to the research
// in research_notes/טכניקה נכונה לעשרה תרגילים - סבב 3/, and each exercise's `spec` is that
// research as checks, run against the mannequin on every render (see poses-more.js).
import { MORE, L, rad, add, twoBone, mirror } from './poses-more.js';
const side = (p, s) => [p[0], p[1], p[2] * s];           // mirror a left joint to the right

/* lying on a flat bench, head toward -x: the trunk and legs of both bench keyframes */
function supine() {
  const J = { head: [-0.72, 0.57, 0], neck: [-0.59, 0.56, 0], chest: [-0.42, 0.57, 0], pelvis: [0.03, 0.55, 0],
    lsh: [-0.48, 0.56, 0.19], lhip: [0.05, 0.55, 0.10], lan: [0.42, 0.09, 0.16], ltoe: [0.58, 0.03, 0.17], lheel: [0.37, 0.04, 0.16],
    benchTop: [0, 0.45, 0] };
  J.lkn = twoBone(J.lhip, J.lan, L.thigh, L.shin, [1, 0.4, 0]);
  return mirror(J);
}
const BENCH = [{ box: [-0.25, 0.42, 0], size: [1.2, 0.06, 0.30] }, { box: [-0.75, 0.2, 0], size: [0.06, 0.4, 0.26] }, { box: [0.25, 0.2, 0], size: [0.06, 0.4, 0.26] }];

export const POSES = {
  bench: {
    name: 'לחיצת חזה במשקולות', kfNames: ['למעלה', 'למטה'],
    camera: { pos: [2.1, 2.0, 2.5], at: [-0.15, 0.55, 0], fov: 33 },
    measures: [
      { label: 'זרוע עליונה מהגו', at: ['lel', 'lsh', 'lhip'] },
      { label: 'אמה מהאנך', tilt: ['lel', 'lwr'] },
    ],
    spec: [
      { kf: 'both', text: 'ספסל שטוח בגובה 43–45 ס"מ', src: 'מחקר x2, הציוד', m: { dy: ['benchTop', 'floor'] }, min: 43, max: 46 },
      { kf: 'both', text: 'ברכיים בערך 90°', src: 'מחקר x2, הגוף', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 75, max: 105 },
      { kf: 'both', text: 'כפות הרגליים שטוחות, מעט מאחורי הברכיים', src: 'מחקר x2, הגוף', m: { dx: ['lkn', 'lan'] }, min: 1, max: 15 },
      { kf: 0, text: 'כל משקולת ישר מעל מפרק הכתף', src: 'מחקר x2, התחלה', m: { dx: ['lwr', 'lsh'] }, min: -3, max: 3 },
      { kf: 0, text: 'הזרועות ישרות ואנכיות', src: 'מחקר x2, התחלה', m: { tilt: ['lsh', 'lwr'] }, min: 0, max: 4 },
      { kf: 1, text: 'מרפק 45°–60° מהגו', src: 'מחקר x2; NSCA', m: { at: ['lel', 'lsh', 'lhip'] }, min: 45, max: 60 },
      { kf: 1, text: 'אמה אנכית, שורש היד מעל המרפק', src: 'ExRx ("bent arm under each dumbbell"); מחקר x2', m: { tilt: ['lel', 'lwr'] }, min: 0, max: 5 },
      { kf: 1, text: 'המרפק מעט מתחת לקו הספסל', src: 'מחקר x2, נקודת המפנה', m: { dy: ['lel', 'benchTop'] }, min: -10, max: -1 },
      { kf: 1, text: 'המשקולת בצד החזה בקו הפטמות', src: 'NSCA ("even with nipple level")', m: { dx: ['lwr', 'lsh'] }, min: 8, max: 22 },
    ],
    keyframes: [
      () => {  // top: arms vertical, each dumbbell straight over its shoulder, handles across
        const J = supine(); J.floor = [0, 0, 0];
        for (const s of [1, -1]) {
          const sh = side(J.lsh, s), el = add(sh, [0, 1, 0], L.upper), wr = add(el, [0, 1, 0], L.fore);
          J[(s > 0 ? 'l' : 'r') + 'el'] = el; J[(s > 0 ? 'l' : 'r') + 'wr'] = wr;
        }
        return { joints: J, props: BENCH.concat([1, -1].map((s) => ({ dumbbell: add(side(J.lwr, s), [0, 0.04, 0]), axis: [0, 0, 1], len: 0.32 }))) };
      },
      () => {  // bottom: upper arm 40 degrees from the trunk in the bench plane, dropped 15 cm
        const J = supine(), th = rad(40), drop = 0.5, flat = Math.sqrt(1 - drop * drop); J.floor = [0, 0, 0];
        for (const s of [1, -1]) {
          const sh = side(J.lsh, s), d = [Math.cos(th) * flat, -drop, s * Math.sin(th) * flat];
          const el = add(sh, d, L.upper), wr = add(el, [0, 1, 0], L.fore);
          J[(s > 0 ? 'l' : 'r') + 'el'] = el; J[(s > 0 ? 'l' : 'r') + 'wr'] = wr;
        }
        return { joints: J, props: BENCH.concat([1, -1].map((s) => ({ dumbbell: add(side(J.lwr, s), [0, 0.04, 0]), axis: [0, 0, 1], len: 0.32 }))) };
      },
    ],
  },

  /* x159, barbell hip thrust. The trunk is a real trunk now (0.50 m shoulder to hip, as in
     every other mannequin - it was 0.39). The shoulders pivot on the bench edge and the feet
     do not move, so with vertical shins at the top the bottom knee comes out near 75
     degrees: the research's "about 110 at the bottom" cannot hold at the same time, and
     the spec says so rather than hiding it. */
  hipthrust: {
    name: "היפ ת'ראסט", kfNames: ['למטה', 'למעלה'],
    camera: { pos: [0.25, 0.6, 4.4], at: [0.25, 0.33, 0], fov: 30 },
    measures: [
      { label: 'כתף-אגן-ברך (מהצד)', at: ['lsh', 'lhip', 'lkn'], side: true },
      { label: 'גו מהאופק', horiz: ['chest', 'pelvis'] },
      { label: 'שוק מהאנך', tilt: ['lkn', 'lan'] },
      { label: 'ברך (מהצד)', at: ['lhip', 'lkn', 'lan'], side: true },
    ],
    spec: [
      { kf: 'both', text: 'ספסל בגובה 40–46 ס"מ', src: 'ExRx; מחקר x159', m: { dy: ['benchTop', 'floor'] }, min: 40, max: 46 },
      { kf: 'both', text: 'הגב העליון על קצה הספסל', src: 'מחקר x159', m: { dy: ['lsh', 'benchTop'] }, min: -4, max: 4 },
      { kf: 0, text: 'בתחתית הגו בכ־30°–45° מהאופק', src: 'מחקר x159 (30°–35°); ExRx (כ־45°)', m: { horiz: ['chest', 'pelvis'] }, min: 30, max: 45 },
      { kf: 0, text: 'הישבן ממש מעל הרצפה', src: 'מחקר x159, התחלה', m: { dy: ['pelvis', 'floor'] }, min: 12, max: 22 },
      { kf: 0, text: 'בתחתית הברך בכ־110°', src: 'מחקר x159, טבלת זמנים', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 100, max: 120 },
      { kf: 1, text: 'כתף, אגן וברך בקו ישר', src: 'הספרייה; ExRx ("until straight")', m: { at: ['lsh', 'lhip', 'lkn'], side: true }, min: 175, max: 180 },
      { kf: 1, text: 'השוק אנכית למעלה', src: 'הספרייה; מחקר x159', m: { tilt: ['lkn', 'lan'] }, min: 0, max: 4 },
    ],
    keyframes: [0, 1].map((top) => () => {
      const sh = [-0.30, 0.42], an = [0.673, 0.09], T = 0.50;
      /* the top: shoulder-hip-knee one straight line, shin vertical over the ankle */
      const slope = Math.atan2((an[1] + L.shin) - sh[1], an[0] - sh[0]);
      const hip = top ? [sh[0] + T * Math.cos(slope), sh[1] + T * Math.sin(slope)] : [sh[0] + Math.sqrt(T * T - (sh[1] - 0.17) ** 2), 0.17];
      const J = { lsh: [sh[0], sh[1], 0.19], lhip: [hip[0], hip[1], 0.10], lan: [an[0], an[1], 0.14], ltoe: [an[0] + 0.15, 0.03, 0.15], lheel: [an[0] - 0.05, 0.04, 0.14],
        pelvis: [hip[0], hip[1], 0], benchTop: [-0.45, 0.43, 0], floor: [0, 0, 0] };
      J.lkn = twoBone(J.lhip, J.lan, L.thigh, L.shin, [0.3, 1, 0]);
      const dir = [hip[0] - sh[0], hip[1] - sh[1]], dl = Math.hypot(dir[0], dir[1]), u = [dir[0] / dl, dir[1] / dl];
      J.chest = [sh[0] + u[0] * 0.18, sh[1] + u[1] * 0.18, 0];
      J.neck = [sh[0] - u[0] * 0.08 + 0.0, sh[1] - u[1] * 0.08 + 0.05, 0]; J.head = [J.neck[0] - u[0] * 0.10, J.neck[1] - u[1] * 0.10 + 0.08, 0];
      mirror(J);
      const bar = [hip[0] + 0.05, hip[1] + 0.12, 0];
      for (const s of [1, -1]) { const p = s > 0 ? 'l' : 'r'; J[p + 'wr'] = [bar[0], bar[1] + 0.03, 0.27 * s]; J[p + 'el'] = twoBone([sh[0], sh[1], 0.19 * s], J[p + 'wr'], L.upper, L.fore, [0, 1, 0.3 * s]); }
      return { joints: J, props: [{ box: [-0.45, 0.215, 0], size: [0.30, 0.43, 1.2] }, { barbell: bar, len: 1.9, plateR: 0.225 }] };
    }),
  },
};

// the other eight exercises of round 3
Object.assign(POSES, MORE);
