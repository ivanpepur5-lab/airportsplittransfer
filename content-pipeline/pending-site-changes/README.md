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

## Built 2026-10-13, committed, waiting for Ivan's go-ahead to publish

One deploy (15 credits) covers all of this. It is in the branch commit, not yet
pushed. Contents:

1. Airport pages (Dubrovnik, Zadar; 6 languages): per-route buttons removed,
   one "Get Your Fixed Price" button to `index.html?pickup=dbvairport|zadairport#booking`
   (js/booking-widget.js fills only the pickup when ?pickup= is used alone).
2. Footer links to both airport pages on every page, and an "Other airports"
   section on the Routes page (destinations.html, 6 languages).
3. Content-hash `?v=` on css/js URLs (tools/stamp_assets.py), also run as the
   Netlify build command as a safety net.
4. Ivan to do himself after publishing: Cloudflare Purge Everything and Browser
   Cache TTL "Respect Existing Headers"; request indexing of the two English
   airport URLs in Search Console and resubmit sitemap.xml (498 URLs).
