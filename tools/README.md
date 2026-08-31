# tools

## build-foods.mjs

Turns the Ministry of Health's food composition table into `data/foods.json`,
the database the app searches.

```
# once: download the CSV by hand - the portal's download host is behind a
# Google sign-in, so curl and every other script gets a login page.
#   https://data.gov.il/he/datasets/ministry-health/nutrition-database
#   the first resource: "רשימת המצרכים והמתכונים עם רכיבי התזונה ל 100 גרם"
# save it as data/moh_mitzrachim.csv, then:

node tools/build-foods.mjs
```

The source is 85 columns of which we keep six, and **every value in it is
already per 100 g** - that is why this file was chosen over the alternatives.
Rows are dropped only when they cannot be read: 15 records in the 2022 file
carry unescaped quotes and newlines inside the name and break the row apart,
and 2 more are missing one of the four numbers. Everything else is kept.

The raw CSV is not committed (see .gitignore); `data/foods.json` is, because
it is what ships.

## vendor/html5-qrcode.min.js

The barcode scanner. Vendored rather than loaded from a CDN so the app keeps
working on a poor connection and carries no runtime dependency on a third
party staying up. Safari has no `BarcodeDetector` and shows no sign of
getting one, which is why a JS decoder is needed at all.

```
version : html5-qrcode 2.3.8
source  : https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js
size    : 375,364 bytes
sha256  : 660b12437b1d747e3e68b8be0685c08cb728140110ad213f167b14b66f8b1d8e
```

It is loaded only when the scan button is pressed, never at startup. To
update it, fetch the new version, record its size and hash here, and check
that `Html5Qrcode` and `Html5QrcodeSupportedFormats` are still the globals it
exposes.

Barcodes are looked up in Open Food Facts (`world.openfoodfacts.org/api/v2`),
which is CORS-open so the page calls it directly. Their data is ODbL: the
confirm panel credits them on every scanned result.
