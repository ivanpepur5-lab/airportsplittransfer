# Published-by-pipeline history

Newest first. One entry per firing.

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
