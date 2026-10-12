# Pending site changes (queued, not yet applied)

Production deploys cost Netlify credits (15 each; Free plan = 300 credits per
month, billing period 12 Oct to 11 Nov). Ivan wants changes batched, so
approved site changes wait here as patches and are applied together with the
next change that is worth a deploy. Nothing in this folder is published (the
folder is excluded by the build ignore rule in netlify.toml, so pushing it
does not trigger a deploy).

To apply the queue: `git apply content-pipeline/pending-site-changes/*.patch`
(in name order), rebuild if a patch touches EN/DE/SV/NO sources
(`python3 tools/hr/build.py && python3 tools/it/build.py && python3 tools/sync_i18n.py`
only if the patch does not already contain the generated hr/it files; the
patches here include them), run the checks, commit, then push once. Delete
each patch after it is applied.

| # | Patch | What | Queued |
|---|-------|------|--------|
| 001 | 001-remove-vclass-photo-from-fleet.patch | Remove the V-Class on-the-road photo from the Vehicles page (all 6 languages). It stays on the Dubrovnik route page. Ivan: "debilno izgleda". | 2026-10-12 |
| 002 | 002-swap-button-restyle.patch | Booking form swap button: arrows icon (up/down on phones, sideways on desktop), white round button centred between the Pickup and Dropoff fields instead of on the Dropoff label line. Touches css/style.css and the six booking-widget partials. Ivan: "promijenit izgled i stavit po sredini". | 2026-10-12 |
| 003 | 003-airport-pages-dubrovnik-zadar.patch | New pages /airports/dubrovnik-airport and /airports/zadar-airport (6 languages): private long transfers from DBV to Split and Makarska, from ZAD to Šibenik, Split and Plitvice (only destinations at least 50 km from the airport, stated on the pages). Includes pricing.js keys (dbvairport, zadairport), the ?pickup= prefill in booking-widget.js, links from the Dubrovnik and Zadar route pages, sitemap (498 URLs), llms.txt and the hr/it dictionaries. Ivan: yes, no local taxi advertising, prices from the calculator. | 2026-10-12 |
