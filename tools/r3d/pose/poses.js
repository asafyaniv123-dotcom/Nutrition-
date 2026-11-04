// The keyframes, as arithmetic. Metres, y up; x runs along the body (feet toward +x),
// z is left (+) / right (-). Limb lengths stay the same between a pair of keyframes -
// only joints turn - so the two stills are one body. Every number traces to the research
// in research_notes/טכניקה נכונה לעשרה תרגילים - סבב 3/.
const L = { upper: 0.30, fore: 0.27, thigh: 0.475, shin: 0.40 };
const rad = (d) => d * Math.PI / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const side = (p, s) => [p[0], p[1], p[2] * s];           // mirror a left joint to the right

/* lying on a flat bench, head toward -x: the trunk and legs of both bench keyframes */
function supine() {
  const J = { head: [-0.72, 0.57, 0], neck: [-0.59, 0.56, 0], chest: [-0.42, 0.57, 0], pelvis: [0.03, 0.55, 0],
    lsh: [-0.48, 0.56, 0.19], lhip: [0.05, 0.55, 0.10], lkn: [0.47, 0.50, 0.14], lan: [0.42, 0.09, 0.16], ltoe: [0.58, 0.03, 0.17] };
  for (const k of ['sh', 'hip', 'kn', 'an', 'toe']) J['r' + k] = side(J['l' + k], -1);
  return J;
}
const BENCH = [{ box: [-0.25, 0.42, 0], size: [1.2, 0.06, 0.30] }, { box: [-0.75, 0.2, 0], size: [0.06, 0.4, 0.26] }, { box: [0.25, 0.2, 0], size: [0.06, 0.4, 0.26] }];

export const POSES = {
  /* x2, dumbbell bench press. ExRx: dumbbells to the sides of the chest with the forearm
     under each; NSCA (Graham 2000): beside the chest at nipple level; research: elbows
     45-60 degrees from the torso, slightly below the bench line, forearms vertical. */
  bench: {
    name: 'לחיצת חזה במשקולות', kfNames: ['למעלה', 'למטה'],
    camera: { pos: [2.1, 2.0, 2.5], at: [-0.15, 0.55, 0], fov: 33 },
    measures: [
      { label: 'זרוע עליונה מהגו', at: ['lel', 'lsh', 'lhip'] },
      { label: 'אמה מהאנך', tilt: ['lel', 'lwr'] },
    ],
    keyframes: [
      () => {  // top: arms vertical, each dumbbell straight over its shoulder, handles across
        const J = supine();
        for (const s of [1, -1]) {
          const sh = side(J.lsh, s), el = add(sh, [0, 1, 0], L.upper), wr = add(el, [0, 1, 0], L.fore);
          J[(s > 0 ? 'l' : 'r') + 'el'] = el; J[(s > 0 ? 'l' : 'r') + 'wr'] = wr;
        }
        return { joints: J, props: BENCH.concat([1, -1].map((s) => ({ dumbbell: add(side(J.lwr, s), [0, 0.04, 0]), axis: [0, 0, 1], len: 0.32 }))) };
      },
      () => {  // bottom: upper arm 40 degrees from the trunk in the bench plane, dropped 15 cm
        const J = supine(), th = rad(40), drop = 0.5, flat = Math.sqrt(1 - drop * drop);
        for (const s of [1, -1]) {
          const sh = side(J.lsh, s), d = [Math.cos(th) * flat, -drop, s * Math.sin(th) * flat];
          const el = add(sh, d, L.upper), wr = add(el, [0, 1, 0], L.fore);
          J[(s > 0 ? 'l' : 'r') + 'el'] = el; J[(s > 0 ? 'l' : 'r') + 'wr'] = wr;
        }
        return { joints: J, props: BENCH.concat([1, -1].map((s) => ({ dumbbell: add(side(J.lwr, s), [0, 0.04, 0]), axis: [0, 0, 1], len: 0.32 }))) };
      },
    ],
  },

  /* x159, barbell hip thrust. ExRx: bench 40-46 cm, torso about 45 degrees at the bottom,
     extend the hips until straight, torso rigid. Research: upper back on the bench edge
     just below the shoulder blades; at the top shoulder, hip and knee in one line and
     the shins vertical; buttocks just off the floor at the bottom. */
  hipthrust: {
    name: "היפ ת'ראסט", kfNames: ['למטה', 'למעלה'],
    camera: { pos: [0.12, 0.6, 4.2], at: [0.12, 0.33, 0], fov: 30 },
    measures: [
      { label: 'כתף-אגן-ברך (מהצד)', at: ['lsh', 'lhip', 'lkn'], side: true },
      { label: 'גו מהאופק', horiz: ['lsh', 'lhip'] },
      { label: 'שוק מהאנך', tilt: ['lkn', 'lan'] },
      { label: 'ברך (מהצד)', at: ['lhip', 'lkn', 'lan'], side: true },
    ],
    keyframes: [
      () => {  // bottom
        const J = { lsh: [-0.30, 0.42, 0.19], lhip: [0.0, 0.17, 0.10], lkn: [0.37, 0.45, 0.13], lan: [0.565, 0.09, 0.14], ltoe: [0.72, 0.03, 0.15],
          chest: [-0.20, 0.34, 0], pelvis: [0.0, 0.17, 0], neck: [-0.36, 0.50, 0], head: [-0.40, 0.61, 0] };
        for (const k of ['sh', 'hip', 'kn', 'an', 'toe']) J['r' + k] = side(J['l' + k], -1);
        const bar = [0.05, 0.29, 0];
        for (const s of [1, -1]) { const p = s > 0 ? 'l' : 'r'; J[p + 'wr'] = [bar[0], bar[1] + 0.03, 0.27 * s]; J[p + 'el'] = [-0.10, 0.36, 0.30 * s]; }
        return { joints: J, props: [{ box: [-0.45, 0.215, 0], size: [0.30, 0.43, 1.2] }, { barbell: bar, len: 1.9, plateR: 0.225 }] };
      },
      () => {  // top: full extension, shins vertical
        const J = { lsh: [-0.30, 0.42, 0.19], lhip: [0.09, 0.452, 0.10], lkn: [0.565, 0.49, 0.13], lan: [0.565, 0.09, 0.14], ltoe: [0.72, 0.03, 0.15],
          chest: [-0.12, 0.435, 0], pelvis: [0.09, 0.452, 0], neck: [-0.40, 0.46, 0], head: [-0.47, 0.55, 0] };
        for (const k of ['sh', 'hip', 'kn', 'an', 'toe']) J['r' + k] = side(J['l' + k], -1);
        const bar = [0.14, 0.57, 0];
        for (const s of [1, -1]) { const p = s > 0 ? 'l' : 'r'; J[p + 'wr'] = [bar[0], bar[1] + 0.03, 0.27 * s]; J[p + 'el'] = [-0.05, 0.62, 0.30 * s]; }
        return { joints: J, props: [{ box: [-0.45, 0.215, 0], size: [0.30, 0.43, 1.2] }, { barbell: bar, len: 1.9, plateR: 0.225 }] };
      },
    ],
  },
};
