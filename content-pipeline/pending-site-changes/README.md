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
