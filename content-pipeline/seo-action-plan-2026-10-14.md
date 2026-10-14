# SEO action plan from Search Console, 2026-10-14

Baseline (GSC, 14 Oct 2026): homepage 792 impressions, 15 clicks, 1.89% CTR,
average position 22.81. "split airport transfer" position 32.7 (47 impr.),
"split airport transfers" position 39.7 (95 impr.), "airport split transfer"
(brand) position 5.4 (8 clicks). DE pricing guide 89 impr., position 7.4, 0
clicks. SV pricing guide 48 impr., position 5.8, 0 clicks. Makarska guide 66
impr., position 14.0. Family page 7 impr., 2 clicks, position 2.9.

## Verified in the code (14 Oct)
- www redirects to non-www (`_redirects`, 301!); no www URL anywhere in HTML,
  sitemap, hreflang or JSON-LD; canonicals self-referencing on 498 pages.
- hreflang reciprocal on all 3,486 links; sitemap 498 unique URLs, all exist,
  none noindex; internal links present in raw HTML (no JS needed).
- Booking form: route and price first, details after the price, flight number
  optional and last.

## Changed
- DE and SV taxi price guides: new title and meta description (price range
  from the page itself). Committed 14 Oct, deploys with the next push.

## Waiting for Ivan (needs his input or decision)
1. Footer "popular routes" has Split, Podstrana, Omiš, Makarska, Brela but not
   Trogir (19 internal links vs 70+ for the others). Which routes sell most?
2. Makarska has three pages (route, guide, transport options). Keep, but the
   guide needs first-hand detail (Ivan's answers).
3. Family page has only one internal link; add one from the homepage FAQ
   (child seats) and the fleet page, in all six languages.
4. FAQ answers in faq-questions-for-ivan.md.

## Measure after 14 and 28 days (GSC, same filters)
- DE and SV guides: CTR above 1% and at least 2 clicks each (position about
  the same). Note: 89 and 48 impressions are small samples.
- Homepage: impressions up, position under 20 for "split airport transfer(s)";
  CTR at or above 1.9% after the new title (live since 14 Oct).
- Makarska guide and route page: which one gets impressions for "split airport
  to makarska"; clicks to the booking form from the guide.
- Booking requests per 100 organic clicks (Netlify forms + WhatsApp clicks).
