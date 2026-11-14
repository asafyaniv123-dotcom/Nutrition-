// node tools/sheets/ref-gate.mjs <id> <1|2> <prompt.txt> - Strict Reference-Only Gate (Asaf, 14 Nov): run on the EXACT prompt before every paid
//   generation; exit 1 = the call is not sent. No reference = no credit, and nothing the reference does not show.
//   frame 1: exercise-sheets/<id>/ref-start.png must exist (the clean crop of the START pose, from liftmanual or a reference he approved).
//   frame 2: exercise-sheets/<id>/ref-end.png (the END crop) AND exercise-sheets/<id>/start.png (the approved frame 1) must exist.
//   The prompt must: carry the garment sentence and the AVOID terms, keep the four forbidden words out, name the anchor as STYLE ONLY,
//   name the reference as the only authority on pose/camera/equipment, forbid inventing, and (frame 2) lock the background/equipment to frame 1.
//   Prints the sha of the prompt so the report can show which text passed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [ID, FR, PF] = process.argv.slice(2);
if (!PF || !['1', '2'].includes(FR)) { console.log('usage: ref-gate.mjs <id> <1|2> <prompt.txt>'); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const d = path.join(here, '..', '..', 'exercise-sheets', ID);
const t = fs.readFileSync(PF, 'utf8'), low = t.toLowerCase();
const fails = [];
const need = (ok, why) => { if (!ok) fails.push(why); };
const png = (f) => { const p = path.join(d, f); if (!fs.existsSync(p)) return null; const b = fs.readFileSync(p); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); };
const rs = png('ref-start.png'), re = png('ref-end.png'), st = png('start.png');
if (FR === '1') need(rs, `no reference crop: ${ID}/ref-start.png`);
else { need(re, `no reference crop: ${ID}/ref-end.png`); need(st, `no approved frame 1: ${ID}/start.png`); }
for (const w of ['hips', 'anatomical', 'glowing', 'neon']) need(!new RegExp(`\\b${w}\\b`).test(low), `forbidden word in the prompt: ${w}`);
need(t.includes('transparent amber mid-thigh athletic shorts with one straight waistband, exactly as in the CANONICAL-x106'), 'garment sentence missing');
for (const w of ['high-cut underwear', 'speedo briefs', 'bikini lines', 'three arms', 'extra arm']) need(low.includes(w), `AVOID term missing: ${w}`);
need(/only\s+(a\s+)?style/.test(low), 'the anchor is not named as STYLE ONLY');
need(/only authority/.test(low), 'the reference is not named as the ONLY authority on pose, camera and equipment');
need(/nothing (that is )?not (shown|in) (in )?image|do not (add|invent)|invent nothing/.test(low), 'no "invent nothing / add nothing not in the reference" sentence');
if (FR === '2') need(/frozen/.test(low) && /(background|studio)/.test(low), 'frame 2: background and equipment not locked to frame 1 (FROZEN ...)');
const sha = crypto.createHash('sha256').update(t).digest('hex').slice(0, 12);
console.log(`ref-gate ${ID} frame ${FR}: ref-start ${rs || '-'} ref-end ${re || '-'} frame1 ${st || '-'} prompt ${sha}`);
for (const f of fails) console.log('FAIL', f);
console.log(fails.length ? 'BLOCKED - do not send this generation' : 'PASS - reference-based, may be sent');
process.exit(fails.length ? 1 : 0);
