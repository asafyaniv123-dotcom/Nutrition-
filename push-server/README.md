# Daily reflection push server

Sends one Web Push per subscription per day, at the local time the user picked,
so the reminder arrives **with the app fully closed**. Without this the app still
works — it just degrades to reminding you only while it is open.

Runs on Cloudflare Workers. Free tier is far more than enough: one cron per
minute and a handful of KV reads a day.

## Why payload-less push

The notification text is fixed, so `sw.js` already knows what to say. That lets
us send a push with **no payload**, which skips RFC 8291 payload encryption
entirely — the single most error-prone part of Web Push. All the server has to
get right is the VAPID JWT.

## Deploy

```bash
cd push-server
npx wrangler login

# 1. Storage for subscriptions
npx wrangler kv namespace create SUBS
#    -> paste the printed id into wrangler.toml

# 2. Secrets (the keypair was generated separately; never commit the private half)
npx wrangler secret put VAPID_JWK       # the full private JWK, as JSON on one line
npx wrangler secret put VAPID_PUBLIC    # base64url public key, same one in index.html
npx wrangler secret put VAPID_SUBJECT   # mailto:you@example.com

# 3. Ship
npx wrangler deploy
```

Then put the deployed URL into `PUSH_SERVER` in `index.html`:

```js
var PUSH_SERVER='https://nutrition-push.<your-subdomain>.workers.dev';
```

`VAPID_PUBLIC` must be byte-identical in the secret and in `index.html`. A
mismatch fails at push time with a `403`, not at subscribe time — so it looks
like it worked right up until no notification ever arrives.

## Endpoints

| Route | Purpose |
|---|---|
| `GET /health` | liveness + whether secrets are configured |
| `POST /subscribe` | `{subscription, time:"21:00", tz:"Asia/Jerusalem"}` |
| `POST /unsubscribe` | `{endpoint}` |
| `POST /test` | `{endpoint}` — send one immediately, for end-to-end checks |

## Behaviour

- Cron runs every minute and sends when local `HH:MM` reaches the chosen time.
- One send per local calendar day, tracked per subscription.
- More than 2h late (`LATE_WINDOW_MIN`) is suppressed rather than delivered — a
  reflection nudge at 3am is worse than a missed one.
- `404`/`410` from the push service deletes the subscription; it is gone for good.
- Subscribing after today's time has passed starts tomorrow, matching the client.

## iOS notes

- Only works from a **Home Screen** web app, iOS 16.4+. A Safari tab cannot
  subscribe at all.
- Permission must be granted from inside the installed app.
- Deleting the Home Screen icon destroys the subscription. Re-adding it makes a
  new one; the old record is cleaned up on its next `410`.
