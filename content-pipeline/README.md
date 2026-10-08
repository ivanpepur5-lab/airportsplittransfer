# SEO content pipeline — routes & blog

Once a week (Tuesday) the routine researches and **drafts** one new
transfer-route page or blog article for airportsplittransfer.com, never
repeating a topic already covered. **Nothing is published until Ivan has
read the draft and approved it** (since 2026-10-08, see "Google's rules"
below). Before that date the pipeline published twice a week without
review; that is no longer allowed.

## Google's rules this pipeline follows (2026-10-08)

Google's guidance on generative AI content and its spam policies:
https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
https://developers.google.com/search/docs/essentials/spam-policies

- **Scaled content abuse:** many pages that add little value (generated,
  translated or reworded) are spam whatever tool made them. So: one
  article a week at most, each one genuinely useful on its own, and no
  new page just to cover one more place name.
- **Doorway abuse:** many near-identical pages for different towns that
  all lead to the same form are spam. So: **one page per destination for
  both directions.** The trip back to the airport is a `#to-airport`
  section on the destination page (see `destinations/trogir.html`), never
  a separate "X to Split Airport" page. The 26 old reverse pages were
  merged on 2026-10-08 and 301-redirected (`_redirects`).
- **Human review and accuracy:** a person checks AI text, titles, meta
  descriptions and alt text before they go live. The draft lists every
  fact that needs checking; Ivan confirms or corrects them.
- **First-hand experience:** each draft asks Ivan one to three concrete
  questions about the route or topic (where guests are dropped, traffic,
  what guests ask). His answers go into the page in his words, never
  invented. If he has nothing to add, the page goes out without it, but
  nothing is made up to fill the gap.
- **No new pages for small places** unless there is real demand and real
  content: a new destination page needs at least as much unique, useful
  content as the existing village pages, not a template with a new name.

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
`#to-airport` section for the trip back → FAQ → FAQPage JSON-LD). One page
covers both directions; never create a separate "X to Split Airport" page. Price is never hardcoded — every route page points to
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
Norwegian (Bokmål), Croatian and Italian **together, in the same publication**
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

### Croatian and Italian (generated, same publication)

Since 2026-10-07 every page also exists in Croatian (`hr/`) and Italian
(`it/`). These are not hand-written HTML files: they are generated from the
English page by `tools/hr/build.py` and `tools/it/build.py` (see
`tools/hr/README.md`). A new page is published in all six languages in the
same publication:

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
  the route prefilled: `../index.html?to=<key>#booking`. The `#to-airport`
  section ends with its own button for the trip back,
  `../index.html?from=<key>#booking`. Add `<key>` to `DESTINATION_NAMES` in `js/pricing.js`
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

One Routine fires weekly (Europe/Zagreb time, currently CEST/UTC+2 — see
the daylight-saving note in `marketing/gbp-scheduler/README.md`, same
caveat applies here):

- Tuesday 10:00 local → `0 8 * * 2` UTC: research and **draft only**.

The Friday Routine was switched off on 2026-10-08.

## Workflow

### Phase 1: the Tuesday firing (draft, nothing published)

1. Run the pre-publish checklist above (steps 1–4).
2. Decide route vs blog template.
3. Write the English draft as Markdown in
   `content-pipeline/drafts/YYYY-MM-DD-<slug>.md`: proposed SEO title and
   meta description, H1, the full body (900–1400 words), the 5 FAQ
   questions and answers, the internal links you plan, and for a route the
   `#to-airport` section text. Content rules below apply in full.
4. At the end of the draft add two lists: **Facts to check** (every
   distance, time, opening rule, ferry or road detail, place name, with
   where it came from) and **Questions for Ivan** (one to three concrete
   questions about first-hand experience of this route or topic).
5. Commit and push only the draft (Netlify skips the build for
   `content-pipeline/`, so this costs no deploy credits).
6. Reply in the session in Croatian: topic and why, a short summary, the
   facts to check, the questions, and that nothing is published until he
   approves. No PushNotification about a publication, because there is
   none.

### Phase 2: after Ivan approves (in the session)

1. Apply his corrections and put his answers into the text in his words.
   If he corrected a fact, fix it everywhere it appears.
2. Build the English page from the approved draft: copy an existing page
   of the matching type as a structural starting point, get the `<head>`
   SEO tags right (title 50–60 chars, meta description 140–160 chars,
   canonical/og/twitter URLs, JSON-LD), FAQ, internal links, CTA.
3. Translate it into German, Swedish and Norwegian per the Languages
   section above — same structure, own tuned SEO title/description, nav
   markup copied from an existing de/sv/no page — then run
   `python3 tools/sync_i18n.py`. Then generate Croatian and Italian per
   "Croatian and Italian" above (pages.txt, `tr_z_` dictionaries, both
   builds at 0 missing, `sync_i18n.py`, `sitemap_lang.py hr it`).
4. Route: add all four versions to the `destinations.html` grids (de/sv/no
   too) with both buttons ("From Airport" → page, "To Airport" →
   page`#to-airport`) and one entry to `js/pricing.js`'s
   `DESTINATION_NAMES`. Blog: add all four to the `blog/index.html` lists.
   The hr/ and it/ versions are rebuilt from English automatically.
5. Add the en/de/sv/no URLs to `sitemap.xml` (priority 0.8 routes, 0.5
   blog, changefreq monthly); `sitemap_lang.py` adds hr/it.
6. Verify: internal links resolve, language switch works, every JSON-LD
   block parses, no em dashes.
7. Append to `content-pipeline/history.md` (date, type, slug, title, all six
   URLs, candidates considered/rejected, and "approved by Ivan on <date>").
   Move the draft to `content-pipeline/drafts/published/`.
8. Commit and push everything in **one** push (each push to the site is a
   Netlify production deploy and costs credits; never push in pieces).
9. Reply in Croatian with a short summary and all six links.
