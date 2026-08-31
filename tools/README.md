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
