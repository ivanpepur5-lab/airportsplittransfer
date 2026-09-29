# Published-by-pipeline history

Newest first. One entry per firing.

## 2026-09-29 — Blog — `blog/split-airport-to-hvar` — EN/DE/SV — "Split Airport to Hvar: How to Get to the Island"
Pre-publish checklist: listed `/destinations/` (26 route pages incl.
Trogir and Primošten; none covering Hvar or any island — Hvar only
appears in passing on the Vinišće pages) and `/blog/` (20 articles, none
on Hvar, islands or ferries beyond a mention of the Split ferry port);
read `history.md` in full (Trogir 2026-09-22, Primošten 2026-09-25).
Candidates considered:
- **Hvar Island** (backlog #4) — selected. By far the strongest name
  recognition of the remaining backlog and a very common search from
  Split Airport arrivals. Ferry-dependent, so written as a blog guide
  (airport → Split ferry port → catamaran/car ferry) rather than a route
  page, since no car transfer drops at the island itself.
- Kaštela (#3, route) — passed over this round: much lower search
  demand than Hvar; still open, good next route candidate.
- Bol & Zlatni Rat, Brač (#5) — same ferry pattern as Hvar; avoided
  publishing two island guides back to back, open for a later firing.
- Biograd na Moru (#8) — rejected as a duplicate: `destinations/biograd`
  (Marina Kornati, Biograd) is already live.
- Split ferry port & island connections (#9) — deferred: partly overlaps
  `destinations/split` (City Center / Ferry Port) and this Hvar guide.
- Klis, Vis, Neum, Solin & Salona — lower priority, left for later.

Published all three languages together: `blog/split-airport-to-hvar.html`,
`de/blog/split-airport-to-hvar.html`, `sv/blog/split-airport-to-hvar.html`
(own tuned SEO title/description per language — EN 56/148, DE 54/156,
SV 56/155 chars; ~1,000–1,150 words each; same 5 FAQ questions in the
same order with matching FAQPage JSON-LD; Article + BreadcrumbList
JSON-LD translated and pointed at the /de/ and /sv/ URLs; hreflang
en/de/sv/x-default on all three; CTA "Book your private transfer" /
"Privattransfer buchen" / "Boka din privata transfer" to the booking
form). No prices stated; crossing times given as approximate ("around an
hour" catamaran, "roughly two hours" car ferry) with a note to check
current timetables; airport → port drive time (~25 min) reused from
`destinations/split`. No images used (none needed).

Internal links: `destinations/split` (ferry port transfer),
`blog/split-airport-to-split-taxi-bus-transfer`, `blog/flight-delay-guide`,
plus Related Reading to `blog/best-time-to-visit-split` — all resolve to
the de/ and sv/ versions on the translated pages.

Wired in: `blog/index.html` + `de/blog/index.html` + `sv/blog/index.html`
(top of the list); three `sitemap.xml` entries (priority 0.5, monthly).
No `DESTINATION_NAMES` entry (blog article, not a route).

Verified before commit: every internal link on all three pages returns
200 (local server), the EN↔DE↔SV lang-switcher links all resolve, every
JSON-LD block on all three pages parses as valid JSON, no horizontal
overflow at 1280/375/320px, no JS errors.

## 2026-09-22 — Route — `destinations/trogir` — EN/DE/SV — "Private Transfer to Trogir"
Published manually as the first run to validate the pipeline end to end
(content, sitemap, DESTINATION_NAMES, destinations.html grid, commit,
push). German and Swedish translations added same day after the
trilingual-publish rule was introduced — this page is the reference
example for the exact three-file pattern (see README's Languages
section). Future entries are added by the scheduled Routines and must
ship all three languages in the same firing.

## 2026-09-25 — Route — `destinations/primosten` — EN/DE/SV — "Private Transfer to Primošten"
Pre-publish checklist: listed `/destinations/` (22 existing pages, none
covering Primošten, Kaštela, Hvar, Brač, Klis, Vis, Biograd, Neum or
Solin); read `history.md` in full (only prior entry: Trogir,
2026-09-22). Candidates considered from the backlog, in priority order:
- **Primošten** (route) — selected. Highest-priority unpublished
  backlog item (#2), strong name recognition, real tourism
  infrastructure (peninsula old town, marina-adjacent charter coast,
  Babić vineyards, Mala Raduča beach, resort/campsite belt), not a
  near-duplicate of any live page.
- Kaštela, Hvar Island, Bol/Zlatni Rat (Brač) — passed over in favour of
  Primošten this round; still open for a future firing.
- Klis Fortress, Split ferry port, Neum, Solin & Salona — blog-type
  topics lower in stated priority order; left for later firings.

Published all three languages together: `destinations/primosten.html`,
`de/destinations/primosten.html`, `sv/destinations/primosten.html`,
built from the `trogir.html` three-file pattern (own tuned SEO
title/description per language, hreflang set on all three, translated
nav/lang-switch/breadcrumb JSON-LD, 5-question FAQ matching FAQPage
JSON-LD, ~1000 words). No price hardcoded — every mention points to the
live booking form. Distance (~35 km) and drive time stated as estimates
per the backlog figure, not a verified precise number.

Wired in: `destinations.html` + `de/destinations.html` +
`sv/destinations.html` grids (after Trogir); `js/pricing.js`
`DESTINATION_NAMES.primosten`; three `sitemap.xml` entries (priority
0.8, monthly), inserted alphabetically between `podstrana` and
`promajna` in all three language blocks.

Verified before commit: all internal links on all three pages return
200 (headless fetch), the EN↔DE↔SV lang-switcher round-trips correctly,
every JSON-LD block on all three pages parses as valid JSON, and no
horizontal overflow at 1280/375/320px. Full-site audit (153→156
sitemap entries) shows no duplicate titles/descriptions, no missing
sitemap files, no hreflang gaps.

<!-- New entries are appended above this line by each scheduled firing. -->
