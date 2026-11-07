// node tools/sheets/hf-upload.mjs <list.txt> - each line "<file> <presigned-url>" (from media_upload); PUTs them
// all, file paths relative to the current folder. Then media_confirm each id. Upload with this, not curl: the
// shell mangles the long signed URL.
import { readFile } from 'node:fs/promises'; import path from 'node:path';
const lines = (await readFile(process.argv[2], 'utf8')).split(/\r?\n/).filter((l) => l.trim());
for (const l of lines) {
  const [file, url] = l.trim().split(/\s+/);
  const r = await fetch(url, { method: 'PUT', headers: { 'content-type': file.endsWith('.mp4') ? 'video/mp4' : file.endsWith('.jpg') ? 'image/jpeg' : 'image/png', 'if-none-match': '*' }, body: await readFile(path.resolve(file)) });
  console.log(r.status, file);
}
