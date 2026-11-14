// node tools/sheets/hf-upload.mjs <list.txt> - each line "<file> <presigned-url>" (from media_upload); PUTs them
// all, file paths relative to the current folder. Then media_confirm each id. Upload with this, not curl: the
// shell mangles the long signed URL. Over node:https with an explicit content-length: fetch() sent some files
// without it and the upload host closed the socket after the last byte, three times in a row (x188, 14 Nov).
import { readFile } from 'node:fs/promises'; import path from 'node:path'; import https from 'node:https';
const lines = (await readFile(process.argv[2], 'utf8')).split(/\r?\n/).filter((l) => l.trim());
for (const l of lines) {
  const [file, url] = l.trim().split(/\s+/);
  const body = await readFile(path.resolve(file));
  const type = file.endsWith('.mp4') ? 'video/mp4' : file.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  await new Promise((ok) => {
    const rq = https.request(url, { method: 'PUT', headers: { 'content-type': type, 'content-length': body.length, 'if-none-match': '*' } },
      (rs) => { rs.resume(); rs.on('end', () => { console.log(rs.statusCode, file); ok(); }); });
    rq.on('error', (e) => { console.log('ERR', file, e.message); process.exitCode = 1; ok(); });
    rq.end(body);
  });
}
