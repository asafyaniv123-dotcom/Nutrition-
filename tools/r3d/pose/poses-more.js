// Round 3 keyframes and the research they must satisfy (Asaf, 4 Nov). Every exercise carries
// a `spec`: each line of research_notes/טכניקה נכונה לעשרה תרגילים - סבב 3/ that a still can
// show, as a row - what it says, the source, the allowed range - checked against the
// mannequin on every render. Metres, y up, x along the body, z left (+) / right (-).
// Knees and elbows are SOLVED from the limb lengths (twoBone), never placed by eye.
export const L = { upper: 0.30, fore: 0.27, thigh: 0.475, shin: 0.40, trunk: 0.53 };
export const rad = (d) => d * Math.PI / 180;
export const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const norm = (a) => { const n = Math.hypot(a[0], a[1], a[2]); return [a[0] / n, a[1] / n, a[2] / n]; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const mirror = (J) => { for (const k of Object.keys(J)) if (k[0] === 'l' && J['r' + k.slice(1)] === undefined) J['r' + k.slice(1)] = [J[k][0], J[k][1], -J[k][2]]; return J; };
/* the middle joint of a two-bone limb (knee, elbow) from its ends and lengths, bending
   toward `toward` - the direction the joint points (a knee forward, an elbow back) */
export function twoBone(a, c, la, lb, toward) {
  const d = sub(c, a), D = Math.min(Math.hypot(d[0], d[1], d[2]), la + lb - 1e-6), u = norm(d);
  const x = (la * la - lb * lb + D * D) / (2 * D), h = Math.sqrt(Math.max(0, la * la - x * x));
  const t = norm(sub(toward, u.map((v) => v * dot(toward, u))));
  return add(add(a, u, x), t, h);
}
/* a standing body facing +x, the knees bent `kneeBend` degrees */
function standing(ankleY, footZ, kneeBend) {
  const J = { lan: [0, ankleY, footZ], ltoe: [0.17, ankleY - 0.05, footZ + 0.02], lheel: [-0.06, ankleY - 0.05, footZ], floor: [0, 0, 0] };
  const reach = Math.sqrt(L.thigh ** 2 + L.shin ** 2 + 2 * L.thigh * L.shin * Math.cos(rad(kneeBend || 0)));
  const hip = [0, ankleY + Math.sqrt(reach * reach - (0.10 - footZ) ** 2), 0.10];
  J.lhip = hip; J.lkn = twoBone(hip, J.lan, L.thigh, L.shin, [1, 0, 0]);
  J.pelvis = [0, hip[1], 0]; J.chest = [0, hip[1] + 0.32, 0]; J.lsh = [0, hip[1] + L.trunk, 0.19];
  J.neck = [0, J.lsh[1] + 0.08, 0]; J.head = [0.01, J.lsh[1] + 0.21, 0];
  return J;
}
const DB = (J, p, up, axis, len) => ({ dumbbell: add(J[p + 'wr'], [0, up, 0]), axis, len });

export const MORE = {
  incline: {
    name: 'לחיצת חזה בשיפוע', kfNames: ['למעלה', 'למטה'],
    camera: { pos: [0.1, 1.0, 3.6], at: [-0.1, 0.75, 0], fov: 32 },
    measures: [{ label: 'משענת מהאופק', horiz: ['chest', 'pelvis'] }, { label: 'זרוע עליונה מהגו', at: ['lel', 'lsh', 'lhip'] }, { label: 'אמה מהאנך', tilt: ['lel', 'lwr'] }],
    spec: [
      { kf: 'both', text: 'משענת בזווית 30°', src: 'הספרייה; Rodríguez-Ridao 2020', m: { horiz: ['chest', 'pelvis'] }, min: 28, max: 32 },
      { kf: 'both', text: 'ברכיים בערך 90°, כפות רגליים על הרצפה', src: 'מחקר x4, הגוף', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 75, max: 105 },
      { kf: 0, text: 'הזרועות אנכיות לרצפה ולא בניצב למשענת', src: 'ACE ("over your eyes")', m: { tilt: ['lsh', 'lwr'] }, min: 0, max: 5 },
      { kf: 0, text: 'כל משקולת מעל הכתף שלה', src: 'מחקר x4, טבלת זמנים', m: { dx: ['lwr', 'lsh'] }, min: -3, max: 3 },
      { kf: 1, text: 'מרפק 45°–60° מהגו', src: 'מחקר x4', m: { at: ['lel', 'lsh', 'lhip'] }, min: 45, max: 60 },
      { kf: 1, text: 'אמה אנכית, שורש היד מעל המרפק', src: 'מחקר x4', m: { tilt: ['lel', 'lwr'] }, min: 0, max: 5 },
      { kf: 1, text: 'המשקולות בחזה העליון, כמה ס"מ מתחת לעצם הבריח', src: 'מחקר x4, נקודת המפנה', m: { dx: ['lwr', 'lsh'] }, min: 2, max: 15 },
    ],
    keyframes: [0, 1].map((bottom) => () => {
      const t = [Math.cos(rad(30)), -Math.sin(rad(30)), 0], n = [Math.sin(rad(30)), Math.cos(rad(30)), 0];
      const J = { lhip: [0.05, 0.55, 0.10], lan: [0.42, 0.09, 0.16], ltoe: [0.58, 0.03, 0.17], lheel: [0.37, 0.04, 0.16] };
      J.lkn = twoBone(J.lhip, J.lan, L.thigh, L.shin, [1, 0.3, 0]);
      J.lsh = add([J.lhip[0], J.lhip[1], 0.19], t, -0.50); J.pelvis = [0.05, 0.55, 0]; J.chest = add([J.lsh[0], J.lsh[1], 0], t, 0.12);
      J.neck = add([J.lsh[0], J.lsh[1], 0], t, -0.09); J.head = add(add(J.neck, t, -0.13), n, 0.03);
      mirror(J);
      for (const s of [1, -1]) {
        const p = s > 0 ? 'l' : 'r', sh = [J.lsh[0], J.lsh[1], 0.19 * s];
        let el;
        if (!bottom) el = add(sh, [0, 1, 0], L.upper);
        else { const th = rad(40), drop = 0.5, flat = Math.sqrt(1 - drop * drop); el = add(sh, norm(add(add(t.map((x) => x * Math.cos(th) * flat), [0, 0, s * Math.sin(th) * flat]), n, -drop)), L.upper); }
        J[p + 'el'] = el; J[p + 'wr'] = add(el, [0, 1, 0], L.fore);
      }
      const back = add([J.lsh[0], J.lsh[1], 0], t, 0.25);
      return { joints: J, props: [
        { box: add(back, n, -0.13), size: [0.66, 0.06, 0.30], rotZ: -30 },
        { box: [0.17, 0.43, 0], size: [0.36, 0.06, 0.30] }, { box: [-0.10, 0.03, 0], size: [0.95, 0.06, 0.26] },
        { box: [0.17, 0.22, 0], size: [0.06, 0.40, 0.20] }, { box: [-0.28, 0.30, 0], size: [0.05, 0.56, 0.20] },
        DB(J, 'l', 0.04, [0, 0, 1], 0.32), DB(J, 'r', 0.04, [0, 0, 1], 0.32)] };
    }),
  },

  cablerow: {
    name: 'חתירה בפולי בישיבה', kfNames: ['זרועות ישרות', 'הידית בבטן'],
    camera: { pos: [0.55, 1.0, 3.5], at: [0.55, 0.7, 0], fov: 32 },
    measures: [{ label: 'גו מהאנך', tilt: ['pelvis', 'neck'] }, { label: 'ברך', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'מרפק', at: ['lsh', 'lel', 'lwr'] }],
    spec: [
      { kf: 'both', text: 'גו אנכי ושלא זז', src: 'מחקר x48 ("keep the trunk perpendicular to the floor")', m: { tilt: ['pelvis', 'neck'] }, min: 0, max: 4 },
      { kf: 'both', text: 'ברכיים כפופות קלות, 15°–25°', src: 'מחקר x48, הגוף', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 155, max: 165 },
      { kf: 'both', text: 'מושב בגובה 40–45 ס"מ', src: 'מחקר x48, המכונה', m: { dy: ['seat', 'floor'] }, min: 40, max: 45 },
      { kf: 0, text: 'זרועות ישרות קדימה', src: 'מחקר x48, התחלה', m: { at: ['lsh', 'lel', 'lwr'] }, min: 170, max: 180 },
      { kf: 0, text: 'הידית בגובה הבטן העליונה עד החזה התחתון', src: 'מחקר x48, התחלה', m: { dy: ['lwr', 'pelvis'] }, min: 28, max: 45 },
      { kf: 1, text: 'הידית נוגעת בבטן העליונה', src: 'מחקר x48, נקודת המפנה', m: { dx: ['lwr', 'pelvis'] }, min: 10, max: 18 },
      { kf: 1, text: 'מרפקים מעט מאחורי קו הגב', src: 'מחקר x48, נקודת המפנה', m: { dx: ['lel', 'pelvis'] }, min: -26, max: -13 },
    ],
    keyframes: [0, 1].map((pulled) => () => {
      const J = { lhip: [0.15, 0.52, 0.10], lan: [1.0, 0.43, 0.12], ltoe: [1.05, 0.59, 0.13], lheel: [0.99, 0.37, 0.12],
        lsh: [0.15, 1.05, 0.19], pelvis: [0.15, 0.52, 0], chest: [0.15, 0.85, 0], neck: [0.15, 1.12, 0], head: [0.16, 1.25, 0], seat: [0, 0.43, 0], floor: [0, 0, 0] };
      J.lkn = twoBone(J.lhip, J.lan, L.thigh, L.shin, [0, 1, 0]);
      mirror(J);
      const handle = pulled ? [0.29, 0.86, 0] : [0.72, 0.86, 0];
      for (const s of [1, -1]) {
        const p = s > 0 ? 'l' : 'r', sh = J[p + 'sh'], wr = [handle[0] - 0.02, handle[1], 0.05 * s];
        J[p + 'wr'] = wr; J[p + 'el'] = pulled ? twoBone(sh, wr, L.upper, L.fore, [-1, -0.05, 0.25 * s]) : add(sh, norm(sub(wr, sh)), L.upper);
      }
      return { joints: J, props: [
        { box: [0.17, 0.41, 0], size: [0.40, 0.06, 0.32] }, { box: [0.17, 0.2, 0], size: [0.08, 0.4, 0.2] },
        { box: [1.06, 0.50, 0], size: [0.04, 0.34, 0.36], rotZ: -20 }, { cyl: [1.15, 0.40, 0], axis: [0, 0, 1], r: 0.05, len: 0.05 },
        { line: [[handle[0] + 0.05, handle[1], 0], [1.15, 0.40, 0]] }, { box: [1.42, 1.0, 0], size: [0.12, 2.0, 0.30] },
        { box: [handle[0] + 0.02, handle[1], 0], size: [0.10, 0.03, 0.12] }, { box: [0.6, 0.02, 0], size: [1.7, 0.04, 0.3] }] };
    }),
  },

  onearm: {
    name: 'חתירה במשקולת יד', kfNames: ['זרוע תלויה', 'המשקולת במותן'],
    camera: { pos: [0.15, 0.9, -3.6], at: [0.15, 0.72, 0], fov: 32 },
    measures: [{ label: 'גו מהאופק', horiz: ['pelvis', 'neck'] }, { label: 'אמה מהאנך', tilt: ['rel', 'rwr'] }, { label: 'מרפק מעל קו הגב (ס"מ)', dy: ['rel', 'rsh'] }],
    spec: [
      { kf: 'both', text: 'ספסל שטוח בגובה 43–45 ס"מ', src: 'מחקר x44, הציוד והגוף', m: { dy: ['benchTop', 'floor'] }, min: 43, max: 45 },
      { kf: 'both', text: 'גב שטוח, הכתפיים 10°–20° מעל האגן', src: 'מחקר x44, הציוד והגוף', m: { horiz: ['pelvis', 'neck'] }, min: 10, max: 20 },
      { kf: 'both', text: 'הברך התומכת ישר מתחת לאגן', src: 'ACE; מחקר x44', m: { dx: ['lkn', 'lhip'] }, min: -4, max: 4 },
      { kf: 'both', text: 'היד התומכת ישר מתחת לכתף, מרפק ישר', src: 'ACE; מחקר x44', m: { dx: ['lwr', 'lsh'] }, min: -4, max: 4 },
      { kf: 'both', text: 'הרגל העומדת מעט לצד ולאחור', src: 'מחקר x44, הציוד והגוף', m: { dx: ['ran', 'rhip'] }, min: 5, max: 25 },
      { kf: 'both', text: 'ברך הרגל העומדת רכה', src: 'מחקר x44', m: { at: ['rhip', 'rkn', 'ran'] }, min: 160, max: 178 },
      { kf: 0, text: 'הזרוע תלויה, המשקולת ישר מתחת לכתף', src: 'מחקר x44, התחלה', m: { dx: ['rwr', 'rsh'] }, min: -3, max: 3 },
      { kf: 1, text: 'המשקולת באמצע הדרך בין הכתף לאגן', src: 'מחקר x44, נקודת המפנה', m: { dx: ['rwr', 'rsh'] }, min: 18, max: 34 },
      { kf: 1, text: 'המרפק מעט מעל קו הגב', src: 'מחקר x44, נקודת המפנה', m: { dy: ['rel', 'rsh'] }, min: 0, max: 10 },
      { kf: 1, text: 'האמה נשארת אנכית', src: 'מחקר x44', m: { tilt: ['rel', 'rwr'] }, min: 0, max: 8 },
    ],
    keyframes: [0, 1].map((pulled) => () => {
      /* the bench top at 44 cm: the kneeling knee rests on it just ahead of the hip, low
         enough that the standing leg keeps a soft knee */
      const J = { lhip: [0.35, 0.938, 0.10], lkn: [0.39, 0.465, 0.12], lan: [0.79, 0.465, 0.12], ltoe: [0.90, 0.44, 0.12], lheel: [0.77, 0.49, 0.12],
        rhip: [0.35, 0.938, -0.10], ran: [0.47, 0.09, -0.24], rtoe: [0.31, 0.03, -0.25], rheel: [0.53, 0.04, -0.24],
        lsh: [-0.15, 1.05, 0.19], rsh: [-0.15, 1.05, -0.19], pelvis: [0.35, 0.938, 0], chest: [0.05, 1.01, 0], neck: [-0.24, 1.07, 0], head: [-0.36, 1.09, 0],
        lel: [-0.15, 0.75, 0.19], lwr: [-0.15, 0.48, 0.19], benchTop: [0, 0.44, 0], floor: [0, 0, 0] };
      J.rkn = twoBone(J.rhip, J.ran, L.thigh, L.shin, [-1, 0, 0]);
      if (!pulled) { J.rel = [-0.15, 0.75, -0.19]; J.rwr = [-0.15, 0.48, -0.19]; }
      else { J.rel = [0.13, 1.09, -0.22]; J.rwr = [0.13, 0.82, -0.22]; }
      return { joints: J, props: [{ box: [0.15, 0.41, 0.05], size: [1.2, 0.06, 0.30] }, { box: [-0.35, 0.19, 0.05], size: [0.06, 0.38, 0.26] }, { box: [0.65, 0.19, 0.05], size: [0.06, 0.38, 0.26] },
        { dumbbell: add(J.rwr, [0, -0.03, 0]), axis: [1, 0, 0], len: 0.32 }] };
    }),
  },

  lateral: {
    name: 'הרחקת כתף', kfNames: ['ידיים למטה', 'גובה הכתף'],
    camera: { pos: [2.7, 1.45, 1.6], at: [0, 1.0, 0], fov: 34 },
    measures: [{ label: 'זרוע עליונה מהאופק', horiz: ['lsh', 'lel'] }, { label: 'מרפק', at: ['lsh', 'lel', 'lwr'] }, { label: 'ברך', at: ['lhip', 'lkn', 'lan'] }],
    spec: [
      { kf: 'both', text: 'ברכיים רכות', src: 'מחקר x78, הציוד והגוף', m: { at: ['lhip', 'lkn', 'lan'] }, min: 165, max: 177 },
      { kf: 'both', text: 'מרפק כפוף 15°–20°, קבוע', src: 'מחקר x78', m: { at: ['lsh', 'lel', 'lwr'] }, min: 160, max: 165 },
      { kf: 'both', text: 'גו זקוף, בלי נדנוד', src: 'מחקר x78', m: { tilt: ['pelvis', 'neck'] }, min: 0, max: 3 },
      { kf: 0, text: 'המשקולות לצד הירכיים, לא נוגעות ברגליים', src: 'מחקר x78, התחלה', m: { dz: ['lwr', 'lhip'] }, min: 8, max: 20 },
      { kf: 1, text: 'זרוע עליונה בגובה הכתף ולא מעליו', src: 'ACE; מחקר x78', m: { dy: ['lel', 'lsh'] }, min: -4, max: 1 },
      { kf: 1, text: 'הזרועות 15°–30° לפני המישור של הגוף', src: 'מחקר x78, המישור', m: { dx: ['lel', 'lsh'] }, min: 8, max: 15 },
    ],
    keyframes: [0, 1].map((up) => () => {
      const J = mirror(standing(0.08, 0.13, 10));
      for (const s of [1, -1]) {
        const p = s > 0 ? 'l' : 'r', sh = [J.lsh[0], J.lsh[1], 0.19 * s];
        J[p + 'sh'] = sh;
        if (!up) { J[p + 'el'] = add(sh, norm([0.10, -1, 0.15 * s]), L.upper); J[p + 'wr'] = add(J[p + 'el'], norm([0.38, -1, 0.04 * s]), L.fore); }
        else { const d = [Math.sin(rad(20)), 0, s * Math.cos(rad(20))]; J[p + 'el'] = add(sh, d, L.upper); J[p + 'wr'] = add(J[p + 'el'], norm([d[0] + 0.05, -0.30, d[2]]), L.fore); }
      }
      return { joints: J, props: [1, -1].map((s) => DB(J, s > 0 ? 'l' : 'r', -0.01, [1, 0, 0], 0.26)) };
    }),
  },

  legext: {
    name: 'פשיטת ברך', kfNames: ['ברך ב-90°', 'כמעט ישרה'],
    camera: { pos: [0.25, 0.85, 3.4], at: [0.25, 0.65, 0], fov: 32 },
    measures: [{ label: 'ברך', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'ירך מהאופק', horiz: ['lhip', 'lkn'] }],
    spec: [
      { kf: 'both', text: 'הירך על המושב ולא מתרוממת', src: 'מחקר x140', m: { horiz: ['lhip', 'lkn'] }, min: 0, max: 4 },
      { kf: 'both', text: 'הגב על משענת שנוטה מעט לאחור (100°–110°)', src: 'מחקר x140, המכונה', m: { at: ['neck', 'pelvis', 'lkn'], side: true }, min: 98, max: 112 },
      { kf: 0, text: 'ברך כפופה כ־90°, שוק אנכית', src: 'מחקר x140, התחלה', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 85, max: 95 },
      { kf: 1, text: 'עד כ־5° לפני יישור מלא, בלי נעילה', src: 'מחקר x140, נקודת המפנה', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 170, max: 178 },
    ],
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

  legcurl: {
    name: 'כפיפת ברך בשכיבה', kfNames: ['רגליים כמעט ישרות', 'השוק עברה את האנך'],
    camera: { pos: [0.0, 1.15, 3.6], at: [0.05, 0.85, 0], fov: 32 },
    measures: [{ label: 'ברך (מהצד)', at: ['lhip', 'lkn', 'lan'], side: true }, { label: 'ירך-גו (מהצד)', at: ['lsh', 'lhip', 'lkn'], side: true }],
    spec: [
      { kf: 'both', text: 'ירך כפופה כ־30° (ספסל עם גבנון)', src: 'מחקר x153; Maeo', m: { at: ['lsh', 'lhip', 'lkn'], side: true }, min: 145, max: 155 },
      { kf: 'both', text: 'פיקות הברכיים ממש מעבר לקצה הספסל', src: 'מחקר x153, המכונה', m: { dx: ['lkn', 'benchEnd'] }, min: 0, max: 6 },
      { kf: 0, text: 'התחלה בכיפוף של 10°–15°', src: 'NASM ("just short of full extension")', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 165, max: 170 },
      { kf: 1, text: 'השוק עוברת את האנך (כיפוף של כ־120°)', src: 'ACE; מחקר x153', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 50, max: 65 },
    ],
    keyframes: [0, 1].map((curled) => () => {
      const kn = [0.45, 0.86, 0.12], hip = [0.0, 1.0, 0.10];
      const J = { lhip: hip, lkn: kn, lsh: [-0.52, 0.86, 0.19], pelvis: [0.0, 1.0, 0], chest: [-0.30, 0.90, 0], neck: [-0.62, 0.89, 0], head: [-0.74, 0.90, 0],
        lel: [-0.62, 0.73, 0.22], lwr: [-0.78, 0.76, 0.18], benchEnd: [0.43, 0.8, 0] };
      /* the shin bends up from the line of the thigh: 12 degrees to start, 120 at the top */
      const thigh = Math.atan2(kn[1] - hip[1], kn[0] - hip[0]) * 180 / Math.PI;
      const th = rad(thigh + (curled ? 120 : 12));
      const dir = [Math.cos(th), Math.sin(th), 0];
      J.lan = add(kn, dir, L.shin); J.ltoe = add(J.lan, curled ? [-0.15, 0.03, 0] : [0.02, -0.15, 0]); J.lheel = add(J.lan, curled ? [0.03, 0.05, 0] : [0.05, 0.03, 0]);
      mirror(J);
      const pad = add(add(kn, dir, L.shin - 0.10), curled ? [0.06, 0, 0] : [0, 0.06, 0]);
      return { joints: J, props: [
        { box: [-0.48, 0.76, 0], size: [0.55, 0.06, 0.30] }, { box: [-0.05, 0.86, 0], size: [0.34, 0.06, 0.30], rotZ: 15 }, { box: [0.27, 0.81, 0], size: [0.32, 0.06, 0.30], rotZ: -15 },
        { box: [-0.1, 0.38, 0], size: [0.08, 0.76, 0.20] }, { cyl: [kn[0], kn[1], 0.30], axis: [0, 0, 1], r: 0.07, len: 0.03 },
        { line: [[kn[0], kn[1], 0.30], [pad[0], pad[1], 0.30]], r: 0.02 }, { cyl: pad, axis: [0, 0, 1], r: 0.05, len: 0.42 }] };
    }),
  },

  goblet: {
    name: 'סקוואט גובלט', kfNames: ['עמידה', 'תחתית'],
    camera: { pos: [3.3, 1.35, 2.3], at: [0, 0.88, 0], fov: 34 },
    measures: [{ label: 'ירך מתחת לברך (ס"מ)', dy: ['lkn', 'lhip'] }, { label: 'גו מהאנך', tilt: ['pelvis', 'neck'] }],
    spec: [
      { kf: 'both', text: 'כפות רגליים ברוחב הכתפיים', src: 'ACE; הספרייה', m: { dz: ['lan', 'ran'] }, min: 32, max: 42 },
      { kf: 'both', text: 'עקבים על הרצפה', src: 'מחקר x130', m: { dy: ['lheel', 'floor'] }, min: 0, max: 5 },
      { kf: 1, text: 'הירך מעט מתחת למקביל', src: 'מחקר x130, נקודת המפנה', m: { dy: ['lkn', 'lhip'] }, min: 1, max: 8 },
      { kf: 1, text: 'המרפקים בין הברכיים', src: 'הספרייה; מחקר x130', m: { dz: ['lkn', 'lel'] }, min: 4, max: 20 },
      { kf: 1, text: 'גו זקוף יחסית, לא מתקפל קדימה', src: 'מחקר x130', m: { tilt: ['pelvis', 'neck'] }, min: 15, max: 35 },
    ],
    keyframes: [0, 1].map((down) => () => {
      let J;
      if (!down) { J = standing(0.08, 0.18, 6); J.ltoe = [0.16, 0.03, 0.24]; }
      else {
        J = { lan: [0, 0.08, 0.18], ltoe: [0.16, 0.03, 0.24], lheel: [-0.06, 0.03, 0.18], lhip: [-0.21, 0.37, 0.12], floor: [0, 0, 0] };
        J.lkn = twoBone(J.lhip, J.lan, L.thigh, L.shin, [0.8, 0.5, 0.35]);
        J.pelvis = [-0.21, 0.37, 0]; const up = [Math.sin(rad(28)), Math.cos(rad(28)), 0];
        J.lsh = add([J.pelvis[0], J.pelvis[1], 0.19], up, L.trunk); J.chest = add(J.pelvis, up, 0.32); J.neck = add(J.pelvis, up, 0.61); J.head = add(J.pelvis, up, 0.74);
      }
      mirror(J);
      const chestFront = add([J.lsh[0], J.lsh[1], 0], [0.13, -0.17, 0]);
      for (const s of [1, -1]) { const p = s > 0 ? 'l' : 'r'; J[p + 'wr'] = add(chestFront, [0, 0.02, 0.05 * s]); J[p + 'el'] = add(chestFront, [0.0, -0.20, 0.12 * s]); }
      return { joints: J, props: [{ dumbbell: add(chestFront, [0.02, -0.10, 0]), axis: [0, 1, 0], len: 0.30 }] };
    }),
  },

  calf: {
    name: 'הרמת עקבים בעמידה', kfNames: ['עקב מתחת לבלוק', 'על הבהונות'],
    camera: { pos: [0.2, 1.05, 4.8], at: [0.1, 0.98, 0], fov: 34 },
    measures: [{ label: 'כף רגל מהאופק', horiz: ['lheel', 'lball'] }, { label: 'ברך', at: ['lhip', 'lkn', 'lan'], side: true }],
    spec: [
      { kf: 'both', text: 'ברכיים ישרות', src: 'מחקר x176', m: { at: ['lhip', 'lkn', 'lan'], side: true }, min: 175, max: 180 },
      { kf: 'both', text: 'הגוף עמוד אחד, לא נוטה', src: 'מחקר x176', m: { tilt: ['pelvis', 'neck'] }, min: 0, max: 3 },
      { kf: 'both', text: 'בלוק בגובה 10–15 ס"מ', src: 'מחקר x176, המכונה', m: { dy: ['block', 'floor'] }, min: 10, max: 15 },
      { kf: 0, text: 'העקב 15°–20° מתחת לקו הבלוק', src: 'מחקר x176, התחלה', m: { horiz: ['lheel', 'lball'] }, min: 15, max: 20 },
      { kf: 0, text: '...ומתחת לראש הבלוק', src: 'מחקר x176', m: { dy: ['lheel', 'block'] }, min: -10, max: -2 },
      { kf: 1, text: 'למעלה, כ־30° מעל', src: 'מחקר x176, נקודת המפנה', m: { horiz: ['lheel', 'lball'] }, min: 25, max: 35 },
    ],
    keyframes: [0, 1].map((up) => () => {
      const ball = [0.06, 0.15, 0.10], a = rad(up ? 30 : -18);
      const f = [-Math.cos(a), Math.sin(a), 0], u = [Math.sin(a), Math.cos(a), 0];
      const heel = add(ball, f, 0.20), ankle = add(add(ball, f, 0.13), u, 0.08);
      const J = { lan: ankle, lheel: heel, ltoe: add(ball, [0.06, -0.01, 0]), lball: ball, block: [0, 0.15, 0], floor: [0, 0, 0] };
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
