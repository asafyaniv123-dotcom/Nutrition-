// node tools/sheets/scan-demos.mjs <index.html> <exercises.json> <assetsDir> - every library row: its demo id (own or via EX_DEMO_OF), the mp4
//   exists, is non-empty and DECODES end to end with ffmpeg (a file that exists but will not play is not a demo). Lists every row
//   that has no live demo with its name. Exit 1 on any broken link.
import fs from 'node:fs'; import vm from 'node:vm'; import os from 'node:os'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const FF = path.join(os.tmpdir(), 'fftool/node_modules/ffmpeg-static/ffmpeg.exe');
const [HTML, EXJ, ASSETS] = process.argv.slice(2);
const s = fs.readFileSync(HTML, 'utf8');
const ex = s.match(/var EX_DEMO=\{[\s\S]*?\};/)[0], of = s.match(/var EX_DEMO_OF=\{[^}]*\};/)[0], fn = s.match(/function exDemoId\(e\)\{[^\n]*\}/)[0];
const c = {}; vm.runInNewContext(ex + of + fn + ';this.f=exDemoId;this.D=EX_DEMO;', c);
const L = JSON.parse(fs.readFileSync(EXJ, 'utf8')).exercises;
let own = 0, alias = 0; const none = [], broken = [], checked = new Map();
for (const e of L) {
  const id = c.f(e);
  if (!c.D[id]) { none.push(e); continue; }
  if (!checked.has(id)) {
    const p = `${ASSETS}/${id}.mp4`; let ok = fs.existsSync(p) && fs.statSync(p).size > 1000;
    if (ok) try { execFileSync(FF, ['-v', 'error', '-i', p, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch { ok = false; }
    checked.set(id, ok);
  }
  if (!checked.get(id)) broken.push(`${e.id}->${id}`);
  else if (id === e.id) own++; else alias++;
}
console.log(`${HTML}: rows ${L.length} | own demo ${own} | via EX_DEMO_OF ${alias} | no demo ${none.length} | broken ${broken.length} ${broken.join(' ')} | mp4 decoded ${checked.size}`);
for (const e of none) console.log(`  ${e.id}\t${(e.t && e.t.en) || ''}\t${e.n}`);
if (broken.length) process.exit(1);
