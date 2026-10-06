# Published-by-pipeline history

Newest first. One entry per firing.

## 2026-10-02 — Route — `destinations/kastela` — EN/DE/SV — "Private Transfer to Kaštela"
Pre-publish checklist: listed `/destinations/` (26 route pages, each with
a `-to-split-airport` reverse page; none covering Kaštela or any of its
seven villages — Kaštela only appears in passing on the Trogir page) and
`/blog/` (21 articles, none on Kaštela); read `history.md` in full
(Trogir 09-22, Primošten 09-25, Hvar guide 09-29).
Candidates considered:
- **Kaštela** (backlog #3, route) — selected. Marked "good next route
  candidate" last firing; the airport itself sits in Kaštela, it is the
  business's home base, and GSC already shows Kaštela taxi queries. Real
  infrastructure: seven castle villages, apartments/hotels along the bay,
  Game of Thrones location (Kaštilac, Gomilica).
- Bol & Zlatni Rat, Brač (#5) — strongest remaining name recognition,
  but another ferry-dependent island guide only three days after Hvar;
  kept as the top candidate for the next firing.
- Marina topics (Frapa, ACI Trogir, ACI Split, Kornati, Baotić,
  Mandalina) — deliberately not picked: Ivan has a dedicated batch of
  Split Airport → marina pages planned for 2026-10-03, so publishing one
  here would duplicate it.
- Klis, Vis, Split ferry port guide, Neum, Solin & Salona — lower
  priority, left for later firings.

Published all three languages together: `destinations/kastela.html`,
`de/destinations/kastela.html`, `sv/destinations/kastela.html`, built
from the `trogir.html` three-file pattern (SEO title/description EN
58/157, DE 57/149, SV 57/154 chars; ~910–1,020 words each; same 5 FAQ
questions in the same order with matching FAQPage JSON-LD; translated
BreadcrumbList pointed at the /de/ and /sv/ URLs; hreflang
en/de/sv/x-default on all three; CTA to the booking form). No price
stated anywhere. Distances given as estimates only: villages stretch
"roughly 17 km" along the bay, drive "a few minutes" to the western
villages and "around 15 to 20 minutes" to Kaštel Sućurac outside summer
traffic. No images used.

Internal links: `destinations/trogir`, `destinations/split`,
`destinations/segetdonji`, `day-trips/krka-national-park`,
`blog/early-morning-transfer-to-split-airport` — all resolve to the de/
and sv/ versions on the translated pages.

Wired in: `destinations.html` + `de/destinations.html` +
`sv/destinations.html` grids (after Primošten, "From Airport" link only —
no reverse `kastela-to-split-airport` page yet); `js/pricing.js`
`DESTINATION_NAMES.kastela`; three `sitemap.xml` entries (priority 0.8,
monthly) before `grebastica` in each language block. `tools/sync_i18n.py`
run afterwards (no changes needed; NO switcher points to /no/ until a
Norwegian version exists).

Verified before commit: all internal links on all three pages return 200
(local server), EN↔DE↔SV lang-switcher links resolve, every JSON-LD
block parses as valid JSON, no horizontal overflow at 1280/375/320px, no
JS errors, regression suite 21/21.

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

## 2026-10-04 — Charter marinas (7 marinas × EN/DE/SV/NO, 28 pages)

`destinations/{aci-marina-split, aci-marina-trogir, marina-baotic,
marina-kastela, marina-agana, marina-mandalina, marina-dalmacija}.html`
plus their `de/`, `sv/` and `no/` twins. Built on Ivan's request after the
"too AI" review: short hero, one button to `index.html?to=<key>#booking`
(Ivan chose a button over an on-page form), facts line, getting there
with a four-step strip, about the marina, five FAQs. No em dashes, no
prices, distances and times marked approximate.

Wired in: cards at the end of the "Smaller Villages & Marinas" grid on
all four destinations pages; `DESTINATION_NAMES` keys `acisplit`,
`acitrogir`, `baotic`, `marinakastela`, `agana`, `mandalina`,
`marinadalmacija`; 28 sitemap entries; hreflang via `tools/sync_i18n.py`.
Don't propose these marinas again as new topics.

## 2026-10-05 — Marina Frapa and Marina Kornati split out (2 marinas × EN/DE/SV/NO, 8 pages)

`destinations/{marina-frapa, marina-kornati}.html` plus `de/`, `sv/`, `no/`
twins, same generator and format as the 2026-10-04 marinas. Reason: Search
Console showed "split airport to marina frapa" (22 impressions) and
"split airport to marina kornati" (12) landing on the combined town pages.
`rogoznica.html` and `biograd.html` (all 4 languages) are now town pages:
title, meta, H1, breadcrumb and FAQ say Rogoznica / Biograd na Moru, and the
hero links to the marina page (the marina pages link back). Keys:
`frapa`, `kornati` added; `rogoznica` now prefills "Rogoznica, Croatia".
Grid cards added after Marina Dalmacija; town cards renamed; 8 sitemap
entries. Don't propose these two marinas again as new topics.

## 2026-10-05 — Audience pages under services/ (3 pages × EN/DE/SV/NO, 12 pages)

`services/{split-airport-transfer-with-kids, split-group-transfers,
split-port-transfers}.html` plus `de/`, `sv/`, `no/` twins. Pages by who is
travelling rather than where to (families with kids, groups and events,
cruise and ferry passengers). Same layout as the marina pages: hero, one
button, facts line, copy, four steps, five FAQs, no on-page form, no em
dashes. Buttons: families `index.html#booking`, groups
`index.html?vehicle=trafic#booking`, port `index.html?from=splitport#booking`
(new `DESTINATION_NAMES` key `splitport`). Linked from a new "Who we drive"
block on all four services pages; 12 sitemap entries; `services/*.html`
added to `tools/sync_i18n.py`. Don't propose these three audiences again.
Business travellers added the same day as a fourth page
(`services/split-airport-business-transfers.html`): Ivan confirmed he
issues R1 / company invoices. A separate weddings page is still not built.

## 2026-10-05 — Croatian (hr/), phase 1: 26 pages, booking and emails

Core pages (home, Split Airport taxi, destinations, fleet, services, about,
contact, privacy, terms) and the main routes both ways (Split, Trogir,
Kaštela, Podstrana, Omiš, Makarska, Brela, Baška Voda, Dubrovnik). Booking
widget (`partials/booking-widget.hr.html`), form validation, contact form,
Klaro cookie banner, customer confirmation email and subjects in Croatian;
forms send `lang=hr`. HR added to every page's language switcher and
hreflang via `tools/sync_i18n.py`; 26 sitemap URLs. Pages are generated
from the English ones with `tools/hr/build.py` (see `tools/hr/README.md`).
Phase 2 (blog, hotels, marinas, day trips, other routes, services/ pages)
waits for Ivan's go-ahead. New content from the scheduled pipeline stays
EN/DE/SV/NO; untranslated hr links fall back to English automatically.

## 2026-10-06 — Blog — `blog/split-airport-to-bol-brac` — EN/DE/SV/NO — "Split Airport to Bol and Zlatni Rat: Getting to Brač"
Pre-publish checklist: listed `/destinations/` (35 route pages incl. the
9 charter marinas, Kaštela, Trogir, Primošten; none on Brač or any
island) and `/blog/` (21 articles; Hvar is the only island guide);
read `history.md` in full (latest: Croatian phase 1, audience pages,
Frapa/Kornati, marinas, Kaštela 2026-10-02, Hvar 2026-09-29).
Candidates considered:
- **Bol & Zlatni Rat, Brač** (backlog #5) — selected. Croatia's best-known
  beach, strongest name recognition left in the backlog, and it was only
  held back last time to avoid two island guides in a row. Ferry-dependent,
  so written as a blog guide like Hvar (airport → Split ferry port →
  summer catamaran to Bol or car ferry to Supetar), not a route page.
- Klis Fortress (#6), Vis (#7), Neum (#10), Solin & Salona (#11) — lower
  search demand; left open for later firings.
- Split ferry port & island connections (#9) — now largely covered by
  `services/split-port-transfers` (2026-10-05) plus the Hvar and Bol
  guides; treat as covered unless a distinct angle appears.
- Biograd na Moru (#8) — already live (`destinations/biograd`).

Published all four languages together: `blog/split-airport-to-bol-brac.html`,
`de/…`, `sv/…`, `no/blog/split-airport-to-bol-brac.html`. SEO titles
EN 60 / DE 61 / SV 61 / NO 61 chars, descriptions 146 / 153 / 154 / 153;
~1,080–1,200 words each; same 5 FAQs in the same order with FAQPage
JSON-LD; Article + BreadcrumbList JSON-LD per language URL. No prices;
crossing times approximate (car ferry to Supetar ~50 min, summer
catamaran to Bol ~1 h, Supetar to Bol ~40 min drive) with a note to check
timetables; airport → port ~25 min reused from `destinations/split`;
Vidova Gora 778 m. CTA "Book your private transfer" to
`../index.html?to=splitport#booking` (existing key). No images.

Internal links: `destinations/split`, `services/split-port-transfers`,
`blog/split-airport-to-split-taxi-bus-transfer`, `blog/flight-delay-guide`,
`blog/split-airport-to-hvar` (body + Related Reading), all to the same
language. Wired in: top card on the four `blog/index.html` files; four
sitemap entries (0.5, monthly). No `DESTINATION_NAMES` entry needed.

Verified before commit: every link on all four pages returns 200, the
EN/DE/SV/NO switcher links resolve, all JSON-LD blocks parse, no
horizontal overflow at 1280/375 px, no JS errors.

## 2026-10-06 — Italian (it/), phase 1: 26 pages, booking and emails

Same 26 pages as hr phase 1: core pages and the main routes both ways.
Booking widget (`partials/booking-widget.it.html`), form validation,
contact form, Klaro cookie banner, customer confirmation email
(`booking-confirmation-customer.it.*`) and subjects in Italian; forms send
`lang=it`. Split is "Spalato" in text, other place names stay Croatian.
IT added to every page's language switcher and hreflang via
`tools/sync_i18n.py`; 26 sitemap URLs. Built with `tools/it/build.py`
(see `tools/it/README.md`). Mobile menu language pills now wrap (6 langs).
New content from the scheduled pipeline stays EN/DE/SV/NO; untranslated
it links fall back to English automatically.

<!-- New entries are appended above this line by each scheduled firing. -->
