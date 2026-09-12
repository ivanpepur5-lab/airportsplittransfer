# Booking email templates

Two merge templates for the booking flow on airportsplittransfer.com:

- `booking-confirmation-customer.html` — sent to the customer after a
  successful booking.
- `booking-notification-admin.html` — sent to `info@airportsplittransfer.com`
  so the team can act on a new booking immediately from a phone.

Both are self-contained, table-based, inline-styled HTML designed to render
correctly across Gmail, Outlook (desktop + web), Apple Mail and mobile mail
apps, and both are mobile-responsive.

## Important: these are templates, not a sending pipeline

The site currently submits bookings straight to **Netlify Forms** — there is
no server-side code that sends email today. Netlify's own built-in form
notification email is a fixed plain layout; it cannot be swapped for custom
HTML. Nothing about that submission flow was changed here, as requested.

To actually send these templates you need one more step, wired up outside
this repo, that watches for new "booking" form submissions and sends mail
through them — most commonly one of:

- A Netlify outgoing webhook → Zapier/Make → your email provider (SendGrid,
  Postmark, Mailgun, Resend...), pushing the submission fields into the
  template.
- A small Netlify Function subscribed to Netlify's
  `submission-created` event that calls your email provider's API directly.

Whichever you choose, it's the piece that reads the raw form submission and
supplies the merge values below — no back-end/booking logic changes needed
in this repo either way.

## Field mapping

Both templates use `{{token}}` placeholders. Everything maps 1:1 to the
existing Netlify Forms field names on the booking form
(`index.html` / `de/index.html` / `sv/index.html`, form name `booking`):

| Form field (Netlify) | Customer email token | Admin email token |
|---|---|---|
| `full_name` | `{{full_name}}` | `{{customer_name}}` |
| `email` | `{{email}}` | `{{email}}` / `{{email_addr}}` |
| `phone` | `{{phone}}` | `{{phone}}` / `{{phone_tel}}` |
| `date` | `{{date}}` | `{{date}}` |
| `time` | `{{pickup_time}}` | `{{pickup_time}}` |
| `pickup` | `{{pickup}}` | `{{pickup}}` |
| `dropoff` | `{{dropoff}}` | `{{dropoff}}` |
| `return_date` | `{{return_date}}` (optional) | — not shown, admin email is one-way at a glance |
| `return_time` | `{{return_time}}` (optional) | — |
| `passengers` | `{{passengers}}` | `{{passengers}}` |
| `vehicle` | `{{vehicle}}` | `{{vehicle}}` |
| `calculated_price` | `{{price}}` | `{{price}}` |
| `flight_number` | `{{flight_number}}` (optional) | `{{flight_number}}` (optional) |
| `notes` | — not shown (not in the approved card list) | `{{notes}}` (optional, "Special requests") |
| *(none yet)* | `{{booking_reference}}` (optional) | — |

Notes:

- `{{phone_tel}}` / `{{email_addr}}` in the admin email are just `phone` /
  `email` with formatting stripped, for clean `tel:`/`mailto:` hrefs. If your
  automation can't produce a second cleaned value, reuse `{{phone}}` /
  `{{email}}` directly in the `href` — for values already free of spaces it
  makes no difference.
- `{{booking_reference}}` has no source field yet — the booking form doesn't
  generate one. The row hides itself automatically until a reference is
  supplied (e.g. by the automation, or a future form change).
- `vehicle` is a raw key (`skoda` / `vclass` / `trafic`) in the submitted
  form data. Map it to a label before merging:

  | Form value | Display label |
  |---|---|
  | `skoda` | Sedan — Škoda Superb or similar |
  | `vclass` | Business Van — Mercedes-Benz V-Class |
  | `trafic` | Van — Renault Trafic or similar |

## Hide-if-empty fields

Optional rows (booking reference, return date/time, flight number, special
requests) are wrapped in Handlebars-style conditionals:

```html
{{#if flight_number}}
<tr>...</tr>
{{/if}}
```

This syntax is understood natively by Postmark, SendGrid dynamic templates,
Mailgun and Mailchimp Transactional (Mandrill). If your tool can't evaluate
`{{#if}}` blocks (e.g. plain Zapier/Make merge steps without a code step),
either:

1. Add a small "Code" step (Zapier/Make both support one) that renders the
   template through the `handlebars` npm/pip package before sending, or
2. Conditionally strip the relevant `<tr>...</tr>` block per-send in that
   step instead of relying on the template engine.

## Suggested subject lines

- Customer: `✅ Booking Confirmed — {{date}} at {{pickup_time}} | Airport Split Transfer`
- Admin: `🚖 NEW BOOKING • {{date}} {{pickup_time}} • {{customer_name}}`

## Brand colors used

- Sky blue accent: `#0EA5E9`
- Dark navy: `#07264C` (matches `--navy` in `css/style.css`)
- Card background: `#F8FAFC`, border: `#E5E7EB` (matches the site's
  `--bg-2` / `--line`)

## Testing

Before wiring these into a live sender, paste the rendered HTML (with real
values substituted for the tokens) into
[Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com),
or send a manual test through your chosen provider's API/dashboard, to
confirm rendering in Outlook desktop specifically — it's the one major
client that ignores the `<style>` media query and always shows the desktop
layout (a graceful, still-usable degradation by design here).
