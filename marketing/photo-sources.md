# Photo sources for the day-trip pages (added 2026-10-23)

All images are from Pexels (free to use, no attribution required) or were already on the site.
The files in assets/ are resized and cropped copies (hero 1600x685, mobile 900x1125, card 900x675).

| Page | Image | Source |
|---|---|---|
| mostar-kravice | daytrips-mostar-hero* | Pexels photo 8395586, aerial view of the Old Bridge in Mostar |
| klis-fortress-trogir | daytrips-klis-hero* | Pexels photo 17800939, Klis Fortress (Sergei Gussev) |
| biokovo-skywalk | daytrips-biokovo-hero* | Pexels photo 13368875, Biokovo mountains above Makarska |
| dubrovnik-ston | daytrips-dubrovnik-hero* | made from the existing assets/daytrips-dubrovnik-banner |
| (unused) | daytrips-kravice-hero* | Pexels photo 19523476, Kravica waterfalls; ready if the Mostar page should show the waterfalls |

Pexels page: https://www.pexels.com/photo/<id>/

# Photos on route, airport, service and blog pages (added 2026-10-23)

Wide 1600x685 (photo-<key>) and mobile 900x675 (photo-<key>-m), WebP and AVIF, in assets/.
Pages and keys are listed in the page-to-photo table of the build notes below; alt texts exist in EN, DE, SV, NO, HR and IT (tools/hr|it/tr_zz_photos.py).

| Key | Source |
|---|---|
| split, trogir, omis, podstrana, makarska, dubrovnik, zadar, brela | Ivan's own photos (sent as uploads) |
| baska | Pexels photo 34592243 |
| riviera | Pexels photo 2040626 |
| sibenik | Pexels photo 17563088 |
| sibenikcoast | Pexels photo 33428547 |
| primosten | Pexels photo 33321089 |
| rogoznica | Pexels photo 38484670 |
| murter | Pexels photo 18295967 |
| kastela | Pexels photo 27651157 |
| kornati | Pexels photo 5306582 |
| hvar | Pexels photo 2265876 |
| brac | Pexels photo 27651484 |
| plitvice | copy of daytrips-plitvice-hero (existing site photo) |

Use: the figure is `<figure class="scenic">` right under the hero (after `.route-cta` on route and service pages, after the hero block on airport and blog pages). Nearby places share a photo of the same stretch of coast (for example Marina Frapa, Ražanj, Grebaštica and Rogoznica use the Rogoznica coast photo).
