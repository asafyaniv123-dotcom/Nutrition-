/* "The night is too black" (20 Oct 2026): three lighter nights, drawn over
 * the shipped one by tools/shoot-home.mjs --ideas-file tools/night-shades.mjs
 * at a night hour. Only the material tokens move; the lamp and the lanterns
 * stay as they are. dev/index.html is not written. */
const N = 'html body.mod-home.tod-night';
const shade = (ground, rim, tk, ink, muted) => `
${N}{--nu-ground:${ground};--nu-ink:${ink};--nu-muted:${muted};
  --nu-lit:rgba(255,240,222,.09);--nu-shade:rgba(0,0,0,.42);--nu-shade-soft:rgba(0,0,0,.3)}
${N} .rim-ch{stroke:${rim}}
${N} .rim-tk{stroke:${tk}}
`;
export const IDEAS = {
  dusk:  { css: shade('#3a3430', '#2e2926', '#6a6058', '#f1e9df', '#bcb0a2'), js: '' },
  slate: { css: shade('#4a443f', '#3c3733', '#7a7068', '#f4ede4', '#c6bbae'), js: '' },
  mist:  { css: shade('#5b5550', '#4c4743', '#8a8178', '#f7f1ea', '#d2c8bc'), js: '' },
};
