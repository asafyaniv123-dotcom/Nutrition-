// node tools/sheets/hf-download.mjs <url> <out-file> - download one Higgsfield result (curl downloads are blocked here)
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
const [url, out] = process.argv.slice(2);
if (!/^https:\/\/d8j0ntlcm91z4\.cloudfront\.net\//.test(url)) throw new Error('only Higgsfield results');
const r = await fetch(url);
if (!r.ok) throw new Error(r.status + ' ' + url);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(await r.arrayBuffer()));
console.log(out);
