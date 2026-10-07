# Auto SEO content pipeline — routes & blog

Twice a week, publish one new transfer-route page or SEO blog article for
airportsplittransfer.com, sourced automatically, never repeating a topic
already covered.

## Pre-publish checklist — run every time, in this order, before writing anything

1. **Analyze all existing destinations in `/destinations/`.** List the
   directory, open each `<title>`/`<h1>` if the slug alone is ambiguous,
   and build the actual current set of covered places — don't rely on
   memory or on this file being fully up to date.
2. **Check `history.md`.** Read `content-pipeline/history.md` in full for
   every topic this pipeline has already published, including anything
   very recent that hasn't made it into the backlog list below yet.
3. **Find a new destination within 250 km of Split with the highest
   organic potential.** Cross-reference against the backlog below, but
   don't treat it as gospel — if research turns up a better-fit place the
   backlog missed, use judgement. Rank candidates by:
   - Name recognition / how commonly the place is already searched for
     (well-known towns, islands, national parks outrank obscure hamlets)
   - Real tourism infrastructure already there (hotels, marina, ferry
     terminal, beach, national park, popular restaurant/attraction) —
     signals genuine search demand, not just proximity
   - Fit with the priority categories from the original brief: hotels,
     Krka/Plitvice/Trogir/Primošten/Šibenik/Makarska-type towns, ferry
     ports and marinas, regional airports
   - Not already adequately covered by an existing page (a near-duplicate
     of a covered topic loses to a genuinely new one)
4. **Never repeat an already-published topic.** If steps 1–3 turn up
   anything that overlaps a page already live or already in `history.md`,
   discard it and pick the next-best candidate. This is a hard rule, not
   a preference — do not publish a topic a reasonable reader would
   consider "the same place" as one already covered (e.g. a hyper-specific
   street or hotel inside a town that already has its own destination
   page is a duplicate, not a new topic).

Only once all four steps are done, move to Templates/Content rules below
and write the page.

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

## Languages — publish in all languages at once

Every new route or blog page ships in English, German, Swedish,
Norwegian (Bokmål), Croatian and Italian **together, in the same firing**
(hr and it are generated, see "Croatian and Italian" below) — not English-first
with translations to follow. This is a hard requirement, not a
nice-to-have: a page that only exists in English is not considered
published for the purposes of the never-repeat rule or the history log.
(Norwegian was added on 2026-10-03, when the whole site got a `no/`
version; pages published before that date were translated in that batch.)

Reference example: `destinations/kastela.html` +
`de/destinations/kastela.html` + `sv/destinations/kastela.html` +
`no/destinations/kastela.html` — copy that four-file pattern for every
new page.

For each new page:

1. Write the English version first (content rules above).
2. Produce genuine German, Swedish and Norwegian (Bokmål) translations —
   real translations of the same content, same structure, same 5 FAQ
   questions in the same order, not summaries or rewrites. Get this right
   yourself; there is no translation API configured. Norwegian uses
   "Split lufthavn", "sjåfør", "transfer", "tur-retur", "fast pris".
3. Each language version needs its own correctly tuned SEO title
   (50–60 chars, ending in ` | Airport Split Transfer`) and meta
   description (140–160 chars) in that language — don't just reuse the
   English character counts.
4. Match the site's existing i18n conventions exactly (copy the markup
   from an existing `de/`, `sv/` and `no/` page of the same type):
   - `<html lang="de">` / `<html lang="sv">` / `<html lang="no">`
   - Translated nav labels (nav-links and mobile-nav — "Startseite/Beliebte
     Reiseziele/..." for German, "Startsida/Populära Resmål/..." for
     Swedish, "Hjem/Populære Reisemål/..." for Norwegian)
   - JSON-LD `BreadcrumbList` `name`/`item` values translated and pointed
     at the `/de/`, `/sv/` or `/no/` URLs
   - Internal links inside the body point at the same language's version
     of the target page.
   - Then run `python3 tools/sync_i18n.py` from the repo root. It rewrites
     the hreflang block (en/de/sv/no/x-default), the language dropdown and
     the mobile language links on every page, and fixes in-page links that
     point at a translation that doesn't exist (falls back to English) —
     so those three things never need to be edited by hand.
5. Wire all four in: the same card/list entry in `destinations.html`,
   `de/destinations.html`, `sv/destinations.html` and `no/destinations.html`
   (or the four `blog/index.html` files for an article).
6. Sitemap: four entries — `destinations/<slug>`, `de/destinations/<slug>`,
   `sv/destinations/<slug>`, `no/destinations/<slug>` (or the blog
   equivalents), same priority/changefreq as the English entry.
7. `js/pricing.js`'s `DESTINATION_NAMES` is shared across all languages
   (one entry, just a place name used to prefill an address field) — add
   it once, not per language.

### Croatian and Italian (generated, same firing)

Since 2026-10-07 every page also exists in Croatian (`hr/`) and Italian
(`it/`). These are not hand-written HTML files: they are generated from the
English page by `tools/hr/build.py` and `tools/it/build.py` (see
`tools/hr/README.md`). A new page is published in all six languages in the
same firing:

1. Add the English path (e.g. `destinations/<slug>.html` or
   `blog/<slug>.html`) to `tools/hr/pages.txt` and `tools/it/pages.txt`.
2. Write the translations as new dictionary files, one per language:
   `tools/hr/tr_z_<slug_with_underscores>.py` and
   `tools/it/tr_z_<slug_with_underscores>.py`, each defining
   `T = {"English segment": "translation", ...}`. The `tr_z_` prefix makes
   them load after the base files. Cover every segment the build reports:
   the page text, title, meta description, alt/aria text, JSON-LD strings
   (FAQ questions and answers, breadcrumb names) and the new card on
   `destinations.html` or `blog/index.html` (title, excerpt, and for blog
   the "Category · date" line). Reuse existing entries; don't redefine
   shared strings like nav labels.
3. Run `python3 tools/hr/build.py && python3 tools/it/build.py`. Each build
   prints `MISSING in <page>` with every untranslated segment; add them to
   the `tr_z_` file and rebuild until both print `done, pages with
   missing: 0`. Never ship a page with English segments left in it.
4. Then `python3 tools/sync_i18n.py` (hreflang now covers
   en/de/sv/no/hr/it/x-default) and `python3 tools/sitemap_lang.py hr it`
   (adds the `hr/` and `it/` sitemap entries with the English priority).

Language rules: Croatian uses correct cases for place names (do Omiša,
iz Makarske, u Kaštelima; "Zračna luka Split", "vozač", "fiksna cijena").
Italian writes Split as "Spalato" / "aeroporto di Spalato" in running
text; other places keep their Croatian names so they match the booking
widget. Both: no em dashes, no invented facts or prices, same 5 FAQ
questions in the same order, own SEO title (ending in
` | Airport Split Transfer`) and meta description tuned for the language.
If a short English string means something else in context, use a
page-specific key `"segment@@<file>.html"` (see `tools/hr/README.md`).

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
- No em dashes (—) anywhere in page text, titles, meta or JSON-LD. Use a
  comma, a colon or a full stop instead. They read as machine-written, and
  the site was cleaned of them on 2026-10-04.
- Don't invent facts, distances, drive times, or prices. Distances/times
  come from the existing site's known figures where a route is already
  referenced elsewhere (e.g. Rogoznica's page already states 34 km / 35
  min — reuse, don't reinvent); where genuinely new, state the drive time
  as an estimate consistent with the region's known road network and mark
  distance as approximate rather than inventing a false-precision number.
  Never state a fixed € price — the site only ever quotes prices live
  through the booking form.
- SEO title: always ends with the brand suffix ` | Airport Split Transfer` (one suffix site-wide, every language — no "| Fixed Price" or other variants). The 50–60 character target includes the suffix where possible.
- FAQ: exactly 5 questions, matching the FAQPage JSON-LD schema pattern
  used on existing destination pages.
- Internal links: at least 2–3 links to existing destination/blog/day-trip
  pages relevant to the topic (nearby routes, related guides).
- CTA: a `<div class="route-cta">` "Get your fixed price" button straight
  under the page hero, linking to the same language's homepage form with
  the route prefilled: `../index.html?to=<key>#booking` for "Split Airport
  to X" pages and `../index.html?from=<key>#booking` for "X to Split
  Airport" pages. Add `<key>` to `DESTINATION_NAMES` in `js/pricing.js`
  (a geocodable "Place, Croatia" name), otherwise the prefill is skipped.
- Keep the `<!--email_off-->` right after `<body>` and `<!--/email_off-->`
  right before `</body>` (copying an existing page keeps them). The site
  sits behind Cloudflare, whose email obfuscation otherwise turns every
  `info@airportsplittransfer.com` into a link to `/cdn-cgi/l/email-protection`,
  which crawlers see as a 404 linked from every page.

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

1. Run the pre-publish checklist above (steps 1–4).
2. Decide route vs blog template.
3. Write the full English page: copy an existing page of the matching type
   as a structural starting point, replace all content, get the `<head>`
   SEO tags right (title 50–60 chars, meta description 140–160 chars,
   canonical/og/twitter URLs, JSON-LD), 900–1400 words body, 5-question
   FAQ, internal links, CTA.
4. Translate it into German, Swedish and Norwegian per the Languages
   section above — same structure, own tuned SEO title/description,
   nav markup copied from an existing de/sv/no page — then run
   `python3 tools/sync_i18n.py` for hreflang and language switchers.
   Then generate Croatian and Italian per "Croatian and Italian" above
   (pages.txt, `tr_z_` dictionaries, both builds at 0 missing,
   `sync_i18n.py`, `sitemap_lang.py hr it`).
5. If it's a route: add all four versions to `destinations.html` /
   `de/destinations.html` / `sv/destinations.html` / `no/destinations.html`
   grids and one entry to `js/pricing.js`'s `DESTINATION_NAMES`. If it's a
   blog article: add all four to the `blog/index.html` lists. The hr/ and
   it/ grids and lists are rebuilt from the English file automatically.
6. Add four URLs to `sitemap.xml` — English, German, Swedish and Norwegian (match
   the existing entry format — priority 0.8 for routes, 0.5 for blog
   articles, changefreq monthly).
7. Append an entry to `content-pipeline/history.md` (date, type, slug,
   title, all six URLs published (en/de/sv/no/hr/it), and which pre-publish-checklist
   candidates were rejected and why — keeps the audit trail honest for
   the next firing).
8. Commit and push everything on the current branch.
9. Send a short PushNotification naming what was published, with the live
   path (e.g. `/destinations/trogir`, published in EN/DE/SV/NO/HR/IT).
10. Reply in the session with a short summary and all six links.
