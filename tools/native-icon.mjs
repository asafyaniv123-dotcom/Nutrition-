/* The iPhone app's icon is the brand's App Store icon (brand/app-store-1024.png:
 * the white Olimei sun on the sunrise gradient, 1024, no alpha - Asaf's choice on
 * 27 Oct, after Mip on cream (25 Oct) and the orange sun on cream (23 Oct)).
 * Copied at build time so the shell never drifts from the brand. The
 * Beem-rendered icon (tools/make-app-icon.mjs) is retired. */
import fs from 'fs';
const SRC = 'brand/app-store-1024.png', OUT = 'native/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
const b = fs.readFileSync(SRC);
if (b.readUInt32BE(16) !== 1024 || b.readUInt32BE(20) !== 1024 || b[25] !== 2) { console.log('the brand icon is not 1024 RGB without alpha'); process.exit(1); }
fs.copyFileSync(SRC, OUT);
console.log('icon <- ' + SRC);
