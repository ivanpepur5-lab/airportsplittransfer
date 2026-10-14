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

## Published 2026-10-14 (one deploy)

Airport pages with a single booking button, footer and Routes-page links,
hashed css/js URLs, homepage title (EN "Private Split Airport Transfers |
Fixed Price, Door to Door"), titles shortened to 60 characters or less on
all languages, "passengers" instead of "pax", "Frequently Asked Questions"
instead of "Common Questions", "Drop-off" label, hotel card alt texts, review
count 39 in the homepage and contact structured data, stray .whl files
removed. Not done on purpose: redirect /index.html to / (cannot be tested
without production), long cache for css/js (partials are not versioned).

Queue: no patches right now.
