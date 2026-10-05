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
- `pages.txt`: the pages currently translated (phase 1).

Rebuild after changing an English page that has a Croatian twin:

    python3 tools/hr/build.py && python3 tools/sync_i18n.py

The build stops with a list of any English text that has no translation
yet: add those strings to a `tr_*.py` file and run it again. The booking
widget partial is built to `partials/booking-widget.hr.html`.
