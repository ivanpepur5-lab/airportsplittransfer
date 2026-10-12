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

Queue: empty. Everything queued so far (patches 001 to 005) went live on
2026-10-12 in one deploy.
