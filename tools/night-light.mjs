/* "Lighter only looks faded" (20 Oct 2026): three ways to make the night
 * less heavy without washing it out, and the two first ones together.
 * Drawn over the shipped night by tools/shoot-home.mjs --ideas-file. */
const N = 'html body.mod-home.tod-night';

/* 1: the lamp lights the room - a wide pool of light round the dial, the
   edges of the screen left as dark as they are now */
const LAMP = `
${N} #home-screen{background:
  radial-gradient(90% 52% at 50% 37%,rgba(160,190,230,.36) 0,rgba(135,165,212,.2) 34%,rgba(115,135,175,.08) 58%,transparent 78%),
  var(--nu-ground)}
${N} .hdial{background:radial-gradient(circle at 50% 50%,rgba(130,176,230,.4) 0,rgba(120,168,226,.18) 36%,transparent 68%),var(--nu-ground)}
`;
/* 2: what stands in the room is lighter than the room - the dial, the
   discs, the pills and the bar a step above the ground, their top edges lit */
const RAISED = `
${N} .hdial,${N} .hnext,${N} .hcmd-go,${N} .hcmd-in,${N} .tabbar,${N} .home-menu{--nu-ground:#443d38;--nu-lit:rgba(255,238,218,.16)}
${N} .hdisc-ic{--nu-ground:#504843;--nu-lit:rgba(255,238,218,.2)}
${N} .hdial .chub{--nu-ground:#2c2724}
`;
/* 3: colour instead of grey - a deep plum room; deep is still night */
const PLUM = `
${N}{--nu-ground:#2f2433;--nu-ink:#f2e8f0;--nu-muted:#bfaebf;--nu-lit:rgba(250,226,250,.08)}
${N} .rim-ch{stroke:#251c29}
${N} .rim-tk{stroke:#6a5a6c}
${N} .hdial-n{fill:#9a879b}
`;
export const IDEAS = {
  lamp: { css: LAMP, js: '' },
  raised: { css: RAISED, js: '' },
  plum: { css: PLUM, js: '' },
  both: { css: LAMP + RAISED, js: '' },
};
