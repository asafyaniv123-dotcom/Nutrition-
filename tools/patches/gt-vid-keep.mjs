// node tools/patches/gt-vid-keep.mjs <index.html> [--undo] - Asaf, 20 Nov, from his phone: on the clock the demo stood still, one
//   frame of the loop held under the steps. The loop was started once, when its source was set, and nothing ever started it
//   again: whatever stopped it (the phone suspends a page's video on its own terms - a voice or a beep taking the audio, a
//   moment in the background) left it stopped for the rest of the exercise. Now every tick of the clock looks at it and starts
//   it again if it is standing, and the muting a phone requires before it will play by itself is set on the element, not only
//   written in the markup. --undo restores the file byte for byte.
import fs from 'node:fs';
const F = process.argv[2], undo = process.argv.includes('--undo');
const E = [
  [`  if(v.getAttribute('data-s')===src)return;
  v.setAttribute('data-s',src);
  if(src){v.src=src;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}`,
   `  /* the same loop already: if anything stopped it, start it again - this runs
     on every tick, so a loop the phone paused stands for a moment, not a set */
  if(v.getAttribute('data-s')===src){if(src&&v.paused){var pk=v.play();if(pk&&pk.catch)pk.catch(function(){});}return;}
  v.setAttribute('data-s',src);
  /* muted as a property too: a phone plays a video by itself only when it is
     muted, and markup written through innerHTML is not every engine's word */
  if(src){v.muted=true;v.defaultMuted=true;v.playsInline=true;v.src=src;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}`],
];
let s = fs.readFileSync(F, 'utf8');
for (const [o, n] of undo ? E.slice().reverse() : E) {
  const [a, b] = undo ? [n, o] : [o, n], c = s.split(a).length - 1;
  if (c !== 1) throw new Error(`${undo ? 'undo' : 'apply'}: expected 1 of ${JSON.stringify(a.slice(0, 60))}, found ${c}`);
  s = s.replace(a, () => b);
}
fs.writeFileSync(F, s);
console.log(undo ? 'undone' : 'applied');
