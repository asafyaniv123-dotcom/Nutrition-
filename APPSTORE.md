# Getting Better Me onto the App Store

Written 15 Sep 2026, during the freeze, so that the technical path is chosen
from evidence rather than decided under time pressure in October.

Everything here is either **measured from this repository** or **sourced**.
Where it is a community report rather than Apple's own word, it says so —
because the two disagree badly on the one number that matters most.

---

## 1 · Start the enrolment today. This is the finding that cannot wait.

Apple's own enrolment page says confirmation arrives within **24–48 hours**
([Apple](https://developer.apple.com/help/account/membership/program-enrollment/)).

**Community reports through 2026 say otherwise: two to seven weeks is common,
with no communication, and individual enrolments stuck in "processing" beyond
nine weeks**
([Lance](https://www.lance.app/guides/apple-developer-enrollment),
[Apple Developer Forums](https://developer.apple.com/forums/thread/822540)).

The roadmap already said *"it must not be the thing we are waiting on in
October"* and told us to check the number rather than trust it. Checked, and
the number is worse than the line assumed. **$99/year, and at the bad end of
the range an enrolment begun on 16 September clears in November.**

A name that does not match your government ID exactly — even a formatting
difference — triggers a photo-ID request and adds time. Enter it exactly as it
appears on the document.

**This costs nothing to be early about and a month to be late about. It is the
only thing on this page with a deadline.**

---

## 2 · What is actually being shipped

Measured from `dev/index.html`, not estimated:

| | |
|---|---|
| the app | **25,002 lines, 1,335 KB**, one file |
| of which the game | 1,134 lines, its own standalone document |
| `sw.js` | 99 lines — permission surface and web push receiver, no caching, deliberately |
| the server | `push-server/` — a Cloudflare Worker, 1,424 lines, eight endpoints |

And the platform capabilities it already uses, counted:

| capability | uses |
|---|---|
| localStorage | 146 |
| canvas drawing | 37 |
| photo files from disk | 36 |
| camera / video capture | 14 |
| file download / export | 10 |
| barcode decoding | 9 |
| web push (PushManager / VAPID) | 8 in the app, 3 in `sw.js` |
| clipboard | 6 |
| share sheet | 5 |
| vibration / haptics | 4 |
| notifications | 3 |
| IndexedDB | the photo store |
| wake lock | 2 |

And steps arrive from four sources already: `health`, `server`, `manual`,
`shortcut`. **There is already a health-data path**, which matters in §3.

---

## 3 · Guideline 4.2 — will a wrapper be rejected?

Apple: *"Your app should include features, content, and UI that elevate it
beyond a repackaged website. If your app is not particularly useful, unique,
or 'app-like,' it doesn't belong on the App Store."* A site inside a web view
is what Apple calls a **web clipping**, and the standard rejection reads
*"not sufficiently different from a mobile web browsing experience"*
([MobiLoud](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper),
[MobiLoud](https://www.mobiloud.com/blog/publishing-pwa-app-store/)).

**The pattern that passes** is two or three substantive native capabilities
that genuinely belong to the product — push, offline, camera, biometrics,
widgets — plus reviewer notes pointing at them.

**Better Me is unusually well placed for that test**, and not by contrivance:
the camera, the photo library, the barcode scanner, offline-by-default
storage, haptics and a health-data path are all things it already does because
the product needs them. That is a stronger position than most wrapped sites,
which have to bolt a capability on to pass.

**But "well placed" is not "safe."** Each rejection–resubmission cycle costs
days to weeks, and the reviewer decides on what they see.

---

## 4 · The load-bearing constraint nobody would find until it broke

**Web Push does not work inside a WKWebView. There is no Service Worker and no
PushManager**
([Apple Developer Forums](https://developer.apple.com/forums/thread/760767),
[MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)).

That is not a detail. **The evening reminder is the spine of this app's habit
loop** — סיום יום is the thing the other areas feed, and the reminder is what
starts it. In a wrapper it stops arriving.

So a wrapper is not "ship the same app in a shell". It is: keep the app, and
**replace the entire push path** — `sw.js`, the VAPID subscription, and the
Worker's `/subscribe` half — with native APNs, typically through
`@capacitor-firebase/messaging`
([DEV](https://dev.to/saltorgil/the-complete-guide-to-capacitor-push-notifications-ios-android-firebase-bh4)).

The rest of the capability list survives: camera, IndexedDB, canvas, files and
haptics all work in a WKWebView.

---

## 5 · The three paths, with what each actually costs

### A · Stay a PWA. Ship nothing to the App Store.
**Cost: zero.** Push already works on iOS 16.4+ for a PWA installed to the
home screen — which is exactly how it is installed today.
**What it gives up:** discovery, and the legitimacy of being in a store. It
does not give up any capability the app currently uses.
**Honest note:** this is the only option where nothing can be rejected.

### B · Wrapper (Capacitor).
**Keeps:** the one file, the whole codebase, every future change shipping to
both platforms at once.
**Costs:** rewriting the push path to native; a Guideline 4.2 review the app
is well placed for but not guaranteed to pass; and a native build toolchain to
maintain — which needs a Mac.
**Estimate:** the push rewrite is days. The review is unpredictable, and the
rejection cycle is the real schedule risk.

### C · Rewrite native.
**Costs:** 25,000 lines, eleven languages, a food database, a barcode scanner,
a flood-fill wardrobe cut-out, a game, and three months of design decisions
that live in this file's comments. **Then it has to be maintained twice.**
**Gains:** nothing the product currently needs that B does not also give.

**On the evidence here, C is not a real option and should be written off
rather than left open.** The choice is between A and B, and it is a business
question — reach — not a technical one.

---

## 6 · What to do next, in order

1. **Today or tomorrow: start the enrolment.** Name exactly as the ID. It has
   the longest lead time by a wide margin and it blocks everything in B.
2. **Wait for the freeze to end before touching code.** Nothing in §5 requires
   a line of app code this week.
3. **On 23 Sep, decide A or B** — by then the enrolment's real speed is known,
   and the week of notes will have said whether the product is ready to be
   shown to anyone at all.
4. The listing — icon, screenshots, description, privacy policy — is only
   worth writing after that decision. The privacy story is genuinely easy and
   should be said plainly: **everything stays on the device**, and the only
   thing that leaves it is a food description sent to be identified.

---

## Sources

- [Apple — Program Enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- [Apple Developer Forums — enrolment stuck](https://developer.apple.com/forums/thread/822540)
- [Apple Developer Forums — web push in WKWebView](https://developer.apple.com/forums/thread/760767)
- [Lance — Apple Developer enrolment timing](https://www.lance.app/guides/apple-developer-enrollment)
- [MobiLoud — webview wrappers and the review guidelines](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper)
- [MobiLoud — publishing a PWA to the stores](https://www.mobiloud.com/blog/publishing-pwa-app-store/)
- [MagicBell — PWA iOS limitations](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [DEV — Capacitor push notifications](https://dev.to/saltorgil/the-complete-guide-to-capacitor-push-notifications-ios-android-firebase-bh4)
