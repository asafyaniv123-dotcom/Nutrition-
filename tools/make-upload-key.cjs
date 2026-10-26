/* The Android UPLOAD key, made once, on this machine, and kept OUT of the repo.
 * A PKCS#12 keystore (Java and Gradle read it as a keystore) holding one RSA
 * 2048 key and a self-signed certificate valid for 30 years, with a random
 * password. Google re-signs the app with its own key (Play App Signing); this
 * one only proves an upload came from us, and Google can reset it if lost.
 *
 *   node tools/make-upload-key.cjs <dir-with-node-forge> <out-dir>
 * Writes <out-dir>/olimei-upload.p12 and <out-dir>/olimei-upload.txt (alias and
 * password). Refuses to overwrite. Nothing is printed but the paths. */
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const forge = require(path.join(process.argv[2], 'node_modules', 'node-forge'));
const out = process.argv[3];
const P12 = path.join(out, 'olimei-upload.p12'), TXT = path.join(out, 'olimei-upload.txt');
if (fs.existsSync(P12)) { console.log('exists, not touched: ' + P12); process.exit(0); }
fs.mkdirSync(out, { recursive: true });
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01' + crypto.randomBytes(8).toString('hex');
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date(); cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30);
const attrs = [{ name: 'commonName', value: 'Olimei upload' }, { name: 'organizationName', value: 'Olimei' }, { name: 'countryName', value: 'IL' }];
cert.setSubject(attrs); cert.setIssuer(attrs);
cert.sign(keys.privateKey, forge.md.sha256.create());
const pass = crypto.randomBytes(18).toString('base64url'), alias = 'olimei-upload';
const p12 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], pass, { algorithm: '3des', friendlyName: alias });
fs.writeFileSync(P12, Buffer.from(forge.asn1.toDer(p12).getBytes(), 'binary'));
fs.writeFileSync(TXT, 'Olimei Android upload key - keep this file and the .p12 together, and private.\n' +
  'Codemagic > Code signing identities > Android keystores > reference name: olimei_upload\n' +
  'Keystore password: ' + pass + '\nKey alias: ' + alias + '\nKey password: ' + pass + '\n');
console.log('written: ' + P12 + '\nwritten: ' + TXT);
