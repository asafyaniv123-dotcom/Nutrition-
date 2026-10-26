/* The plates' slide-on played the moment the page was built, while its card
 * was still hidden waiting to enter - so by the time it was seen, they were
 * already on. They now wait: paused until the card's entrance begins, then
 * slide on one after another as in the prototype. */
import fs from 'fs';
for (const F of ['dev/index.html', 'tools/prg.css', 'tools/prg.js']) {
  let s = fs.readFileSync(F, 'utf8'), n = 0;
  const R = [
    [`.prg .plate{animation:prg-slide .7s cubic-bezier(.22,.61,.36,1) both;animation-delay:calc(var(--d) + 500ms)}`,
     `.prg .plate{animation:prg-slide .7s cubic-bezier(.22,.61,.36,1) both;animation-delay:calc(var(--d) + 500ms);animation-play-state:paused}
.prg .card.entered .plate{animation-play-state:running}`],
    [`    c.style.transition='opacity .5s ease,transform .7s cubic-bezier(.22,.61,.36,1)';c.style.opacity='1';c.style.transform='none';`,
     `    c.style.transition='opacity .5s ease,transform .7s cubic-bezier(.22,.61,.36,1)';c.style.opacity='1';c.style.transform='none';c.classList.add('entered');`],
  ];
  for (const [a, b] of R) if (s.includes(a)) { s = s.split(a).join(b); n++; }
  fs.writeFileSync(F, s); console.log(F, n);
}
