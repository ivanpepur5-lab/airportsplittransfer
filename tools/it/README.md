# Italian (it/) pages

Same tool as `tools/hr/` (see that README), with Italian dictionaries.

- `tr_a.py` … `tr_e.py`: English → Italian dictionaries. Split is written
  "Spalato" / "aeroporto di Spalato" in text; other places keep their
  Croatian names so they match the booking widget. `tr_d.py` builds the
  templated route-page sentences from a place table ("a Omiš", "da Omiš").
- `pages.txt`: the pages currently translated (same 26 as hr phase 1).

Rebuild after changing an English page that has an Italian twin:

    python3 tools/it/build.py && python3 tools/sync_i18n.py

The booking widget partial is built to `partials/booking-widget.it.html`.
