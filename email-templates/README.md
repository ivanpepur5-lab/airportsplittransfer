# Booking email templates

Two merge templates for the booking flow on airportsplittransfer.com:

- `booking-confirmation-customer.html` — sent to the customer after a
  successful booking.
- `booking-notification-admin.html` — sent to `info@airportsplittransfer.com`
  so the team can act on a new booking immediately from a phone.

Both are self-contained, table-based, inline-styled HTML designed to render
correctly across Gmail, Outlook (desktop + web), Apple Mail and mobile mail
apps, and both are mobile-responsive.

## Sending pipeline

These are now sent automatically: `netlify/functions/submission-created.js`
is invoked by Netlify on every Netlify Forms submission on this site (a
built-in Netlify convention — no dashboard/webhook config, no Zapier/Make),
reads these two files at runtime, fills in the tokens below and sends both
emails through the [Resend](https://resend.com) API. See
`netlify/functions/README.md` for the function itself — deploy setup,
environment variables, error handling.

Nothing about the booking form or Netlify Forms submission flow was
changed — the function only reads the existing submission after the fact.

## Field mapping

Both templates use `{{token}}` placeholders, rendered by
`netlify/functions/lib/template.js`. Everything maps 1:1 to the existing
Netlify Forms field names on the booking form (`index.html` /
`de/index.html` / `sv/index.html`, form name `booking`) — the exact mapping
logic lives in `netlify/functions/submission-created.js` and
`netlify/functions/lib/booking.js`:

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
| `calculated_price` | `{{price}}` / `{{price_display}}` | `{{price}}` / `{{price_display}}` |
| `flight_number` | `{{flight_number}}` (optional) | `{{flight_number}}` (optional) |
| `notes` | — not shown (not in the approved card list) | `{{notes}}` (optional, "Special requests") |
| Netlify's own `number`/`id` | `{{booking_reference}}` (optional) | — |

Notes:

- `{{phone_tel}}` / `{{email_addr}}` in the admin email are `phone` /
  `email` with formatting stripped, for clean `tel:`/`mailto:` hrefs.
- `{{price_display}}` is the fully formatted string (`"€45"`, or
  `"Price to be confirmed"` if `calculated_price` was empty — see
  `formatPrice()` in `netlify/functions/lib/booking.js`). `{{price}}` is
  the bare number, kept only in case a future template needs it unformatted.
- `{{booking_reference}}` comes from Netlify's own submission metadata
  (`AST-{number}`, e.g. `AST-57`) — the booking form itself has no
  reference field. It hides itself only in the (practically nonexistent)
  case where Netlify didn't supply a submission number or id.
- `vehicle` is a raw key (`skoda` / `vclass` / `trafic`) in the submitted
  form data, mapped to a label by `VEHICLE_LABELS` in
  `netlify/functions/lib/booking.js`:

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

`netlify/functions/lib/template.js` implements exactly this one construct
(plus plain `{{field}}` substitution, HTML-escaped) — a small
dependency-free renderer rather than pulling in a full templating engine
for two emails.

## Subject lines

Set in `netlify/functions/submission-created.js`, not in the templates:

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
