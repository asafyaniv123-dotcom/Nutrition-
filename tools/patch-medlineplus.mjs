/* The coach reads MedlinePlus (Asaf, 25 Oct: "build the connection").
 * When the person has shared a condition with the coach, the worker fetches
 * that condition's MedlinePlus health-topic summary - written by the U.S.
 * National Library of Medicine for the public, free, no key - and hands it to
 * the model as reference, with the rule to cite it by name and link when it
 * leans on it. Cached in KV for a week, so a conversation costs no lookups
 * and the service's rate limit (85 a minute) is never near. If the service
 * is down the coach answers as before, without it. */
import fs from 'fs';
const W = 'push-server/src/worker.js';
let w = fs.readFileSync(W, 'utf8');
const rep = (a, b) => { if (w.split(a).length !== 2) { console.log('ANCHOR', a.slice(0, 70)); process.exit(1); } w = w.replace(a, b); };
rep(`      const health = (Array.isArray(b && b.health) ? b.health : []).filter((x) => HL[x]).map((x) => HL[x]);`,
`      const healthIds = (Array.isArray(b && b.health) ? b.health : []).filter((x) => HL[x]).slice(0, 7);
      const health = healthIds.map((x) => HL[x]);
      /* MedlinePlus, the National Library of Medicine's public health topics:
         one summary per shared condition, cached a week in KV */
      const medline = [];
      for (const id of healthIds.slice(0, 3)) {
        const key = 'mlp:' + id;
        let got = null;
        try { got = await env.SUBS.get(key, 'json'); } catch {}
        if (!got) {
          try {
            const r = await fetch('https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&retmax=1&term=' + encodeURIComponent(HL[id]),
              { headers: { 'User-Agent': 'Olimei/0.1 (personal health app)' } });
            if (r.ok) {
              const x = await r.text();
              const doc = (x.match(/<document[^>]*url="([^"]+)"[\\s\\S]*?<\\/document>/) || []);
              const pick = (name) => { const m = (doc[0] || '').match(new RegExp('<content name="' + name + '">([\\\\s\\\\S]*?)</content>')); return m ? m[1] : ''; };
              const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
              const text = (s) => unesc(s).replace(/<\\/(p|li|h\\d)>/g, '\\n').replace(/<[^>]+>/g, '').replace(/[ \\t]+/g, ' ').replace(/\\n\\s*\\n+/g, '\\n').trim();
              if (doc[1]) {
                got = { title: text(pick('title')), url: doc[1], summary: text(pick('FullSummary')).slice(0, 2400) };
                try { await env.SUBS.put(key, JSON.stringify(got), { expirationTtl: 7 * 86400 }); } catch {}
              }
            }
          } catch {}
        }
        if (got && got.summary) medline.push(got);
      }`);
rep(`      const SYS = health.length ? SYSTEM + '\\n\\n## Health conditions the user chose to share\\n' + health.join(', ') +`,
    `      const MLP = medline.length ? '\\n\\n## Reference: MedlinePlus (U.S. National Library of Medicine)\\nUse this as your factual basis on these conditions. When your answer relies on it, name the source as MedlinePlus and give the link once, at the end. Do not quote it at length; explain in the user\\'s language.\\n' +
        medline.map((m) => '### ' + m.title + ' (' + m.url + ')\\n' + m.summary).join('\\n\\n') : '';
      const SYS = health.length ? SYSTEM + MLP + '\\n\\n## Health conditions the user chose to share\\n' + health.join(', ') +`);
fs.writeFileSync(W, w);
console.log('ok');
