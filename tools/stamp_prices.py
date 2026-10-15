#!/usr/bin/env python3
"""Fill in every `<span data-price="route:vehicle">…</span>` with the price the
booking form would calculate for that route, so prices on the pages (route
pages, homepage cards, fleet page) can never drift from js/pricing.js.

  python3 tools/stamp_prices.py          rewrite pages in place
  python3 tools/stamp_prices.py --check  only report, exit 1 if a page is stale

route: key of tools/route_km.json (driving km from Split Airport, taken from
       the Distance figure on the route page)
vehicle: skoda (car), vclass or trafic (vans)

Prices come from pricing.js itself (priceForDistance, run with node), so a
change to the tariff only needs this script to be run again. It is also part of
the Netlify build command."""
import glob, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
KM = json.load(open("tools/route_km.json"))

NODE = r"""
const fs = require('fs'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/pricing.js', 'utf8'), ctx);
const km = JSON.parse(fs.readFileSync('tools/route_km.json', 'utf8'));
const out = {};
for (const [slug, d] of Object.entries(km)) {
  out[slug] = {};
  for (const v of ['skoda', 'vclass', 'trafic'])
    out[slug][v] = vm.runInContext(`priceForDistance(${d}, '${v}')`, ctx);
}
console.log(JSON.stringify(out));
"""
PRICES = json.loads(subprocess.check_output(["node", "-e", NODE], text=True))

PAT = re.compile(r'(<span data-price="([a-z0-9-]+):(skoda|vclass|trafic)">)([^<]*)(</span>)')
SKIP = ("partials/", "email-templates/", "content-pipeline/", "marketing/", "tools/", "node_modules/")
check = "--check" in sys.argv
stale, changed, total = [], 0, 0
for p in glob.glob("**/*.html", recursive=True):
    if p.startswith(SKIP):
        continue
    s = open(p, encoding="utf-8").read()
    if "data-price=" not in s:
        continue
    def rep(m):
        global total
        total += 1
        slug, veh = m.group(2), m.group(3)
        if slug not in PRICES:
            sys.exit(f"{p}: unknown route '{slug}' (add it to tools/route_km.json)")
        return m.group(1) + "€%d" % PRICES[slug][veh] + m.group(5)
    t = PAT.sub(rep, s)
    if t != s:
        stale.append(p)
        if not check:
            open(p, "w", encoding="utf-8").write(t); changed += 1
print(f"{total} prices checked, {len(stale)} pages {'stale' if check else 'updated'}")
sys.exit(1 if (check and stale) else 0)
