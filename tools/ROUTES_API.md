# Routes library instead of DistanceMatrixService

The booking form prices every trip from the driving distance Google returns for the two typed addresses.
Google marked `google.maps.DistanceMatrixService` deprecated on 25 February 2026 (not scheduled to be switched
off, but no longer developed). `js/booking-widget.js` now asks the Routes library first.

## What the code does

- `lookupDistanceKmRoutes(pickup, dropoff)`: `google.maps.importLibrary('routes')`, then
  `RouteMatrix.computeRouteMatrix({origins, destinations, travelMode: 'DRIVING', routingPreference: 'TRAFFIC_UNAWARE', fields: ['distanceMeters', 'condition']})`.
  `TRAFFIC_UNAWARE` keeps the distance independent of the time of day, like the old service.
  Resolves to km, or `null` when no route exists.
- `lookupDistanceKmLegacy(pickup, dropoff)`: the old `DistanceMatrixService` call, same result type.
- `fetchDistance()` uses the Routes library; if that fails (library missing, Routes API not enabled for the key,
  network error) it logs a warning, switches to the legacy service for the rest of the page view and prices as before.
  Pricing therefore cannot go dark because of this change.
- Prices, tiers and rounding in `js/pricing.js` are untouched; the only input that changes is where km come from.

## Test results (2026-10-23, live key, run from the site's own origin)

- 43 routes from Split Airport (every destination in `DESTINATION_NAMES` plus hotels): Routes km equal the legacy km,
  largest difference 0.000 km. No Routes errors.
- Same result for typed addresses (street addresses in Split and Makarska, Dubrovnik and Zadar airport pickups).
- Islands (Hvar, Bol): both services return the same km. Nonsense address: both return no route, the form shows no price.
- Full form path: Omiš 90, Šibenik Solaris 90, Plitvice 320, unchanged. With the Routes import forced to fail, the form
  still prices Omiš 90 through the legacy service (`routesLibraryBroken` becomes true).

## Re-running the check

Open the live page with Playwright, serve the local `js/booking-widget.js` for that one URL, call `loadGoogleMaps()`,
then evaluate `lookupDistanceKmRoutes(a, b)` and `lookupDistanceKmLegacy(a, b)` for each destination and compare.
Only run it from `https://airportsplittransfer.com/` (the key is restricted to that origin).

## Rollback

`git revert` the commit that added this file. Nothing else depends on it.

## Address suggestions (Places API (New))

The legacy `google.maps.places.Autocomplete` widget is closed to new Google customers (existing keys still work).
The replacement element, `PlaceAutocompleteElement`, would replace the text input itself, which the form's
code, styling and Netlify submission all depend on. So `js/booking-widget.js` keeps the input and draws its own
suggestion list under it from `AutocompleteSuggestion.fetchAutocompleteSuggestions` (Places API (New) data):

- 2+ characters, 180 ms debounce, Croatia only (`includedRegionCodes: ['hr']`, as before), 5 suggestions, one
  session token per typing session; a selection fetches `displayName`, `formattedAddress`, `location`, fills the input
  (same display rule as before: place name is added when the address lacks it), sets the hidden lat/lng fields and
  triggers the price lookup.
- Keyboard: arrows, Enter, Escape; mouse and touch; ARIA combobox/listbox roles. The list ends with the text
  "Google Maps", the attribution Google requires for predictions shown outside a Google map (Roboto/sans-serif,
  400, #5E5E5E, 12 px).
- If the first request fails (Places API (New) not enabled for the key, network error), the page switches to the
  legacy widget, so visitors still get suggestions.
- CSS: `.addr-suggest` at the end of `css/style.css`; `.hero--booking` clips only sideways (`overflow-x: clip`)
  so the list can drop below the hero's bottom edge.

Tested on the live key from the site's own origin (desktop 1280 px and mobile 390 px): list shows 5 suggestions plus
attribution; arrow keys + Enter, mouse click, Escape and blur behave; selecting fills the field and prices the
route (Omiš 80 from a Kaštel Stari pickup); with the new API forced to fail the legacy widget takes over.
Also checked on `split-airport-transfers.html` and the Croatian homepage: no clipping, no horizontal scroll.

## Still on deprecated APIs

Nothing the form needs. (Both lookups, distance and address suggestions, use the current APIs; the legacy
fallbacks only run when a current one fails.)
