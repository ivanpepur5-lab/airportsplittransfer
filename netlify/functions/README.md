# Booking emails — Netlify Function

`submission-created.js` is auto-invoked by Netlify on **every** Netlify
Forms submission on this site. This is a built-in Netlify convention (the
exact filename is what triggers it) — no dashboard webhook, no Zapier/Make,
nothing to configure beyond the environment variables below. See
[Netlify's docs](https://docs.netlify.com/forms/notifications/#trigger-serverless-functions)
for the mechanism itself.

It only acts on submissions from the `booking` form (`index.html` /
`de/index.html` / `sv/index.html`); anything else is ignored so a future
form elsewhere on the site can't accidentally trigger booking emails.

For each booking submission it sends two emails through the
[Resend](https://resend.com) API, using the templates in
`../../email-templates/`:

1. A confirmation to the customer.
2. An internal notification to the booking inbox.

## Required setup after deploy

### 1. Resend account + verified sending domain

Emails are sent "from" `airportsplittransfer.com` by default (see env vars
below). Resend requires the **sending domain to be verified** (SPF/DKIM
DNS records) before it will deliver mail from that domain — this is a
one-time step in the Resend dashboard under **Domains**, independent of
this code. Until the domain is verified, Resend will reject the send and
the function will log the rejection (see Error handling below) rather than
silently failing.

### 2. Environment variables (Netlify site settings → Environment variables)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | **Yes** | — | Resend API key. Without it, the function logs an error and skips sending (does not throw / break the booking form). |
| `RESEND_FROM_EMAIL` | No | `Airport Split Transfer <booking@airportsplittransfer.com>` | Must be an address on a domain verified in Resend. |
| `ADMIN_NOTIFICATION_EMAIL` | No | `info@airportsplittransfer.com` | Where the internal notification is sent. |

Set these under **Site settings → Environment variables** in the Netlify
UI, then trigger a redeploy so the function picks them up.

### 3. That's it

No build step, no `npm install` — the function has zero npm dependencies
(uses Node's built-in `fetch`, `fs`, `path`). `netlify.toml` pins
`NODE_VERSION = "18"` (for native `fetch`) and lists
`email-templates/*.html` under `[functions].included_files` so both
template files are bundled into the function's deployment — otherwise
`fs.readFileSync` would fail at runtime since esbuild can't statically see
that dependency.

## How field mapping works

`submission-created.js` receives Netlify's submission payload
(`{ payload: { form_name, data, number, id, ... } }`), pulls the relevant
fields out of `payload.data` (the raw form fields — same names as the
`name="..."` attributes in the booking form), and hands a flat object of
already-formatted values to `renderTemplate()`. See
`../../email-templates/README.md` for the full field-to-token mapping
table, and `lib/booking.js` for the vehicle-label lookup, date formatting,
price formatting/fallback, and booking-reference logic.

## Error handling & logging

- Customer and admin emails are sent independently
  (`Promise.allSettled`) — a failure sending one never blocks or is
  masked by the other.
- Every failure is logged with `console.error`, prefixed `[booking-email]`,
  including the Resend API's own error message and the Netlify submission
  id, so a failed send is traceable in **Netlify → Functions → Logs**.
- A missing `RESEND_API_KEY`, an unparsable submission payload, or a
  missing/unreadable template file are all logged clearly and handled
  without throwing.
- The function always returns HTTP 200 to Netlify. Netlify does not use a
  `submission-created` function's response to affect the original form
  submission (the visitor's browser already got its response from the
  initial POST) — returning a non-200 here would only affect Netlify's own
  internal bookkeeping, not the customer's experience, so failures are
  surfaced through logs rather than response codes.

## Testing without a live Resend account

`lib/template.js`, `lib/booking.js` and `lib/resend.js` are plain Node
modules with no Netlify-specific globals, so they can be exercised directly:

```js
global.fetch = async (url, opts) => {
  console.log("Would send:", JSON.parse(opts.body));
  return { ok: true, json: async () => ({ id: "test" }) };
};
process.env.RESEND_API_KEY = "test";
const { handler } = require("./submission-created.js");
await handler({
  body: JSON.stringify({
    payload: {
      form_name: "booking",
      number: 1,
      data: {
        full_name: "Test User", email: "test@example.com", phone: "+385...",
        date: "2026-09-24", time: "14:30",
        pickup: "Split Airport (SPU), Croatia", dropoff: "Hotel X, Dubrovnik",
        passengers: "2", vehicle: "vclass", calculated_price: "185",
      },
    },
  }),
});
```

Once deployed, the fastest real test is submitting the live booking form
with a real email address and checking **Netlify → Functions → Logs** for
`[booking-email]` lines alongside the inbox results.
