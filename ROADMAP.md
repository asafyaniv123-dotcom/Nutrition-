# What we are doing next

One screen. If it needs a second screen it has stopped being a roadmap.

`TODO.md` is the diary of what was built. **This** answers what happens next.

**Done means three things, in this order:** Asaf uses it every day; the workflow
is a pleasure rather than a chore; it is on the App Store. The first two cannot
be found by auditing — only by living in it — which is why the first milestone
is a freeze rather than a feature.

Three hours a day, most days.

---

## Now → Tue 15 Sep · Get it released

The stable app has not moved since 11 Sep. Everything since then is in dev.

| | |
|---|---|
| **Sat 12 Sep** | The five open decisions. They are Asaf's, not mine, and they block everything: the WHO card (`48bf213`), per-day vs remembered for the question bank (`499888a`), `יום שישי` vs `שישי` (`07a0656`), whether the progress chart plots `e1rm()` or the heaviest weight (`1a0a493`), and whether the design work starts with a shadow pass. Plus the two open on the board: the left-to-right reading order, and panel vs whole screen. |
| **Sun 13 Sep** | Build whatever those decisions require. |
| **Mon 14 Sep** | Drive the whole app end to end, Hebrew and one more language, on a phone-width screen. Fix what shows. |
| **Tue 15 Sep** | **RELEASE.** `./release.sh --go`, then the empty commit that makes Pages build. Reload the phone. |

---

## Wed 16 → Tue 22 Sep · The freeze

**Seven days. Not one line of code in the app.**

This is the milestone, not the gap between milestones. Nothing found by reading
the screens has told us whether the thing is a pleasure to use, because nobody
has used it for a week without it changing underneath them.

**Asaf's only job:** a note on the phone. One line every time something annoys
you, or you avoid doing something, or you reach for the app and put it down
again. The third kind matters most and is the easiest to miss.

**The one rule that keeps a freeze alive:** if it is broken, fix it. If it
merely annoys, write it down. Without that line the freeze collapses on day two.

**Where the three hours a day go instead:** the App Store track, which touches
nothing in the app.

- **Start the Apple Developer enrolment on 16 Sep.** $99/year, and approval for
  an individual can take days. It is the longest lead time we have and it must
  not be the thing we are waiting on in October. Check the current timeline
  rather than trusting this line.
- Decide the technical path. This is one HTML file; the realistic options are a
  wrapper (Capacitor or similar) or a rewrite, and they are not close in cost.
  Write the comparison down before choosing.
- The listing: icon, screenshots, description, privacy policy. A PWA that keeps
  everything on the device has an easy privacy story - say so plainly.

---

## Wed 23 Sep · Read the notes

His week of notes becomes the next sprint, and it will be worth more than any
audit pass. The audit finds defects; a week of use finds the workflow.

---

## Tue 30 Sep · One person who is not Asaf

One. Not five. Someone installs it, uses it three days, and says what they did
not understand. Two testers do not teach twice as much and they do dilute what
comes back.

---

## Wed 15 Oct · A TestFlight build, or a written decision not to

A build in a tester's hands, or one paragraph saying why not and what replaced
it as the goal. **"Maybe one day" is the outcome to avoid** - it is the only one
that cannot be acted on.

---

## Not on this roadmap on purpose

More audit passes, more languages, more features. They are all real and none of
them is the next thing. When the freeze ends there will be a list from actual
use, and that list outranks anything found by reading the code.
