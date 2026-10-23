/* The keys Apple requires before a WKWebView may ask for the camera, the
 * microphone or the photo library - without them the app is killed the
 * moment it asks - and the export-compliance answer, so App Store Connect
 * stops asking on every upload. Portrait only, like the app. Idempotent. */
import fs from 'fs';
const F = 'native/ios/App/App/Info.plist';
let s = fs.readFileSync(F, 'utf8');
const add = (k, v) => { if (s.includes('<key>' + k + '</key>')) return; s = s.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${k}</key>\n\t${v}\n</dict>\n</plist>\n`); };
add('NSCameraUsageDescription', '<string>Better Me uses the camera to photograph your meals, scan barcodes and add clothes to your closet.</string>');
add('NSMicrophoneUsageDescription', '<string>Better Me uses the microphone when you speak instead of typing - a meal, a task, a thought for the day.</string>');
add('NSPhotoLibraryUsageDescription', '<string>Better Me lets you pick photos for your meals, your day and your closet.</string>');
add('NSPhotoLibraryAddUsageDescription', '<string>Better Me can save your day cards and backups to your photos.</string>');
add('ITSAppUsesNonExemptEncryption', '<false/>');
s = s.replace(/(<key>UISupportedInterfaceOrientations<\/key>\s*<array>)[\s\S]*?(<\/array>)/, '$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2');
fs.writeFileSync(F, s);
console.log('Info.plist ready');
