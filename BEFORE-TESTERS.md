# Before the testers start — what the shells need

Written by the statistics session on 23 Oct 2026 for the app session. Asaf's
decision: iPhone testers wait for **TestFlight**, not the web app; Android
testers come through Google Play's closed track. Most of his testers have
iPhones. The test is judged by ONE number — of the testers, how many closed
the day on at least 4 evenings of their second week (STATS.md) — so anything
that changes how often a person closes the day changes the result.

## 1. The evening reminder — BLOCKS the start

`native/` has no notifications. The web push the stable app uses cannot reach
a WKWebView, so a TestFlight tester gets **no evening reminder at all**, and
the number would measure the missing reminder rather than the product.

Suggested, not decided: `@capacitor/local-notifications`. The reminder is one
daily notification at the hour the person chose, so it needs no server, no
APNs key and no network:

- schedule it when the hour is set (and on every launch, in case it was lost);
- cancel today's when the day is closed, schedule tomorrow's — the web
  reminder already skips a closed day, and the native one must too;
- turning the reminder off cancels it;
- the permission text in Info.plist (`tools/native-plist.mjs`).

Only the stable path changes behaviour; dev and the web app keep web push.
Proven means a real iPhone showing it at the chosen hour, and NOT showing it
on a day that was closed first.

## 2. The usage ping from the shell — verified, one check left

Checked here: `node tools/native-www.mjs`, `native/www` served, every request
off the machine held. The shell's copy sends
`{"uid":…,"dev":false,"day":"2026-10-23","first":"2026-10-23","lang":"he","o":1,"s":false,"a":[]}`
after the CORS preflight, and the worker answers any origin (`*`), so
`capacitor://localhost` is fine. That was Chrome, not WKWebView: the last
check is the first TestFlight install appearing on `admin/usage.html`, and the
statistics session will watch for it.

## 3. Which platform a ping came from — NEEDS ASAF'S OK

Today a TestFlight tester and a web-app user look identical. Proposed: one
more field, `p: 'ios' | 'android' | 'web'` (from `Capacitor.getPlatform()`,
'web' when Capacitor is absent). Anonymous and content-free, but it widens
what is collected, so it waits for his yes. If he agrees, the app adds it to
`usageNote()` and the statistics session accepts it in `/ping` and shows it.

## 4. Every fix is a build now

`native/www` is a copy of the stable app inside the shell, not a page loaded
from the site. A fix reaches a TestFlight tester only after a release, a
Codemagic build, an upload, and the tester updating. Plan for it: a build
after each release during the test, and say in the WhatsApp group when one
lands. Each build also expires after 90 days.

## 5. Data does not move from the web app

The shell's storage is its own, separate from Safari. The first tester (web
app since 26 Sep) would start empty. The app has a backup export
("גיבוי Better Me"); check that the shell can IMPORT one before telling her
it carries over.

## 6. Android

The same shell for Android, on Google Play's closed track. The Play rule —
12 testers opted in for 14 consecutive days, for a personal developer
account — is counted by Google from its own opt-ins; nothing we measure
counts toward it. Only Android phones installed from Play count.
