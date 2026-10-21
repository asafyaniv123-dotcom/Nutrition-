# First run — what other apps do, and what Better Me needs

Research of 21 Oct 2026, three parallel passes (fitness; character/habit apps;
nutrition + general practice). Screen orders come mostly from third-party
teardowns (screensdesign, Revyl Atlas, Appcues GoodUX, Lazyweb, RevenueCat);
none of the apps was installed. Anything marked [unverified] was not confirmed
by a source. The Hebrew summary for Asaf is `review/onboarding-research/`.

## What the apps do

| App | Steps | Asks | Account / paywall | Notable |
|---|---|---|---|---|
| **Duolingo** | ~10 before the first lesson | language, level, why, daily goal (5–20 min), how you heard | account **after** the first lesson (≈ +20% DAU reported); paywall later | Duo narrates in speech bubbles; "Just 7 quick questions before your first lesson" sets the length up front; streak starts at day 1 |
| **Finch** | 45 | egg colour, bird's pronouns/name (pre-filled + shuffle), trait, user's name, ~15-screen survey | phone account at screen 3; 4-screen paywall | the bird asks *your* name and waves; notifications framed as "reminders from [bird]"; day-1 streak; goals pre-filled so home is never empty. Criticised: no progress bar, a long survey feeding a near-generic plan |
| **Headspace** | ~6 | experience, why, *when* — anchored to a routine ("after I wake up") | trial timeline before first session | "Remind me / Maybe later" |
| **Calm** | ~7 | goals, experience | account, then 7-day trial | first value is a breathing animation before any question |
| **Daylio** | 8 | palette/mood icons, activities, reminder time | no account; soft paywall | first entry inside onboarding; rating prompt before use (criticised) |
| **How We Feel** | 14 | — | free | first task is an emotion check-in; praised for fast time-to-value |
| **Stoic** | 9 | goals, age ("won't limit features") | hard paywall at quiz end | morning/day/evening reflection times; streak + badge after first entry |
| **Hevy** | ~10 | username, units, Health | account first, paywall before use (criticised) | permission explainers before system prompts |
| **Strong** | ~3 | nothing | account first; soft paywall on locked features | teaches with first-touch coach marks; home feels empty |
| **Fitbod** | 14 | frequency, experience, goal, location/equipment, recent muscles | account and paywall last, after a projection | every answer visibly shapes the first workout |
| **Nike Training Club** | ~7 | gear (women/men), workouts per week | Nike account first | free |
| **Noom** | ~100 | everything | email at 1/3 ("See my results"), paywall at the end | long quiz justified by interim payoffs; built to sell |
| **MyFitnessPal / Lifesum** | 14–30 | goal, activity, sex, age, height, weight | plan → paywall | health questions read as alarming |
| **Apple Journal** | ~0 | nothing | none | first entry is the first action; privacy stated as checkable facts |

"Shark": no general workout app by that name exists; the closest is Gymshark
Training (maintenance mode). Strong was covered in its place.

## Principles with evidence

1. **Value before asking.** Duolingo's deferred sign-up; Apple HIG: "let people
   experience your app… postpone nonessential setup".
2. **Few questions, each visibly used.** Median quiz ≈ 4 question screens
   (Lazyweb, 119 apps). Long flows work only with visible reflection of answers,
   interim payoffs and a concrete artefact (Fitbod, Noom).
3. **Permission: a reason beats timing** (Elbitar et al., USENIX Sec 2021, n=473).
   Apple: no permission at launch unless required; a pre-alert screen has one
   "Continue" button. iOS median push opt-in ≈ 51% (Airship 2021).
   **Ask for the reminder after the first finished reflection.**
4. **Just-in-time beats tours.** NN/g (n=70): tutorial readers did no better and
   rated tasks harder. Teach each area the first time it is entered; empty states
   say what the area is for, what will appear, and offer one first action.
5. **Privacy as checkable facts**, not slogans (Apple Journal): no account, on this
   phone, and say so at the moment anything leaves the device.

## What Better Me needs from a new person

| | When | Why |
|---|---|---|
| Language | inferred (`appLang`), one tap to change | already detected from the device |
| Name | first run | the app greets and writes to her by name |
| Form of address (he/ar) | first run, right after the name | changes every sentence |
| Areas she cares about | first run, one question | decides what the dial carries |
| End of her day (reminder time) | first run, as a *value* | the spine; permission only after the first reflection |
| First reflection (2–3 questions) | first run | the first win; lights the well |
| Units | inferred from locale | settings only |
| Nutrition profile (sex, age, height, weight, activity, goal) | first visit to תזונה | feeds only the targets |
| Fitness (goal, experience, equipment) | first visit to כושר | feeds only the generator |
| Camera, contacts, calendar, steps | the first feature that uses them | Apple HIG |
| Rating prompt | after several finished reflections | never at first run |

## Character-led patterns that fit Beem

The character comes before any question; he asks the name and reacts; the
reminder is his ("Beem will knock at 21:30"); he marks the first win; and he
gives a reason to come back that evening. Avoid Duo's guilt — this app is gentle.
