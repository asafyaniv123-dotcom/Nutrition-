# Social: Instagram, TikTok, YouTube

Decided by Asaf on 24 Oct 2026:

- **One account per network, in English**, for the whole world. A language
  gets its own account only once its share of installs earns it.
- **The face is Beem and the app.** Nobody on camera. Content is Beem, real
  screen recordings of the app, and sentences.
- **Publishing starts after the design is finished.** The handles are claimed
  now, so the name is not taken in the meantime.

## The accounts

All three networks are registered on **hello.betterme.app@gmail.com**, a Google
account of the app's own (two-step verification on, backup codes kept by Asaf
offline). The same address is the contact on the privacy page. Passwords and
codes never enter this repository or this chat.

The handle is **trybetterme** everywhere it is free. bettermeapp, bettermejournal
and better.me.app were all taken on YouTube.

| Network | Handle | State |
|---|---|---|
| YouTube | @trybetterme (free) | NOT created yet: YouTube refused the channel NAME "Better Me" |
| Instagram | | |
| TikTok | | |

## How a post lives here

Each post is one file in `posts/`, named `YYYY-MM-DD-<slug>.md`:

```
status: idea | draft | approved | posted
network: tiktok, instagram, youtube
format: reel | carousel | still | short
---
Hook (the first second / first line):
Script or frames:
Caption:
Hashtags:
Assets: (paths under marketing/social/assets/)
---
After posting: link, date, views at 48h / 7d, follows, installs that week
```

## Rules

1. **Nothing is posted without Asaf's approval.** A post moves from
   `draft` to `approved` only on his word. Posting is public and cannot
   really be taken back.
2. **What is shown is what the app does.** A screen recording comes from the
   real app, through the same tooling as `marketing/shoot-raw.mjs`. Never a
   mock-up of a feature that does not exist.
3. **The privacy promise is worded exactly:** "your journal stays on your
   phone". Not "nothing leaves the phone".
4. **The voice is the app's voice:** personal, addressed to one person, calm.
   Not hype.

## Publishing, per network

| Network | From here | Until then |
|---|---|---|
| TikTok | Possible through the Higgsfield connector, once it is authorised in claude.ai | the file and caption are prepared, Asaf posts from the phone |
| Instagram | Needs a Business account and an approved Meta app | the same |
| YouTube | API uploads stay private until Google verifies the app | the same |

## Measuring

After every post, the numbers go into its own file. Once a week they are
read next to the installs from the statistics session (`STATS.md`), so we
learn which kind of content brings people, not just likes.
