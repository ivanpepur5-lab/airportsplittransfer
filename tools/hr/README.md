# Croatian (hr/) pages

The `hr/` pages are generated from the English pages, not edited by hand.

- `tr_a.py` … `tr_e.py`: English → Croatian dictionaries (one entry per
  text segment: visible text, titles, meta descriptions, alt/aria text and
  JSON-LD strings). `tr_d.py` builds the templated route-page sentences from
  a place table with Croatian cases (do Omiša, iz Makarske, u Kaštelima).
- `trtool.py`: extracts segments, swaps in the translations, sets
  `lang="hr"`, `og:locale`, canonical/og:url, the hidden `lang` field, and
  rewrites relative URLs for the extra folder level (links to pages that
  exist in Croatian stay inside `hr/`, everything else points to English).
- `pages.txt`: the pages that have a Croatian version (since 2026-10-07 every
  English page: core, routes, marinas, hotels, day trips, services, blog).

Rebuild after changing an English page that has a Croatian twin:

    python3 tools/hr/build.py && python3 tools/sync_i18n.py

The build stops with a list of any English text that has no translation
yet: add those strings to a `tr_*.py` file and run it again. The booking
widget partial is built to `partials/booking-widget.hr.html`.

Extras in the tool:

- **Page-specific entries.** A key written as `"segment@@file.html"` wins over
  the shared `"segment"` on that page only. Use it when a short English
  string means something different in context, e.g. `"About@@marina-frapa.html"`
  ("About 34 km", not the "About" menu item) or a Croatian case that changes
  with the sentence (`"Krka National Park@@trogir.html"`).
- **Inline scripts.** Text inside `<script>` blocks is not touched by the
  segment tool. A `tr_*.py` file can define `JSR = {"english literal":
  "translated literal"}`; the build replaces those strings in the generated
  pages (used for the day-trip form's "Sending..." and error message).
- Every `tr_*.py` file in this folder is loaded, in name order; a later file
  overrides an earlier one for the same key.
- New pages in the sitemap: `python3 tools/sitemap_lang.py hr it` adds an entry
  for every page in `pages.txt` that is missing (priority copied from English).

When an English page changes, rebuild both languages; the build lists any new
English text that still needs a translation. New pages from the scheduled
content pipeline (Tue/Fri) are added here in the same firing: the page goes
into both `pages.txt` files and its translations into
`tr_z_<slug_with_underscores>.py` in each folder (see "Croatian and
Italian" in `content-pipeline/README.md`).
