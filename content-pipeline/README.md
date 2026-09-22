# Auto SEO content pipeline — routes & blog

Twice a week, publish one new transfer-route page or SEO blog article for
airportsplittransfer.com, sourced automatically, never repeating a topic
already covered.

## Adaptations from the original brief to this repo's real structure

The task as given assumed a different site architecture. This is a static,
hand-built HTML site with no build step and no CMS, so a few things are
mapped onto what actually exists here instead:

| Brief said | This repo actually has | What the pipeline does |
|---|---|---|
| `/public/images` | `/assets/` | New pages use images already in `/assets/` if relevant, or a placeholder marker (see Images below) — nothing gets written to a folder that doesn't exist. |
| `.md` article in `/content/blog/` | Real `.html` pages in `/blog/` and `/destinations/`, each with full `<head>` SEO tags, JSON-LD and the site's shared header/footer | A Markdown file dropped in `/content/blog/` would just be an inert text file Netlify serves as-is — no template, no nav, no styling, not linked from anywhere. New content is instead written as a real page using the existing `destinations/*.html` or `blog/*.html` template (see Templates below), which is what actually renders on the site and gets indexed. |
| Push to `main` | This Claude Code session is scoped to develop and push to `claude/taxi-mobile-hero-redesign-9o5rnz`, which Netlify is currently building as the **production** branch (confirmed directly in the Netlify dashboard) | The pipeline pushes there. Functionally identical outcome (it goes live), different branch name. |

## Two content types — which template to use

**Route** (`destinations/<slug>.html`) — a place travellers are transferred
*to* from Split Airport: a town, marina, ferry port, or specific address.
Uses the destination-page template (breadcrumb → page-hero → trust-strip →
journey overview → about-the-place → what-to-expect → nearby places →
FAQPage JSON-LD). Price is never hardcoded — every route page points to
the live booking form, which quotes an exact price once a real
pickup/drop-off address is entered. Linked from `destinations.html`'s grid
and added to `js/pricing.js`'s `DESTINATION_NAMES` map so the "Book This
Route" link can deep-link the booking form with the destination
pre-filled.

**Blog article** (`blog/<slug>.html`) — a topic that doesn't map to one
transfer destination: a comparison, a planning guide, an attraction that
isn't itself a drop-off point (a fortress, a viewpoint), a multi-town
guide. Uses the article template (breadcrumb → article-hero → article-body
→ Related Reading → Book CTA → Article + BreadcrumbList JSON-LD). Linked
from `blog/index.html`'s list.

Both get the same content bar: 900–1400 words, 5-question FAQ, SEO title
50–60 characters, meta description 140–160 characters, internal links to
existing route/blog pages, and the CTA "Book your private transfer"
linking to `../index.html#booking`.

## Images

Route and blog pages on this site currently ship with **no photography at
all** — text-only, by original design (see the destination-page template).
If a future post genuinely calls for an image and nothing suitable exists
in `/assets/`, insert an HTML comment placeholder instead of fabricating
one:
`<!-- IMAGE PLACEHOLDER: [description of what's needed] — supply a real photo before this goes fully live -->`
Never generate or hotlink a fake/AI photo of a real place and present it
as genuine.

## Content rules (every post)

- Style: premium, Scandinavian-minimal. Short paragraphs (3–5 sentences).
  No emojis, ever. English.
- Don't invent facts, distances, drive times, or prices. Distances/times
  come from the existing site's known figures where a route is already
  referenced elsewhere (e.g. Rogoznica's page already states 34 km / 35
  min — reuse, don't reinvent); where genuinely new, state the drive time
  as an estimate consistent with the region's known road network and mark
  distance as approximate rather than inventing a false-precision number.
  Never state a fixed € price — the site only ever quotes prices live
  through the booking form.
- FAQ: exactly 5 questions, matching the FAQPage JSON-LD schema pattern
  used on existing destination pages.
- Internal links: at least 2–3 links to existing destination/blog/day-trip
  pages relevant to the topic (nearby routes, related guides).
- CTA: always ends with a "Book your private transfer" button/link to
  `index.html#booking` (adjust relative path for page depth).

## Never repeat a topic

Before writing, check:
1. `destinations/` and `blog/` directory listings for existing slugs.
2. `content-pipeline/history.md` in this folder for topics already
   published by this pipeline (including ones not yet reflected above if
   very recent).
Pick the next unpublished topic from the backlog below, or research a new
one if the backlog is exhausted (same 250 km radius + tourist-potential
criteria, still never repeating anything already live).

## Topic backlog (within ~250 km of Split, tourist potential)

Priority order — work top to bottom, skip anything already published:

1. **Trogir** (route) — UNESCO old town, ~25 km / adjacent to the airport itself
2. **Primošten** (route) — peninsula old town, vineyards, ~35 km
3. **Kaštela** (route) — Kaštela Bay, seven historic villages, right by the airport
4. **Hvar Island** (route/blog — ferry-dependent) — Hvar Town, lavender fields, popular nightlife island
5. **Bol & Zlatni Rat, Brač Island** (route/blog — ferry-dependent) — Croatia's best-known beach
6. **Klis Fortress** (blog) — hilltop fortress overlooking Split, Game of Thrones filming location, short trip not a full transfer route
7. **Vis Island** (route/blog — ferry-dependent) — quieter island, Blue Cave day-trip base
8. **Biograd na Moru** (route) — marina town between Split and Zadar
9. **Split ferry port & island connections** (blog) — practical guide to the Jadrolinija terminal, which islands connect from Split
10. **Neum** (blog) — Bosnia and Herzegovina's coastal town, border-crossing notes for travellers routed through it
11. **Solin & Salona ruins** (blog) — Roman ruins minutes from the airport, easy half-day add-on

When this list is exhausted, research further candidates within the same
radius before repeating anything (e.g. Korčula, Pag, Zlarin, Krapanj,
Šolta, Vranjic, Cetina river canyon at Radmanove Mlinice).

## Schedule

Two Routines fire weekly (Europe/Zagreb time, currently CEST/UTC+2 — see
the daylight-saving note in `marketing/gbp-scheduler/README.md`, same
caveat applies here):

- Tuesday 10:00 local → `0 8 * * 2` UTC
- Friday 10:00 local → `0 8 * * 5` UTC

## Workflow for each firing

1. Read this file and `history.md` for what's already covered.
2. Pick the next backlog topic (or research one if exhausted).
3. Decide route vs blog template.
4. Write the full page: copy an existing page of the matching type as a
   structural starting point, replace all content, get the `<head>` SEO
   tags right (title 50–60 chars, meta description 140–160 chars,
   canonical/og/twitter URLs, JSON-LD), 900–1400 words body, 5-question
   FAQ, internal links, CTA.
5. If it's a route: add it to `destinations.html`'s grid and to
   `js/pricing.js`'s `DESTINATION_NAMES`. If it's a blog article: add it
   to `blog/index.html`'s list.
6. Add the new URL to `sitemap.xml` (match the existing entry format —
   priority 0.8 for routes, 0.5 for blog articles, changefreq monthly).
7. Append an entry to `content-pipeline/history.md` (date, type, slug,
   title).
8. Commit and push everything on the current branch.
9. Send a short PushNotification naming what was published, with the live
   path (e.g. `/destinations/trogir`).
10. Reply in the session with a short summary and the link.
