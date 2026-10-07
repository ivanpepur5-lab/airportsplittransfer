# Italian (it/) pages

Same tool as `tools/hr/` (see that README), with Italian dictionaries.

- `tr_a.py` … `tr_e.py`: English → Italian dictionaries. Split is written
  "Spalato" / "aeroporto di Spalato" in text; other places keep their
  Croatian names so they match the booking widget. `tr_d.py` builds the
  templated route-page sentences from a place table ("a Omiš", "da Omiš").
- `pages.txt`: the pages that have an Italian version (since 2026-10-07 every
  English page, same set as hr). Page-specific entries (`segment@@file.html`),
  `JSR` script strings and `tools/sitemap_lang.py` work as described in
  `tools/hr/README.md`.

Rebuild after changing an English page that has an Italian twin:

    python3 tools/it/build.py && python3 tools/sync_i18n.py

The booking widget partial is built to `partials/booking-widget.it.html`.
