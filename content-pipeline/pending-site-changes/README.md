# Pending site changes (queued, not yet applied)

Production deploys cost Netlify credits (15 each; Free plan = 300 credits per
month, billing period 12 Oct to 11 Nov). Ivan wants changes batched, so
approved site changes wait here as patches and are applied together with the
next change that is worth a deploy. Nothing in this folder is published (the
folder is excluded by the build ignore rule in netlify.toml, so pushing it
does not trigger a deploy).

To apply the queue: `git apply content-pipeline/pending-site-changes/*.patch`
in name order, run the checks, commit, then push once. Delete each patch
after it is applied.

Queue: no patches right now. Everything queued so far (patches 001 to 005)
went live on 2026-10-12 in one deploy.

## Approved by Ivan, to be built and published together with the next change (2026-10-13)

Do NOT deploy these alone (15 credits per deploy); wait for the next change
Ivan wants live, then do one deploy for all of it.

1. **Make the airport pages findable.** Add "Dubrovnik Airport Transfers"
   and "Zadar Airport Transfers" to the Quick Links in the footer of every
   page (6 languages), and an "Other airports" section with two cards on the
   Routes page (destinations.html, 6 languages). Not on the homepage (Ivan
   agreed: it should stay focused on Split Airport; revisit after the 19.10
   metrics). Targets: /airports/dubrovnik-airport and /airports/zadar-airport.
2. **Stop stale CSS/JS after a deploy.** Cloudflare (and browsers, Cloudflare
   default Browser Cache TTL is 4 h) kept the old style.css and
   booking-widget.js after the 12 Oct deploy, so the new HTML ran with old
   CSS. Add a content-hash version to the stylesheet and script URLs
   (`style.css?v=<hash>`, `pricing.js?v=`, `booking-widget.js?v=`, ...) on
   every page, with a small script in tools/ to restamp them, and run it on
   every deploy. Ivan was also asked to purge the Cloudflare cache and set
   Browser Cache TTL to "Respect Existing Headers".
3. Ivan to do himself: request indexing of the two airport URLs in Search
   Console (URL inspection), resubmit sitemap.xml (498 URLs).

