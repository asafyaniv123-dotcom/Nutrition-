# Getting Better Me onto the App Store

Written 15 Sep 2026, during the freeze, so that the technical path is chosen
from evidence rather than decided under time pressure in October.

Everything here is either **measured from this repository** or **sourced**.
Where it is a community report rather than Apple's own word, it says so —
because the two disagree badly on the one number that matters most.

---

## 0 · Where this stands

**Enrolment submitted and paid: 16 September 2026, 16:49.** Individual,
identity verified in the Apple Developer app by scanning the ID, which is the
faster of the two routes. Status: processing. The Enrollment ID is not
recorded here on purpose — this repository is public.

**The clock §1 asked for is now running on our own case.** Apple says 24–48
hours; community reports say two to seven weeks. On 23 Sep, whatever has or
has not happened by then is a measured number rather than an argument.

**The choice in §5 is made, and he made it: B.**

> *"אני יודע שאני רוצה שהאפליקציה תוכל להיות מותקנת בכל טלפון בעולם"*

That is the business question §5 said only he could answer, answered. A is
out. C was already written off on the evidence. What remains is a wrapper —
and the one engineering consequence is §4: **the evening reminder has to be
rebuilt on native push**, because Web Push does not exist inside a WKWebView
and that reminder is the spine of the habit loop.

**"Every phone in the world" is two stores, not one.** Checked against
Google's own documentation on 16 Sep and written up in §7. The short version:
Play costs $25 once against Apple's $99 a year, and its gate is not money or
a queue — it is **twelve real people for fourteen continuous days**. That is
the harder of the two constraints to satisfy right now, and it is the one
nobody would have budgeted for.

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

**DECIDED 16 Sep 2026: B.** Asked, he answered that he wants the app
installable on any phone in the world — which rules out A by definition rather
than by argument. See §0. The push rewrite in §4 is therefore no longer a
hypothetical cost; it is scheduled work, and it belongs on the 23 Sep agenda.

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

## 7 · Google Play — verified 16 Sep 2026

Checked against Google's own Play Console Help pages, not the guide sites,
because the guide sites agree with each other and disagree with Google on the
one thing that affects privacy.

### The money is the easy part

**$25, once, with no annual renewal** — against Apple's $99 every year. Over
five years that is $25 against $495. Money is not the constraint here.

### The constraint is twelve people for fourteen days

A **personal** Play account created after **13 November 2023** — ours would be
— must "run a closed test for their app with a minimum of **12 testers who
have been opted in continuously for at least 14 days**" before it may even
*apply* for production access
([Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465)).

Three details that decide whether the clock actually runs:

- **Opted in means installed.** A tester who accepted the invite but never
  installed does not count.
- **The fourteen days are continuous.** Google: "Testers who opt in, test for
  fewer than 14 days, and then opt out do not count toward the requirement."
  Opting out and back in resets the counter.
- **Then it is an application, not a switch.** Three sections of questions
  about the closed test, the app, and production readiness. "Review usually
  takes seven days or less, but can occasionally take longer."

It was twenty testers until 11 December 2024 and is twelve now
([Testers Community](https://www.testerscommunity.com/blog/google-play-closed-testing-requirements-2026)) —
a community figure, recorded as such.

**So the two stores fail in opposite ways.** Apple's wait is long, opaque and
asks nothing of us. Google's is short, published and asks for **twelve people
who will keep the app installed for a fortnight**. On 25 Sep we have one user.
That is the real Play blocker, and it is a people problem rather than an
engineering one.

**Apple has no equivalent gate.** TestFlight takes up to 10,000 testers with
no minimum and no waiting period, which means the fastest route to "installed
on someone's phone" is Apple's, not Google's — and it does not require the
public listing at all.

### Two findings from checking, neither of them in the original claim

**The stage name he asked about is possible on Play and not on Apple.** The
Play developer name is a name you CHOOSE, "shown on Google Play to identify
your developer profile and apps", while legal name and physical address are
collected for verification and are **not** publicly displayed
([Play Console Help](https://support.google.com/googleplay/android-developer/answer/13634081)).
Apple's individual enrolment shows the legal name and needs registered
documentation for a trade name. So the same app could ship as *Better Me* by a
chosen name on Play and by *Asaf Yaniv* on the App Store, and that asymmetry is
worth knowing before either listing is written.

**But that reverses the moment the app charges money.** Google's own page says
a merchant account — one monetising through paid apps or in-app purchases —
must show its "full address on Google Play", taken from the payments profile.
For a personal account that is a **home** address. An organization account can
use a business address instead.

So: free with no purchases, nothing personal is published. Charge anything, and
a personal Play account publishes where he lives. **If this app is ever going
to charge, the Play account should be an organization from the start rather
than migrated later.** That is a decision worth making before $25 is spent, not
after — it costs nothing today and is awkward to undo.

Verification for a personal account needs a government ID and a document
proving the address; **no D-U-N-S number**, which is an organization
requirement on Play as it is on Apple
([Play Console Help](https://support.google.com/googleplay/android-developer/answer/10841920)).

### What this means for the schedule

1. **Nothing about Play is urgent the way Apple's queue was.** There is no
   long opaque wait to get in front of.
2. **But the fourteen-day clock cannot be shortened**, and it cannot start
   before there is an Android build to install — which is the Capacitor work
   in §5 B, which is after the freeze.
3. **Twelve testers is the thing to start thinking about now**, because it is
   the only item on this page that depends on other people.

---

## Sources

- [Apple — Program Enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- [Apple Developer Forums — enrolment stuck](https://developer.apple.com/forums/thread/822540)
- [Apple Developer Forums — web push in WKWebView](https://developer.apple.com/forums/thread/760767)
- [Lance — Apple Developer enrolment timing](https://www.lance.app/guides/apple-developer-enrollment)
- [MobiLoud — webview wrappers and the review guidelines](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper)
- [MobiLoud — publishing a PWA to the stores](https://www.mobiloud.com/blog/publishing-pwa-app-store/)
- [Play Console Help — testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Play Console Help — developer account information, what is shown publicly](https://support.google.com/googleplay/android-developer/answer/13634081)
- [Play Console Help — verify your developer identity](https://support.google.com/googleplay/android-developer/answer/10841920)
- [Play Console Help — contact information requirements](https://support.google.com/googleplay/android-developer/answer/10840893)
- [Testers Community — the 20-to-12 change, December 2024](https://www.testerscommunity.com/blog/google-play-closed-testing-requirements-2026)
- [MagicBell — PWA iOS limitations](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [DEV — Capacitor push notifications](https://dev.to/saltorgil/the-complete-guide-to-capacitor-push-notifications-ios-android-firebase-bh4)
