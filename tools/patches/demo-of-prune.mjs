// node tools/patches/demo-of-prune.mjs <index.html> [--undo] - Asaf, 20 Nov: "a barbell lunge plays a bodyweight lunge". An exercise
//   that borrows another's loop (EX_DEMO_OF) keeps it only when the loop shows what its NAME and its EQUIPMENT say. Found by
//   tools/sheets/demo-of-scan.mjs and checked by eye on the source frames: 42 links where the equipment differs (the barbell lunge,
//   the weighted dips with no plate, every sumo deadlift on the banded one), and 9 where it matches but the name says something the
//   loop does not show (kneeling, a rack, a twist, a towel, a sumo stance, another machine). No loop in the library fits any of them, so they are
//   unlinked - and an exercise with no loop is never shown (exShown), the way the chest presses without one were hidden.
//   --undo restores the line byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const EQUIPMENT = ['x23', 'x31', 'x32', 'x45', 'x56', 'x65', 'x132', 'x133', 'x143', 'x146', 'x157', 'x161', 'x163', 'x180', 'x231',
  'x232', 'x233', 'x235', 'x255', 'x257', 'x258', 'x303', 'x306', 'x308', 'x310', 'x311', 'x312', 'x314', 'x316', 'x318', 'x320',
  'x322', 'x327', 'x328', 'x329', 'x330', 'x331', 'x332', 'x333', 'x334', 'x337', 'x338'];
const NAME = ['x59', 'x138', 'x214', 'x265', 'x307', 'x313', 'x317', 'x325', 'x339'];
const DROP = new Set([...EQUIPMENT, ...NAME]);
const NOTE = '/* 20 Nov (Asaf): a borrowed loop stays only where it shows the name AND the equipment - 51 links that did not are gone, see tools/patches/demo-of-prune.mjs */\n';
const ORIGINAL = "var EX_DEMO_OF={x324:'x321',x23:'x22',x28:'x27',x30:'x27',x31:'x27',x32:'x27',x43:'x41',x45:'x41',x56:'x55',x58:'x57',x59:'x57',x65:'x66',x77:'x71',x117:'x22',x132:'x128',x133:'x128',x134:'x128',x138:'x137',x143:'x229',x146:'x145',x151:'x149',x157:'x156',x161:'x240',x163:'x335',x180:'x176',x185:'x247',x186:'x187',x191:'x188',x231:'x229',x232:'x94',x233:'x60',x235:'x174',x255:'x202',x257:'x49',x258:'x41',x303:'x15',x305:'x92',x306:'x44',x307:'x158',x308:'x162',x309:'x69',x310:'x315',x311:'x66',x312:'x67',x313:'x69',x314:'x315',x316:'x66',x317:'x67',x318:'x149',x319:'x69',x320:'x315',x322:'x130',x325:'x188',x327:'x335',x328:'x335',x329:'x335',x330:'x335',x331:'x335',x332:'x335',x333:'x335',x334:'x335',x337:'x335',x338:'x335',x339:'x149',x265:'x88',x214:'x213',x211:'x212'};\n";
let s = fs.readFileSync(F, 'utf8');
const pairs = [...ORIGINAL.matchAll(/(x\d+):'(x\d+)'/g)];
for (const id of DROP) if (!pairs.some((p) => p[1] === id)) throw new Error(id + ' is not a link');
const LINE = 'var EX_DEMO_OF={' + pairs.filter((p) => !DROP.has(p[1])).map((p) => `${p[1]}:'${p[2]}'`).join(',') + '};\n';
const [a, b] = undo ? [NOTE + LINE, ORIGINAL] : [ORIGINAL, NOTE + LINE];
if (s.split(a).length !== 2) throw new Error((undo ? 'undo' : 'apply') + ': expected the line once, found ' + (s.split(a).length - 1));
s = s.replace(a, () => b);
fs.writeFileSync(F, s);
console.log(undo ? 'restored' : `unlinked ${DROP.size} (${EQUIPMENT.length} equipment, ${NAME.length} name), kept ${pairs.length - DROP.size} of ${pairs.length}`);
