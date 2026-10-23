#!/usr/bin/env python3
"""Price consistency test. The booking form (js/pricing.js, fed with the Google
driving distance) is the only authority for prices; everything else on the site
has to agree with it. Run before every deploy:

  python3 tools/check_prices.py

It checks, with prices calculated by pricing.js itself (run with node) from the
distances in tools/route_km.json:

  1. every <span data-price="route:vehicle"> shows the calculated price
     (same check as tools/stamp_prices.py --check);
  2. the "NN km" figure on route, marina and hotel pages and in the price table
     is the km the form bills (tools/google_km.json), rounded;
  3. the price sentences of the route guides in /blog/ (car and van price) and
     the rows of the price table in blog/split-airport-taxi-prices.html;
  4. day trips: page, listing card and booking.js agree;
  5. the price-check results (tools/google_km.json, optional) agree with
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
warnings = []  # distances shown as text: informational, the price is what must agree

def read(p):
    return open(p, encoding="utf-8").read()

def has_amount(text, n):
    """True if the page contains the amount n as €n or n € (any spacing)."""
    t = text.replace("&nbsp;", " ").replace("&ndash;", "–").replace("&euro;", "€")
    # "€n", "n €", or the upper end of a range such as "€70–75"
    return re.search(r"€\s?%d(?!\d)|(?<![\d.,])%d\s?€|€\s?\d+\s?[–-]\s?%d(?!\d)|\d+\s?[–-]\s?%d\s?€" % (n, n, n, n), t) is not None

# 1. stamped spans
r = subprocess.run([sys.executable, "tools/stamp_prices.py", "--check"], capture_output=True, text=True)
if r.returncode != 0:
    problems.append("stamped prices are stale: run tools/stamp_prices.py (" + r.stdout.strip() + ")")
n_spans = r.stdout.strip()

# 2. distance on route, marina and hotel pages: the "NN km" figure is the km the form bills, rounded
GOOGLE = json.load(open("tools/google_km.json")) if os.path.exists("tools/google_km.json") else {}
BILLED = dict(GOOGLE); BILLED.update(KM)
def rnd(x):
    return int(x + 0.5)
n_km = 0
for p in sorted(glob.glob("**/destinations/*.html", recursive=True) + glob.glob("**/hotel-transfers/*.html", recursive=True)):
    t = read(p)
    m = re.search(r'index\.html\?(?:[a-z]+=[a-z0-9]+&)*to=([a-z0-9]+)', t) or re.search(r'index\.html\?(?:from|pickup)=([a-z0-9]+)', t)
    stat = None
    for pat in (r'<b class="count-up">(\d+)(?:&nbsp;|\s)?km</b>', r'<div class="trust-item reveal"><b>(\d+)(?:&nbsp;|\s)?km</b>', r'About <b>(\d+)(?:&nbsp;|\s)?km</b>'):
        stat = re.search(pat, t)
        if stat:
            break
    if not m or not stat or m.group(1) not in BILLED:
        continue
    n_km += 1
    if int(stat.group(1)) != rnd(BILLED[m.group(1)]):
        problems.append(f"{p}: shows {stat.group(1)} km, the form bills {BILLED[m.group(1)]} km ({m.group(1)})")

# 2b. driving time on route, marina and hotel pages: the Google minutes (tools/route_min.json), rounded to 5
MIN = json.load(open("tools/route_min.json")) if os.path.exists("tools/route_min.json") else {}
TIME_SKIP = {"marinakastela", "kastela", "primosten", "trogir"}   # range or no figure on the page
n_time = 0
for p in sorted(glob.glob("**/destinations/*.html", recursive=True) + glob.glob("**/hotel-transfers/*.html", recursive=True)):
    t = read(p)
    m = re.search(r'index\.html\?(?:[a-z]+=[a-z0-9]+&)*to=([a-z0-9]+)', t) or re.search(r'index\.html\?(?:from|pickup)=([a-z0-9]+)', t)
    vals = re.findall(r'<b[^>]*>(\d+ h(?: \d+ min)?|\d+ min)</b>', t)
    if not m or not vals or m.group(1) not in MIN or m.group(1) in TIME_SKIP:
        continue
    n_time += 1
    def to_min(s):
        h = re.search(r'(\d+) h', s); mi = re.search(r'(\d+) min', s)
        return (int(h.group(1)) * 60 if h else 0) + (int(mi.group(1)) if mi else 0)
    want = int(round(MIN[m.group(1)] / 5.0) * 5)
    if to_min(vals[0]) != want:
        problems.append(f"{p}: shows {vals[0]}, Google drives {MIN[m.group(1)]} min (about {want}) for {m.group(1)}")

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

# 3a''. Blog posts from Dubrovnik and Zadar Airport: the prices in the text are what the form calculates for Google's km
AIR = json.load(open("tools/google_airports.json")) if os.path.exists("tools/google_airports.json") else {}
for p, code, routes in [(f"{lang}blog/dubrovnik-airport-to-split-transfer.html", "dbv", ("split", "makarska")) for lang in LANGS] + \
                       [(f"{lang}blog/zadar-airport-to-split-transfer.html", "zad", ("split", "sibenik", "plitvice")) for lang in LANGS]:
    if not (AIR and os.path.exists(p)):
        continue
    t = read(p)
    n_guides += 1
    for route in routes:
        km_ = AIR[code][route][0]
        node_air = NODE.replace("fs.readFileSync('tools/route_km.json', 'utf8')", "JSON.stringify({x: %s})" % km_)
        pr = json.loads(subprocess.check_output(["node", "-e", node_air], text=True))["x"]
        for veh in ("skoda", "vclass"):
            if not has_amount(t, pr[veh]):
                problems.append(f"{p}: {veh} price {pr[veh]} for the airport to {route} ({km_} km) not found")

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
        if km and int(km.group(1)) != rnd(KM[route]):
            problems.append(f"{p}: {route} row shows {km.group(1)} km, the form bills {KM[route]} km")
        car = [int(x) for x in re.findall(r"\d+", cells[3])]
        van = [int(x) for x in re.findall(r"\d+", cells[4])]
        if PRICES[route]["skoda"] not in car:
            problems.append(f"{p}: {route} car {car} != {PRICES[route]['skoda']}")
        if max(van) != PRICES[route]["vclass"]:
            problems.append(f"{p}: {route} van {van} != {PRICES[route]['vclass']}")

# 3c. the tariff itself must not have been touched by accident (pins today's rules)
TARIFF = [  # (km, vehicle, trip, expected total)
    (7, "skoda", "oneway", 35), (20, "skoda", "oneway", 55), (41.2, "skoda", "oneway", 90),
    (45, "skoda", "oneway", 100), (89, "skoda", "oneway", 140), (230, "skoda", "oneway", 345),
    (41.2, "vclass", "oneway", 130), (41.2, "trafic", "oneway", 130), (230, "vclass", "oneway", 415),
    (101.3, "skoda", "oneway", 150), (101.3, "vclass", "oneway", 180),
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

# 5. day trips: fixed prices must agree between the trip page, the listing card and the server
# (netlify/functions/lib/booking.js recomputes the price from the trip key).
SERVER = {}
js = read("netlify/functions/lib/booking.js")
tbl = re.search(r"const DAYTRIP_PRICES = \{(.*?)\n\};", js, re.S).group(1)
for k, car, van in re.findall(r"(\w+): \{ car: (\d+), van: (\d+) \}", tbl):
    SERVER[k] = (int(car), int(van))
n_trips = 0
for lang in LANGS:
    for p in sorted(glob.glob(lang + "day-trips/*.html")):
        t = read(p)
        m = re.search(r'name="trip" value="(\w+)"', t)
        if not m:
            continue
        key = m.group(1)
        n_trips += 1
        if key not in SERVER:
            problems.append(f"{p}: trip '{key}' is not in DAYTRIP_PRICES of booking.js")
            continue
        car, van = SERVER[key]
        slug = os.path.basename(p)
        checks = [
            (re.search(r'id="d-price-hidden" value="(\d+)"', t), car, "hidden price"),
            (re.search(r'const D_PRICES = \{ car: (\d+), van: (\d+) \}', t), (car, van), "D_PRICES"),
        ]
        pr = re.findall(r'<span class="vopt-price">&euro;(\d+)</span>', t)
        btn = re.search(r'(?:&middot;|·) (?:&euro;|€)?(\d+)(?: ?€|&euro;)?</button>', t)
        for mm, want, what in checks:
            have = None if not mm else (tuple(int(x) for x in mm.groups()) if len(mm.groups()) > 1 else int(mm.group(1)))
            if have != want:
                problems.append(f"{p}: {what} is {have}, booking.js says {want}")
        if [int(x) for x in pr] != [car, van]:
            problems.append(f"{p}: vehicle prices {pr}, booking.js says {car}/{van}")
        if not btn or int(btn.group(1)) != car:
            problems.append(f"{p}: button price differs from {car}")
        # listing card
        lst = read(lang + "day-trips.html")
        card = re.search(r'<a href="day-trips/' + re.escape(slug) + r'".*?', lst)
        cm = re.search(r'trip-price-value">&euro;(\d+)</span></span>(?:(?!trip-card reveal).)*?href="day-trips/' + re.escape(slug) + '"', lst, re.S)
        if not cm or int(cm.group(1)) != car:
            problems.append(f"{lang}day-trips.html: card price for {slug} is {cm.group(1) if cm else None}, should be {car}")

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

print(f"{n_spans}; {n_km} route pages checked for distance, {n_time} for driving time; {n_guides} guides and {n_rows} price-table rows checked; {n_trips} day-trip pages checked against booking.js")
if warnings:
    print(f"\n{len(warnings)} distance text(s) differ from the km the form bills (informational, not a failure):")
    for x in sorted(warnings)[:12]:
        print("  ~", x)
    if len(warnings) > 12:
        print(f"  ~ ... and {len(warnings) - 12} more")
if problems:
    print(f"\n{len(problems)} PROBLEM(S):")
    for x in problems:
        print(" -", x)
    sys.exit(1)
print("OK: all prices agree with js/pricing.js")
