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
(uses Node's built-in `fetch`). `netlify.toml` pins `NODE_VERSION = "18"`
for native `fetch`.

## If you edit the email templates

`email-templates/*.html` are the source of truth for the design, but
`submission-created.js` doesn't read them from disk at runtime — it
imports `lib/templates.js`, a generated file with the HTML embedded as
plain JS strings (`CUSTOMER_TEMPLATE` / `ADMIN_TEMPLATE`). This used to be
`fs.readFileSync()` against a path relying on `[functions].included_files`
in `netlify.toml` to bundle the `.html` files alongside the function —
that depends on exactly how Netlify's esbuild bundler lays out
`included_files` relative to `__dirname` at runtime, which isn't something
verifiable without a real deploy, and turned out to be the reason booking
emails silently stopped sending in production (confirmed by bundling the
function locally with the same esbuild config Netlify uses — see the repo
history for `netlify/functions/lib/generate-templates.js` for the
diagnosis). Embedding the HTML as a string means esbuild bundles it as
ordinary code, with zero runtime file-system dependency.

**After editing either `.html` template, regenerate `lib/templates.js`:**

```
node netlify/functions/lib/generate-templates.js
```

and commit the result — `lib/templates.js` is checked in (there's no build
step to regenerate it automatically).

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
- A missing `RESEND_API_KEY` or an unparsable submission payload are both
  logged clearly and handled without throwing.
- Every invocation logs the form name it received and whether
  `RESEND_API_KEY` is present *before* any early return, so a real
  submission is always traceable in the logs even when everything past
  that point gets skipped.
- The function always returns HTTP 200 to Netlify. Netlify does not use a
  `submission-created` function's response to affect the original form
  submission (the visitor's browser already got its response from the
  initial POST) — returning a non-200 here would only affect Netlify's own
  internal bookkeeping, not the customer's experience, so failures are
  surfaced through logs rather than response codes.

## Live self-check (no dashboard access needed)

`submission-created.js` is a normal function underneath the special
form-trigger behavior, so it's also reachable directly at its own URL:

```
https://<your-site>/.netlify/functions/submission-created
```

A plain visit (GET, no body — which a real form submission never sends)
returns a JSON report instead of trying to process a booking:
`resendApiKeyPresent`, a masked key prefix, the configured from/admin
addresses, and confirmation the email templates are embedded correctly.
Add `?checkResend=1` to also make a live, harmless call to Resend's own
`/domains` API with that exact key — this confirms both that the key
authenticates *and* whether the sending domain shows as verified, which is
otherwise only visible in the Resend dashboard. No real email is sent by
either check.

This exists because the two most likely causes of "booking emails aren't
sending" — a missing/wrong `RESEND_API_KEY`, or an unverified sending
domain — both fail silently from the function's own logs, and neither is
checkable without either the Netlify dashboard (function logs, env vars)
or the Resend dashboard (domain status). This endpoint answers both at
once, from a plain URL.

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
