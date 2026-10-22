#!/usr/bin/env python3
"""Price consistency test. The booking form (js/pricing.js, fed with the Google
driving distance) is the only authority for prices; everything else on the site
has to agree with it. Run before every deploy:

  python3 tools/check_prices.py

It checks, with prices calculated by pricing.js itself (run with node) from the
distances in tools/route_km.json:

  1. every <span data-price="route:vehicle"> shows the calculated price
     (same check as tools/stamp_prices.py --check);
  2. the "NN km" figure on every route page (all 6 languages) is the distance
     the price was calculated from;
  3. the price sentences of the route guides in /blog/ (car and van price) and
     the rows of the price table in blog/split-airport-taxi-prices.html;
  4. the price-check results (tools/google_km.json, optional) agree with
     route_km.json: see tools/apply_google_km.py.

Exit code 1 if anything differs. Nothing is rewritten."""
import glob, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
KM = json.load(open("tools/route_km.json"))
LANGS = ["", "de/", "sv/", "no/", "hr/", "it/"]

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
problems = []

def read(p):
    return open(p, encoding="utf-8").read()

def has_amount(text, n):
    """True if the page contains the amount n as €n or n € (any spacing)."""
    t = text.replace("&nbsp;", " ").replace("&ndash;", "–")
    # "€n", "n €", or the upper end of a range such as "€70–75"
    return re.search(r"€\s?%d(?!\d)|(?<![\d.,])%d\s?€|€\s?\d+\s?[–-]\s?%d(?!\d)|\d+\s?[–-]\s?%d\s?€" % (n, n, n, n), t) is not None

# 1. stamped spans
r = subprocess.run([sys.executable, "tools/stamp_prices.py", "--check"], capture_output=True, text=True)
if r.returncode != 0:
    problems.append("stamped prices are stale: run tools/stamp_prices.py (" + r.stdout.strip() + ")")
n_spans = r.stdout.strip()

# 2. distance on route pages
n_km = 0
for p in sorted(glob.glob("**/destinations/*.html", recursive=True)):
    t = read(p)
    keys = re.findall(r'data-price="([a-z0-9-]+):', t)
    m = re.search(r'<b class="count-up">(\d+)(?:&nbsp;|\s)?km</b>', t)
    if not keys or not m:
        continue
    key = max(set(keys), key=keys.count)
    n_km += 1
    if KM.get(key) != int(m.group(1)):
        problems.append(f"{p}: shows {m.group(1)} km, price is calculated from {KM.get(key)} km ({key})")

# 3a. route guides: "around €car ... €van" in the guide and its FAQ
GUIDES = {
    "split-airport-to-trogir-transfer-guide": "trogir",
    "split-airport-to-split-taxi-bus-transfer": "split",
    "split-airport-to-podstrana-taxi-price": "podstrana",
    "split-airport-to-omis-transfer-guide": "omis",
    "split-airport-to-baska-voda-transfer": "baskavoda",
    "split-airport-to-makarska-transport-options": "makarska",
    "split-airport-to-dubrovnik-worth-it": "dubrovnik",
}
n_guides = 0
for lang in LANGS:
    for slug, route in GUIDES.items():
        p = f"{lang}blog/{slug}.html"
        if not os.path.exists(p):
            continue
        n_guides += 1
        t = read(p)
        car, van = PRICES[route]["skoda"], PRICES[route]["vclass"]
        if not has_amount(t, car):
            problems.append(f"{p}: car price {car} ({route}) not found")
        if not has_amount(t, van):
            problems.append(f"{p}: van price {van} ({route}) not found")

# 3a'. Plitvice page: the one-way price in the FAQ text must match the stamped card
for lang in LANGS:
    p = f"{lang}destinations/plitvice.html"
    if os.path.exists(p):
        t = read(p)
        n_guides += 1
        if not has_amount(t, PRICES["plitvice"]["skoda"]):
            problems.append(f"{p}: one-way price {PRICES['plitvice']['skoda']} (plitvice) not found")

# 3b. price table of the taxi price article
ROWS = ["trogir", "split", "podstrana", "omis", "baskavoda", "makarska", "dubrovnik"]
n_rows = 0
for lang in LANGS:
    p = f"{lang}blog/split-airport-taxi-prices.html"
    if not os.path.exists(p):
        continue
    t = read(p)
    i = t.find('<table class="price-table">')
    j = t.find("</table>", i)
    rows = re.findall(r"<tr>(.*?)</tr>", t[i:j], re.S)[1:]
    if len(rows) != len(ROWS):
        problems.append(f"{p}: price table has {len(rows)} rows, expected {len(ROWS)}")
        continue
    for route, row in zip(ROWS, rows):
        cells = [re.sub(r"<[^>]+>", "", c).replace("&nbsp;", " ") for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]
        n_rows += 1
        km = re.search(r"(\d+)\s?km", cells[1])
        if km and int(km.group(1)) != KM[route]:
            problems.append(f"{p}: {route} row shows {km.group(1)} km, price is calculated from {KM[route]} km")
        car = [int(x) for x in re.findall(r"\d+", cells[3])]
        van = [int(x) for x in re.findall(r"\d+", cells[4])]
        if PRICES[route]["skoda"] not in car:
            problems.append(f"{p}: {route} car {car} != {PRICES[route]['skoda']}")
        if max(van) != PRICES[route]["vclass"]:
            problems.append(f"{p}: {route} van {van} != {PRICES[route]['vclass']}")

# 3c. the tariff itself must not have been touched by accident (pins today's rules)
TARIFF = [  # (km, vehicle, trip, expected total)
    (7, "skoda", "oneway", 35), (20, "skoda", "oneway", 55), (41.2, "skoda", "oneway", 90),
    (45, "skoda", "oneway", 100), (89, "skoda", "oneway", 170), (230, "skoda", "oneway", 415),
    (41.2, "vclass", "oneway", 130), (41.2, "trafic", "oneway", 130), (230, "vclass", "oneway", 500),
    (41.2, "skoda", "return", 170), (3, "skoda", "oneway", 35), (3, "vclass", "oneway", 45),
]
calls = ";".join(f"out.push(calculateTotal({k}, '{v}', '{t}'))" for k, v, t, _ in TARIFF)
js = ("const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
      "vm.runInContext(fs.readFileSync('js/pricing.js','utf8'),c);"
      f"const out=[];vm.runInContext(`const out=[];{calls};globalThis.__o=out`,c);console.log(JSON.stringify(c.__o))")
got = json.loads(subprocess.check_output(["node", "-e", js], text=True))
for (k, v, t, want), have in zip(TARIFF, got):
    if have != want:
        problems.append(f"tariff changed: {k} km, {v}, {t}: form calculates {have}, expected {want}")

# 4. Google distances from the live price-check page, if they have been saved
G = "tools/google_km.json"
if os.path.exists(G):
    google = {k: v for k, v in json.load(open(G)).items() if k in KM}
    node_g = NODE.replace("fs.readFileSync('tools/route_km.json', 'utf8')", "fs.readFileSync('tools/google_km.json', 'utf8')")
    form = json.loads(subprocess.check_output(["node", "-e", node_g], text=True))
    for k in sorted(google):
        for v in ("skoda", "vclass", "trafic"):
            if form[k][v] != PRICES[k][v]:
                problems.append(f"{k} ({v}): the form calculates {form[k][v]} for Google's {google[k]} km, the pages show {PRICES[k][v]}")
else:
    print("note: tools/google_km.json not present; route_km.json is not yet verified against Google distances")

print(f"{n_spans}; {n_km} route pages checked for distance; {n_guides} guides and {n_rows} price-table rows checked")
if problems:
    print(f"\n{len(problems)} PROBLEM(S):")
    for x in problems:
        print(" -", x)
    sys.exit(1)
print("OK: all prices agree with js/pricing.js")
