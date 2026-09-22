# Booking emails — Netlify Function

`submission-created.js` is auto-invoked by Netlify on **every** Netlify
Forms submission on this site. This is a built-in Netlify convention (the
exact filename is what triggers it) — no dashboard webhook, no Zapier/Make,
nothing to configure beyond the environment variables below. See
[Netlify's docs](https://docs.netlify.com/forms/notifications/#trigger-serverless-functions)
for the mechanism itself.

It only acts on submissions from the `booking` form (`index.html` /
`de/index.html` / `sv/index.html`) and the `daytrip` form
(`day-trips/krka-national-park.html` / `day-trips/plitvice-lakes.html`);
anything else is ignored so a future form elsewhere on the site can't
accidentally trigger booking emails.

For each submission it sends two emails through the
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

`email-templates/*.html` and `*.txt` are the source of truth for the
design, but `submission-created.js` doesn't read them from disk at
runtime — it imports `lib/templates.js`, a generated file with the
content embedded as plain JS strings (`CUSTOMER_TEMPLATE` /
`ADMIN_TEMPLATE` for the HTML, `CUSTOMER_TEMPLATE_TEXT` /
`ADMIN_TEMPLATE_TEXT` for the plain-text fallback sent alongside it in
every Resend call — see `lib/resend.js`'s `text` field). This used to be
`fs.readFileSync()` against a path relying on `[functions].included_files`
in `netlify.toml` to bundle the `.html` files alongside the function —
that depends on exactly how Netlify's esbuild bundler lays out
`included_files` relative to `__dirname` at runtime, which isn't something
verifiable without a real deploy, and turned out to be the reason booking
emails silently stopped sending in production (confirmed by bundling the
function locally with the same esbuild config Netlify uses — see the repo
history for `netlify/functions/lib/generate-templates.js` for the
diagnosis). Embedding the content as a string means esbuild bundles it as
ordinary code, with zero runtime file-system dependency.

The `.html` files each start with a large `<!-- -->` documentation comment
(field mapping, hide-if-empty rules) for anyone reading the file directly.
`generate-templates.js` strips that comment before embedding — it's
dev-facing documentation, not part of the email, and a customer once
received it verbatim at the top of a real confirmation email: with no
explicit `text` part on the Resend payload, something in the send path
generated a plain-text fallback from the raw HTML, and didn't handle that
comment cleanly. The two problems together (no text part + doc comment
shipped in the HTML source) are why this repo now always sends an
explicit, hand-written `.txt` part rather than relying on any renderer's
comment-stripping being correct.

**After editing any of the four template files, regenerate
`lib/templates.js`:**

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

`booking-email-status.js` is a separate, plain function (no npm deps, same
lib/ modules) whose only job is answering: is this deployment's
`RESEND_API_KEY` present, and does it actually authenticate against Resend
with a verified sending domain. Visit it directly:

```
https://<your-site>/.netlify/functions/booking-email-status
https://<your-site>/.netlify/functions/booking-email-status?checkResend=1
https://<your-site>/.netlify/functions/booking-email-status?sendTestTo=you@example.com
https://<your-site>/.netlify/functions/booking-email-status?sendTestTo=you@example.com&fullTemplate=1
```

The plain URL reports `resendApiKeyPresent`, a masked key prefix, the
configured from/admin addresses, and confirmation the email templates are
embedded correctly.

`?checkResend=1` makes one live, harmless call to Resend's own `/domains`
API with that exact key. **This only works with a "full access" API key**
— a "sending access only" key (a narrower permission level Resend lets
you scope a key to) gets a 401 `"restricted to only send emails"` from
`/domains` specifically, which the report calls out with a `note` field.
That 401 is not evidence the key can't send — it's a different endpoint's
permission check.

`?sendTestTo=<email>` sends one real, clearly-labeled test email to that
address through the exact same code path as a real booking, and reports
Resend's actual response. It was added to check whether Resend's
unverified-domain sandbox mode (which allows sending only to your own
account's registered address until a domain is verified) explained
**"admin gets the notification but a real customer address gets
nothing"** — on this site it did not: a test send to a real, unrelated
address (not the Resend account's own) succeeded and returned a real
message id, ruling that out.

Add `&fullTemplate=1` to send the actual customer confirmation template
(with sample data) instead of a short inline test message — this checks
whether something specific to the full ~20KB rendered HTML/text is the
difference, rather than sending capability in general. If this also
succeeds but a real booking still doesn't reach the customer, the
remaining likely causes are downstream of Resend accepting the send:
spam/junk filtering at the recipient's provider (very common for a
sending domain's first real-world messages), or the actual submitted
`email` field for that specific booking being mistyped/invalid — check
**Netlify → Functions → submission-created → Logs** for the
`[booking-email]` line for that submission, which logs Resend's own
response id or error for that exact send.

This exists because the two most likely causes of "booking emails aren't
sending" — a missing/wrong `RESEND_API_KEY`, or an unverified sending
domain — both fail silently from the function's own logs, and neither is
checkable without either the Netlify dashboard (function logs, env vars)
or the Resend dashboard (domain status). This endpoint answers both at
once, from a plain URL.

**Why a separate function, and not just visiting `submission-created`
directly:** that was the first version of this check — a plain GET (no
body, which a real form submission never sends) to `submission-created`'s
own URL returned the same report. In production that request returns HTTP
403 before `submission-created.js`'s own code ever runs. Nothing in this
repo — not this function, not `_headers`, not `_redirects`, not the edge
function — returns 403 anywhere; confirmed by grepping all of it. That
points at Netlify itself applying extra access restrictions to functions
bound to the Forms `submission-created` convention when they're hit
directly instead of invoked by Netlify's own form-processing pipeline. A
function under any other name (`booking-email-status`) carries no such
binding and is just a normal, publicly reachable function.

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
