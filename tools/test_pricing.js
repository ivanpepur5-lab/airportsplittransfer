#!/usr/bin/env node
// Pricing tests. Run directly (node tools/test_pricing.js) or through
// tools/check_prices.py, which fails if this exits non-zero.
//
// Covers js/pricing.js (the only place the tariff lives), the way the Netlify
// function recomputes a booking's price from distance_km / vehicle / trip type,
// and that the file behaves identically in the browser-like global context and
// when require()d.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const pricing = require(path.join(ROOT, "js/pricing.js"));
const booking = require(path.join(ROOT, "netlify/functions/lib/booking.js"));
const { calculateTotal, priceForDistance, VEHICLES } = pricing;

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; }
  catch (e) { failed++; console.error("FAIL " + name + "\n     " + String(e.message).split("\n").join("\n     ")); }
}
const r1 = (x) => Math.round(x * 10) / 10;

// --- Škoda Superb: 1.50 EUR/km for the first 100 km, 1.30 EUR/km beyond, minimum 30, nearest 5 ---
const SKODA = [  // [km, one way, return]
  [0, 30, 55], [3, 30, 55], [7, 30, 55], [20, 30, 55], [20.1, 30, 55], [22.8, 35, 65],
  [41.2, 60, 115], [41.5, 60, 115], [45, 70, 135], [50, 75, 145], [89, 135, 255],
  [100, 150, 285], [100.1, 150, 285], [101.3, 150, 285], [129.5, 190, 360],
  [150, 215, 410], [200, 280, 530], [213.4, 295, 560], [230, 320, 610], [246.2, 340, 645], [250, 345, 655],
];
test("Škoda tariff pins (one way and return)", () => {
  for (const [km, one, ret] of SKODA) {
    assert.strictEqual(calculateTotal(km, "skoda", "oneway"), one, `${km} km one way`);
    assert.strictEqual(calculateTotal(km, "skoda", "return"), ret, `${km} km return`);
  }
});
test("Škoda is progressive: 1.50 for the first 100 km, 1.30 after, also beyond 200 km", () => {
  const raw = (km) => pricing.calculateTieredPrice(km, VEHICLES.skoda.tiers, VEHICLES.skoda.pricing);
  assert.strictEqual(VEHICLES.skoda.pricing, "progressive");
  assert.ok(Math.abs(raw(100) - 150) < 1e-9);
  assert.ok(Math.abs(raw(150) - 215) < 1e-9);
  assert.ok(Math.abs(raw(200) - 280) < 1e-9);
  assert.ok(Math.abs(raw(250) - 345) < 1e-9);
  assert.strictEqual(VEHICLES.skoda.minPrice, 30);
});
test("Škoda minimum fare is 30 up to 20 km", () => {
  for (let km = 0; km <= 20; km = r1(km + 0.1)) assert.strictEqual(calculateTotal(km, "skoda", "oneway"), 30, `${km} km`);
});
test("Škoda price never falls as the distance grows (one way and return, 0 to 600 km in 0.1 km steps)", () => {
  for (const trip of ["oneway", "return"]) {
    let prev = -1;
    for (let i = 0; i <= 6000; i++) {
      const km = i / 10, p = calculateTotal(km, "skoda", trip);
      assert.ok(p >= prev, `${trip}: ${km} km costs ${p}, the step before cost ${prev}`);
      assert.strictEqual(p % 5, 0, `${trip} ${km} km is not a multiple of 5`);
      prev = p;
    }
  }
});
test("return is exactly 2 x one way x 0.95, rounded to 5, discount applied once", () => {
  for (const v of Object.keys(VEHICLES)) for (let km = 0; km <= 400; km += 0.5) {
    const one = priceForDistance(km, v);
    assert.strictEqual(calculateTotal(km, v, "return"), Math.round(one * 2 * 0.95 / 5) * 5, `${v} ${km}`);
  }
});

// --- V-Class and Trafic: unchanged until their new tariff is defined (flat per tier) ---
const VANS = [  // [km, one way]
  [3, 45], [7, 45], [20, 75], [41.2, 130], [50, 155], [50.1, 95], [89, 170], [100, 190], [100.1, 180],
  [101.3, 180], [150, 270], [200, 360], [230, 415], [250, 450],
];
test("V-Class and Trafic prices are unchanged and identical to each other", () => {
  for (const [km, one] of VANS) {
    assert.strictEqual(calculateTotal(km, "vclass", "oneway"), one, `vclass ${km}`);
    assert.strictEqual(calculateTotal(km, "trafic", "oneway"), one, `trafic ${km}`);
  }
  assert.strictEqual(VEHICLES.vclass.minPrice, 44);
  assert.strictEqual(VEHICLES.trafic.minPrice, 44);
  assert.strictEqual(VEHICLES.vclass.pricing, "flat");
  assert.strictEqual(VEHICLES.trafic.pricing, "flat");
});
{ // informational, not a failure: the vans still use the older flat-per-tier scheme
  let drops = [];
  for (let i = 1; i <= 6000; i++) {
    const a = priceForDistance((i - 1) / 10, "vclass"), b = priceForDistance(i / 10, "vclass");
    if (b < a) drops.push(`${(i - 1) / 10}->${i / 10} km: ${a}->${b}`);
  }
  console.log(`note: V-Class/Trafic still drop in price at ${drops.length} tier boundary step(s) (${drops.slice(0, 4).join("; ")}) until their new tariff is defined`);
}

// --- server recomputation ---
test("the server recomputes exactly what the booking form shows (all vehicles, both trip types, 0.1 km steps)", () => {
  for (const v of Object.keys(VEHICLES)) for (const trip of ["oneway", "return"]) {
    for (let i = 0; i <= 4000; i++) {
      // the form: Google distance rounded to 0.1 km, price from that value, the same value submitted as a string
      const googleKm = i / 10 + 0.0437 * ((i % 7) - 3) / 3;  // an unrounded-looking Google value near i/10
      const km = Math.round(googleKm * 10) / 10;
      const shown = calculateTotal(km, v, trip);
      const server = booking.transferPrice({ distance_km: km.toFixed(1), vehicle: v, trip_type: trip });
      assert.strictEqual(server, shown, `${v} ${trip} ${km} km: form ${shown}, server ${server}`);
    }
  }
});
test("the server does not trust a price sent by the browser", () => {
  for (const claimed of ["1", "0", "999", "-5", "abc", "", undefined]) {
    const d = { distance_km: "41.5", vehicle: "skoda", trip_type: "oneway", calculated_price: claimed };
    booking.applyServerPrice(d);
    assert.strictEqual(d.calculated_price, "60", `claimed ${claimed}`);
  }
  const ok = { distance_km: "41.5", vehicle: "vclass", trip_type: "return", calculated_price: "245" };
  assert.strictEqual(booking.applyServerPrice(ok), "", "an honest price produces no warning");
  const bad = { distance_km: "41.5", vehicle: "skoda", trip_type: "oneway", calculated_price: "1" };
  assert.ok(booking.applyServerPrice(bad).includes("differs"), "a different price is reported");
});
test("without a usable distance or vehicle the price stays 'to be confirmed', whatever the browser claims", () => {
  const cases = [
    { distance_km: "", vehicle: "skoda" }, { vehicle: "skoda" }, { distance_km: "abc", vehicle: "skoda" },
    { distance_km: "-3", vehicle: "skoda" }, { distance_km: "99999", vehicle: "skoda" }, { distance_km: "30", vehicle: "bus" },
    { distance_km: "30", vehicle: "__proto__" }, { distance_km: "30", vehicle: "" }, { distance_km: "NaN", vehicle: "skoda" },
  ];
  for (const c of cases) {
    const d = Object.assign({ trip_type: "oneway", calculated_price: "45" }, c);
    booking.applyServerPrice(d);
    assert.strictEqual(d.calculated_price, "", JSON.stringify(c));
    assert.strictEqual(booking.formatPrice(d.calculated_price, "en").priceDisplay, "Price to be confirmed");
  }
});
test("an unknown trip type is treated as one way (never as a return discount)", () => {
  assert.strictEqual(booking.transferPrice({ distance_km: "41.5", vehicle: "skoda", trip_type: "return; drop" }), 60);
});

// --- the same file works as a browser script and as a module ---
test("pricing.js gives identical results as a plain browser script and as a module", () => {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/pricing.js"), "utf8"), ctx);
  for (const v of ["skoda", "vclass", "trafic"]) for (const t of ["oneway", "return"]) for (let km = 0; km <= 300; km += 0.7) {
    const viaVm = vm.runInContext(`calculateTotal(${km}, '${v}', '${t}')`, ctx);
    assert.strictEqual(viaVm, calculateTotal(km, v, t), `${v} ${t} ${km}`);
  }
});

console.log(`pricing tests: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
