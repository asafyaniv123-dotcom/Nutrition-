// The other eight keyframe pairs of round 3, from the research in
// research_notes/טכניקה נכונה לעשרה תרגילים - סבב 3/. Same conventions as poses.js:
// metres, y up, x forward along the body, z left (+) / right (-); limb lengths shared
// between the two keyframes of an exercise.
const L = { upper: 0.30, fore: 0.27, thigh: 0.475, shin: 0.40, trunk: 0.53 };
const rad = (d) => d * Math.PI / 180;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a) => { const n = Math.hypot(a[0], a[1], a[2]); return [a[0] / n, a[1] / n, a[2] / n]; };
const mirror = (J) => { for (const k of Object.keys(J)) if (k[0] === 'l' && J['r' + k.slice(1)] === undefined) J['r' + k.slice(1)] = [J[k][0], J[k][1], -J[k][2]]; return J; };
/* a straight-ish arm from a shoulder to a hand, the elbow bent `bend` degrees, bowing `out` */
function arm(sh, wr, out) {
  const mid = [(sh[0] + wr[0]) / 2, (sh[1] + wr[1]) / 2, (sh[2] + wr[2]) / 2];
  const half = Math.hypot(wr[0] - sh[0], wr[1] - sh[1], wr[2] - sh[2]) / 2;
  const k = Math.sqrt(Math.max(0, ((L.upper + L.fore) / 2) ** 2 - half ** 2));
  return add(mid, norm(out), k);
}
/* a standing body facing +x, ankles at ankleY, with its trunk and head */
function standing(ankleY, footZ) {
  const J = { lan: [0, ankleY, footZ], ltoe: [0.17, ankleY - 0.05, footZ + 0.02], lheel: [-0.06, ankleY - 0.05, footZ] };
  J.lkn = add(J.lan, [0, L.shin, 0]); J.lhip = add(J.lkn, [0, L.thigh, 0.10 - footZ]);
  J.pelvis = [0, J.lhip[1], 0]; J.chest = [0, J.pelvis[1] + 0.32, 0]; J.lsh = [0, J.pelvis[1] + L.trunk, 0.19];
  J.neck = [0, J.lsh[1] + 0.08, 0]; J.head = [0.01, J.lsh[1] + 0.21, 0];
  return J;
}

export const MORE = {
  /* x4, incline dumbbell press: backrest 30 degrees (the library and Rodriguez-Ridao 2020);
     arms vertical to the FLOOR, not perpendicular to the backrest; at the bottom the
     dumbbells at the upper chest, elbows 45-60 degrees from the trunk. */
  incline: {
    name: 'לחיצת חזה בשיפוע', kfNames: ['למעלה', 'למטה'],
    camera: { pos: [0.1, 1.0, 3.6], at: [-0.1, 0.75, 0], fov: 32 },
    measures: [{ label: 'משענת מהאופק', horiz: ['lsh', 'lhip'] }, { label: 'זרוע עליונה מהגו', at: ['lel', 'lsh', 'lhip'] }, { label: 'אמה מהאנך', tilt: ['lel', 'lwr'] }],
    keyframes: [0, 1].map((bottom) => () => {
      const t = [Math.cos(rad(30)), -Math.sin(rad(30)), 0], n = [Math.sin(rad(30)), Math.cos(rad(30)), 0];
      const J = { lhip: [0.05, 0.55, 0.10], lkn: [0.47, 0.50, 0.14], lan: [0.42, 0.09, 0.16], ltoe: [0.58, 0.03, 0.17], lheel: [0.37, 0.04, 0.16] };
      J.lsh = add([J.lhip[0], J.lhip[1], 0.19], t, -0.50); J.pelvis = [0.05, 0.55, 0]; J.chest = add([J.lsh[0], J.lsh[1], 0], t, 0.12);
      J.neck = add([J.lsh[0], J.lsh[1], 0], t, -0.09); J.head = add(J.neck, t, -0.13); J.head = add(J.head, n, 0.03);
      mirror(J);
      for (const s of [1, -1]) {
        const sh = [J.lsh[0], J.lsh[1], 0.19 * s];
        let el;
        if (!bottom) el = add(sh, [0, 1, 0], L.upper);
        else { const th = rad(40), drop = 0.5, flat = Math.sqrt(1 - drop * drop); el = add(sh, norm(add(add(t.map((x) => x * Math.cos(th) * flat), [0, 0, s * Math.sin(th) * flat]), n, -drop)), L.upper); }
        const p = s > 0 ? 'l' : 'r'; J[p + 'el'] = el; J[p + 'wr'] = add(el, [0, 1, 0], L.fore);
      }
      const back = add([J.lsh[0], J.lsh[1], 0], t, 0.25);
      return { joints: J, props: [
        /* the backrest under the back, along the trunk (it rises toward -x, so -30) */
        { box: add(back, n, -0.13), size: [0.66, 0.06, 0.30], rotZ: -30 },
        /* the seat under the hips, the frame on the floor */
        { box: [0.17, 0.43, 0], size: [0.36, 0.06, 0.30] }, { box: [-0.10, 0.03, 0], size: [0.95, 0.06, 0.26] },
        { box: [0.17, 0.22, 0], size: [0.06, 0.40, 0.20] }, { box: [-0.28, 0.30, 0], size: [0.05, 0.56, 0.20] },
      ].concat([1, -1].map((s) => ({ dumbbell: add(J[(s > 0 ? 'l' : 'r') + 'wr'], [0, 0.04, 0]), axis: [0, 0, 1], len: 0.32 }))) };
    }),
  },

  /* x48, seated cable row: trunk vertical and still; knees slightly bent; a narrow V-handle,
     palms facing; the handle to the upper stomach, elbows along the ribs and just past the back. */
  cablerow: {
    name: 'חתירה בפולי בישיבה', kfNames: ['זרועות ישרות', 'הידית בבטן'],
    camera: { pos: [0.5, 1.0, 3.4], at: [0.5, 0.7, 0], fov: 32 },
    measures: [{ label: 'גו מהאנך', tilt: ['pelvis', 'neck'] }, { label: 'ברך', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'מרפק', at: ['lsh', 'lel', 'lwr'] }],
    keyframes: [0, 1].map((pulled) => () => {
      const J = { lhip: [0.15, 0.52, 0.10], lkn: [0.61, 0.59, 0.12], lan: [0.99, 0.46, 0.12], ltoe: [1.04, 0.62, 0.13], lheel: [0.98, 0.40, 0.12],
        lsh: [0.15, 1.05, 0.19], pelvis: [0.15, 0.52, 0], chest: [0.15, 0.85, 0], neck: [0.15, 1.12, 0], head: [0.16, 1.25, 0] };
      mirror(J);
      const handle = pulled ? [0.30, 0.86, 0] : [0.71, 0.86, 0];
      for (const s of [1, -1]) {
        const p = s > 0 ? 'l' : 'r', sh = J[p + 'sh'], wr = [handle[0] - 0.02, handle[1], 0.05 * s];
        J[p + 'wr'] = wr; J[p + 'el'] = pulled ? [-0.02, 0.88, 0.22 * s] : arm(sh, wr, [0, -1, 0.3 * s]);
      }
      return { joints: J, props: [
        { box: [0.17, 0.43, 0], size: [0.40, 0.08, 0.32] }, { box: [0.17, 0.2, 0], size: [0.08, 0.4, 0.2] },
        { box: [1.04, 0.52, 0], size: [0.04, 0.34, 0.36], rotZ: -20 }, { cyl: [1.12, 0.42, 0], axis: [0, 0, 1], r: 0.05, len: 0.05 },
        { line: [[handle[0] + 0.05, handle[1], 0], [1.12, 0.42, 0]] }, { box: [1.39, 1.0, 0], size: [0.12, 2.0, 0.30] },
        { box: [handle[0] + 0.02, handle[1], 0], size: [0.10, 0.03, 0.12] },
      ] };
    }),
  },

  /* x44, one-arm dumbbell row: left knee and hand on the bench under hip and shoulder;
     back flat, shoulders 10-20 degrees above the hips; the dumbbell from under the
     shoulder to beside the lower ribs / waist; the trunk does not turn. */
  onearm: {
    name: 'חתירה במשקולת יד', kfNames: ['זרוע תלויה', 'המשקולת במותן'],
    camera: { pos: [0.15, 0.9, -3.6], at: [0.15, 0.75, 0], fov: 32 },
    measures: [{ label: 'גו מהאופק', horiz: ['rhip', 'rsh'] }, { label: 'אמה מהאנך', tilt: ['rel', 'rwr'] }, { label: 'מרפק מעל קו הגב (ס"מ)', dy: ['rel', 'rsh'] }],
    keyframes: [0, 1].map((pulled) => () => {
      const J = { lhip: [0.35, 0.975, 0.10], lkn: [0.35, 0.50, 0.12], lan: [0.75, 0.50, 0.12], ltoe: [0.86, 0.47, 0.12], lheel: [0.73, 0.52, 0.12],
        rhip: [0.35, 0.975, -0.10], rkn: [0.25, 0.52, -0.18], ran: [0.30, 0.09, -0.22], rtoe: [0.14, 0.03, -0.23], rheel: [0.36, 0.04, -0.22],
        lsh: [-0.15, 1.08, 0.19], rsh: [-0.15, 1.08, -0.19], pelvis: [0.35, 0.975, 0], chest: [0.05, 1.04, 0], neck: [-0.24, 1.10, 0], head: [-0.36, 1.12, 0],
        lel: [-0.15, 0.78, 0.19], lwr: [-0.15, 0.51, 0.19] };
      if (!pulled) { J.rel = [-0.15, 0.78, -0.19]; J.rwr = [-0.15, 0.51, -0.19]; }
      else { J.rel = [0.13, 1.12, -0.22]; J.rwr = [0.13, 0.85, -0.22]; }
      return { joints: J, props: [{ box: [0.15, 0.45, 0.05], size: [1.2, 0.06, 0.30] }, { box: [-0.35, 0.21, 0.05], size: [0.06, 0.42, 0.26] }, { box: [0.65, 0.21, 0.05], size: [0.06, 0.42, 0.26] },
        { dumbbell: add(J.rwr, [0, -0.03, 0]), axis: [1, 0, 0], len: 0.32 }] };
    }),
  },

  /* x78, dumbbell lateral raise: elbow bent 15-20 degrees and fixed; the arms rise to
     shoulder height and no higher, 20 degrees in front of the frontal plane; trunk still. */
  lateral: {
    name: 'הרחקת כתף', kfNames: ['ידיים למטה', 'גובה הכתף'],
    camera: { pos: [2.7, 1.45, 1.6], at: [0, 1.0, 0], fov: 34 },
    measures: [{ label: 'זרוע עליונה מהאופק', horiz: ['lsh', 'lel'] }, { label: 'מרפק', at: ['lsh', 'lel', 'lwr'] }, { label: 'גו מהאנך', tilt: ['pelvis', 'neck'] }],
    keyframes: [0, 1].map((up) => () => {
      const J = mirror(standing(0.08, 0.13));
      for (const s of [1, -1]) {
        const p = s > 0 ? 'l' : 'r', sh = [J.lsh[0], J.lsh[1], 0.19 * s];
        J[p + 'sh'] = sh;
        if (!up) { J[p + 'el'] = add(sh, norm([0.10, -1, 0.15 * s]), L.upper); J[p + 'wr'] = add(J[p + 'el'], norm([0.30, -1, 0.04 * s]), L.fore); }
        else { const d = [Math.sin(rad(20)), 0, s * Math.cos(rad(20))]; J[p + 'el'] = add(sh, d, L.upper); J[p + 'wr'] = add(J[p + 'el'], norm([d[0] + 0.05, -0.30, d[2]]), L.fore); }
      }
      return { joints: J, props: [1, -1].map((s) => ({ dumbbell: add(J[(s > 0 ? 'l' : 'r') + 'wr'], [0, -0.01, 0]), axis: [1, 0, 0], len: 0.26 })) };
    }),
  },

  /* x140, leg extension: the knee on the pivot, thigh on the seat, back on the backrest;
     from 90 degrees (shin vertical) to about 5 degrees short of straight. */
  legext: {
    name: 'פשיטת ברך', kfNames: ['ברך ב-90°', 'כמעט ישרה'],
    camera: { pos: [0.25, 0.85, 3.4], at: [0.25, 0.65, 0], fov: 32 },
    measures: [{ label: 'ברך', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'ירך מהאופק', horiz: ['lhip', 'lkn'] }],
    keyframes: [0, 1].map((up) => () => {
      const kn = [0.45, 0.58, 0.12];
      const J = { lhip: [0.0, 0.58, 0.10], lkn: kn, pelvis: [0.0, 0.58, 0], lsh: [-0.12, 1.10, 0.19], chest: [-0.07, 0.90, 0], neck: [-0.14, 1.17, 0], head: [-0.15, 1.30, 0] };
      const dir = up ? [Math.cos(rad(-5)), Math.sin(rad(-5)), 0] : [0, -1, 0];
      J.lan = add(kn, dir, L.shin); J.ltoe = add(J.lan, up ? [0.03, 0.15, 0] : [0.15, -0.02, 0]); J.lheel = add(J.lan, up ? [-0.04, -0.04, 0] : [-0.05, -0.04, 0]);
      J.lel = [-0.05, 0.85, 0.24]; J.lwr = [0.02, 0.62, 0.26];
      mirror(J);
      const pad = add(add(kn, dir, L.shin - 0.06), up ? [0, 0.06, 0] : [0.06, 0, 0]);
      return { joints: J, props: [{ box: [0.18, 0.50, 0], size: [0.55, 0.08, 0.36] }, { box: [-0.18, 0.86, 0], size: [0.07, 0.6, 0.36], rotZ: -10 },
        { box: [0.05, 0.24, 0], size: [0.6, 0.48, 0.10] }, { cyl: [kn[0], kn[1], 0.30], axis: [0, 0, 1], r: 0.07, len: 0.03 },
        { line: [[kn[0], kn[1], 0.30], [pad[0], pad[1], 0.30]], r: 0.02 }, { cyl: pad, axis: [0, 0, 1], r: 0.05, len: 0.42 }] };
    }),
  },

  /* x153, lying leg curl: a humped bench (hip flexed about 30 degrees), kneecaps past the
     end, the pivot at the knee, the pad on the lower calf; from 10-15 degrees of bend to
     the shin past vertical (about 120); hips stay on the pad. */
  legcurl: {
    name: 'כפיפת ברך בשכיבה', kfNames: ['רגליים כמעט ישרות', 'השוק עברה את האנך'],
    camera: { pos: [0.0, 1.15, 3.6], at: [0.05, 0.85, 0], fov: 32 },
    measures: [{ label: 'ברך (מהצד)', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'ירך-גו (מהצד)', at: ['lsh', 'lhip', 'lkn'], side: true }],
    keyframes: [0, 1].map((curled) => () => {
      const kn = [0.45, 0.86, 0.12];
      const J = { lhip: [0.0, 1.0, 0.10], lkn: kn, lsh: [-0.52, 0.86, 0.19], pelvis: [0.0, 1.0, 0], chest: [-0.30, 0.90, 0], neck: [-0.62, 0.89, 0], head: [-0.74, 0.90, 0],
        lel: [-0.62, 0.73, 0.22], lwr: [-0.78, 0.76, 0.18] };
      const th = curled ? rad(-11 + 120) : rad(-11 + 12);
      const dir = [Math.cos(th), Math.sin(th), 0];
      J.lan = add(kn, dir, L.shin); J.ltoe = add(J.lan, curled ? [-0.15, 0.03, 0] : [0.02, -0.15, 0]); J.lheel = add(J.lan, curled ? [0.03, 0.05, 0] : [0.05, 0.03, 0]);
      mirror(J);
      const pad = add(add(kn, dir, L.shin - 0.10), curled ? [0.06, 0, 0] : [0, 0.06, 0]);
      return { joints: J, props: [
        { box: [-0.48, 0.76, 0], size: [0.55, 0.06, 0.30] }, { box: [-0.05, 0.84, 0], size: [0.34, 0.06, 0.30], rotZ: 12 }, { box: [0.27, 0.79, 0], size: [0.32, 0.06, 0.30], rotZ: -12 },
        { box: [-0.1, 0.38, 0], size: [0.08, 0.76, 0.20] }, { cyl: [kn[0], kn[1], 0.30], axis: [0, 0, 1], r: 0.07, len: 0.03 },
        { line: [[kn[0], kn[1], 0.30], [pad[0], pad[1], 0.30]], r: 0.02 }, { cyl: pad, axis: [0, 0, 1], r: 0.05, len: 0.42 }] };
    }),
  },

  /* x130, goblet squat: a dumbbell held vertically against the chest, palms under the top
     head; feet shoulder width, toes out 15-20 degrees; down to slightly below parallel,
     heels down, knees over the toes, elbows inside the knees. */
  goblet: {
    name: 'סקוואט גובלט', kfNames: ['עמידה', 'תחתית'],
    camera: { pos: [3.3, 1.35, 2.3], at: [0, 0.88, 0], fov: 34 },
    measures: [{ label: 'ירך מתחת לברך (ס"מ)', dy: ['lkn', 'lhip'] }, { label: 'גו מהאנך', tilt: ['pelvis', 'neck'] }, { label: 'שוק מהאנך', tilt: ['lan', 'lkn'] }],
    keyframes: [0, 1].map((down) => () => {
      let J;
      if (!down) { J = standing(0.08, 0.18); J.ltoe = [0.16, 0.03, 0.24]; }
      else {
        J = { lan: [0, 0.08, 0.18], ltoe: [0.16, 0.03, 0.24], lheel: [-0.06, 0.03, 0.18], lkn: [0.24, 0.40, 0.24], lhip: [-0.21, 0.37, 0.12] };
        J.pelvis = [-0.21, 0.37, 0]; const up = [Math.sin(rad(28)), Math.cos(rad(28)), 0];
        J.lsh = add([J.pelvis[0], J.pelvis[1], 0.19], up, L.trunk); J.chest = add(J.pelvis, up, 0.32); J.neck = add(J.pelvis, up, 0.61); J.head = add(J.pelvis, up, 0.74);
      }
      mirror(J);
      const chestFront = add([J.lsh[0], J.lsh[1], 0], [0.13, -0.17, 0]);
      for (const s of [1, -1]) { const p = s > 0 ? 'l' : 'r'; J[p + 'wr'] = add(chestFront, [0, 0.02, 0.05 * s]); J[p + 'el'] = add(chestFront, [0.0, -0.20, 0.12 * s]); }
      return { joints: J, props: [{ dumbbell: add(chestFront, [0.02, -0.10, 0]), axis: [0, 1, 0], len: 0.30 }] };
    }),
  },

  /* x176, standing calf raise (machine): balls of the feet on the block edge, knees
     straight, the body one column under the shoulder pads; from the heel 15-20 degrees
     below the block to the top, about 30 degrees above. */
  calf: {
    name: 'הרמת עקבים בעמידה', kfNames: ['עקב מתחת לבלוק', 'על הבהונות'],
    camera: { pos: [0.2, 1.05, 4.8], at: [0.1, 0.98, 0], fov: 34 },
    measures: [{ label: 'עקב מול ראש הבלוק (ס"מ)', dy: ['lheel', 'block'] }, { label: 'ברך', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'גוף מהאנך', tilt: ['pelvis', 'neck'] }],
    keyframes: [0, 1].map((up) => () => {
      const ball = [0.06, 0.15, 0.10], a = rad(up ? 30 : -18);
      /* the foot runs from the ball back to the heel; a > 0 lifts the heel above the ball */
      const f = [-Math.cos(a), Math.sin(a), 0], u = [Math.sin(a), Math.cos(a), 0];
      const heel = add(ball, f, 0.20), ankle = add(add(ball, f, 0.13), u, 0.08);
      const J = { lan: ankle, lheel: heel, ltoe: add(ball, [0.06, -0.01, 0]), block: [0, 0.15, 0] };
      J.lkn = add(ankle, [0, L.shin, 0]); J.lhip = add(J.lkn, [0, L.thigh, 0]);
      J.pelvis = [J.lhip[0], J.lhip[1], 0]; J.chest = add(J.pelvis, [0, 0.32, 0]); J.lsh = add(J.lhip, [0, L.trunk, 0.09]);
      J.neck = add(J.pelvis, [0, 0.61, 0]); J.head = add(J.pelvis, [0.01, 0.74, 0]);
      J.lel = add(J.lsh, [0.12, -0.10, 0.08]); J.lwr = add(J.lsh, [0.22, 0.10, 0.03]);
      mirror(J);
      return { joints: J, props: [{ box: [0.03, 0.075, 0], size: [0.30, 0.15, 0.60] }, { box: [J.lsh[0], J.lsh[1] + 0.07, 0], size: [0.14, 0.06, 0.62] },
        { box: [0.55, 1.1, 0], size: [0.12, 2.2, 0.30] }, { line: [[J.lsh[0] + 0.07, J.lsh[1] + 0.07, 0], [0.5, J.lsh[1] + 0.07, 0]], r: 0.025 }] };
    }),
  },
};
