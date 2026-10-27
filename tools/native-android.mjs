/* The Android shell, dressed: the sunrise icon (27.10: brand/android-foreground-432.png
 * is the gradient full-bleed with the white sun inside the safe zone, so the
 * orange behind it only shows if a launcher ever lets it), the cream
 * behind the splash, a one-colour notification icon (Android paints a small
 * icon white, so a coloured one becomes a white square), and release signing
 * read from the environment Codemagic provides. Run after `npx cap add
 * android`, and on every build - it only writes, it never asks.
 *
 *   node tools/native-android.mjs [path/to/android-icons.json]
 *   (with the JSON, first writes brand/android-*.png from it) */
import fs from 'fs';
import path from 'path';
const R = 'native/android/app/src/main/res', CREAM = '#ff7a1a', SPLASH = '#ece3d4';
const j = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : null;
if (j) for (const [k, f] of [['fg', 'android-foreground-432.png'], ['sq', 'android-legacy-192.png'], ['round', 'android-round-192.png']])
  fs.writeFileSync('brand/' + f, Buffer.from(j[k].split(',')[1], 'base64'));
if (!fs.existsSync(R)) { console.log('no Android project - run `cd native && npx cap add android` first'); process.exit(1); }
/* icons: one density, the largest; Android scales down */
for (const d of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'])
  for (const f of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) { const p = `${R}/mipmap-${d}/${f}`; if (fs.existsSync(p)) fs.unlinkSync(p); }
fs.copyFileSync('brand/android-foreground-432.png', `${R}/mipmap-xxxhdpi/ic_launcher_foreground.png`);
fs.copyFileSync('brand/android-legacy-192.png', `${R}/mipmap-xxxhdpi/ic_launcher.png`);
fs.copyFileSync('brand/android-round-192.png', `${R}/mipmap-xxxhdpi/ic_launcher_round.png`);
fs.writeFileSync(`${R}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${CREAM}</color>\n    <color name="olimei_ground">${SPLASH}</color>\n</resources>\n`);
fs.writeFileSync(`${R}/mipmap-anydpi-v26/ic_launcher_round.xml`, fs.readFileSync(`${R}/mipmap-anydpi-v26/ic_launcher.xml`));
/* the splash: the app's own ground, nothing on it - the app draws its own */
for (const dir of fs.readdirSync(R)) if (dir.startsWith('drawable')) { const p = `${R}/${dir}/splash.png`; if (fs.existsSync(p)) fs.unlinkSync(p); }
fs.writeFileSync(`${R}/drawable/splash.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android"><solid android:color="@color/olimei_ground"/></shape>\n`);
let st = fs.readFileSync(`${R}/values/styles.xml`, 'utf8');
if (!st.includes('windowSplashScreenBackground'))
  st = st.replace(`<item name="android:background">@drawable/splash</item>`, `<item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">@color/olimei_ground</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>`);
fs.writeFileSync(`${R}/values/styles.xml`, st);
/* the small notification icon: Mip's sun as a silhouette - a disc and his ring of beads */
let dots = '';
for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, x = (12 + 8.6 * Math.cos(a)).toFixed(2), y = (12 + 8.6 * Math.sin(a)).toFixed(2);
  dots += `    <path android:fillColor="#FFFFFFFF" android:pathData="M${(+x - 1.3).toFixed(2)},${y}a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0"/>\n`; }
fs.writeFileSync(`${R}/drawable/ic_stat_olimei.xml`, `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
    <path android:fillColor="#FFFFFFFF" android:pathData="M6.8,12a5.2,5.2 0 1,0 10.4,0a5.2,5.2 0 1,0 -10.4,0"/>
${dots}</vector>
`);
/* release signing from Codemagic's keystore variables, and the build number from the command line */
const G = 'native/android/app/build.gradle';
let g = fs.readFileSync(G, 'utf8');
if (!g.includes('CM_KEYSTORE_PATH')) {
  g = g.replace(/defaultConfig \{/, `signingConfigs {
        release {
            if (System.getenv("CM_KEYSTORE_PATH")) {
                storeFile file(System.getenv("CM_KEYSTORE_PATH"))
                storePassword System.getenv("CM_KEYSTORE_PASSWORD")
                keyAlias System.getenv("CM_KEY_ALIAS")
                keyPassword System.getenv("CM_KEY_PASSWORD")
            }
        }
    }
    defaultConfig {`);
  g = g.replace(/versionCode \d+/, `versionCode (project.findProperty("versionCode") ?: "1").toInteger()`);
  g = g.replace(/versionName "[^"]*"/, `versionName (project.findProperty("versionName") ?: "1.0")`);
  g = g.replace(/buildTypes \{\s*release \{/, `buildTypes {
        release {
            signingConfig signingConfigs.release`);
  fs.writeFileSync(G, g);
}
/* the app's name and colours in capacitor.config.json, for both shells */
const C = 'native/capacitor.config.json', c = JSON.parse(fs.readFileSync(C, 'utf8'));
c.android = Object.assign({}, c.android, { backgroundColor: SPLASH });
c.plugins = Object.assign({}, c.plugins, { LocalNotifications: { smallIcon: 'ic_stat_olimei', iconColor: '#f0a92e' } });
fs.writeFileSync(C, JSON.stringify(c, null, 2) + '\n');
console.log('android dressed');
