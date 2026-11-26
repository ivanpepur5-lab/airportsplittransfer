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

// --- the tariff: progressive, nearest 5, return = 2 x one way x 0.95 ---
// Škoda Superb:               1.70 EUR/km for km 0-50, 1.50 for km 50-100, 1.40 beyond 100, minimum 45
// V-Class and Trafic (same):  2.10 EUR/km for km 0-50, 1.90 for km 50-100, 1.70 beyond 100, minimum 60
// (expected values below were calculated independently of pricing.js)
const PINS = {  // [km, one way, return]
  skoda: [
    [0, 45, 85],
    [3, 45, 85],
    [5.4, 45, 85],
    [10, 45, 85],
    [20, 45, 85],
    [22.8, 45, 85],
    [26.8, 45, 85],
    [28.5, 50, 95],
    [41.5, 70, 135],
    [50, 85, 160],
    [50.1, 85, 160],
    [54.6, 90, 170],
    [75, 125, 240],
    [87.5, 140, 265],
    [89, 145, 275],
    [100, 160, 305],
    [100.1, 160, 305],
    [101.3, 160, 305],
    [129.5, 200, 380],
    [150, 230, 435],
    [200, 300, 570],
    [213.4, 320, 610],
    [246.2, 365, 695],
    [250, 370, 705],
    [300, 440, 835],
    [600, 860, 1635],
  ],
  vclass: [
    [0, 60, 115],
    [3, 60, 115],
    [5.4, 60, 115],
    [10, 60, 115],
    [20, 60, 115],
    [22.8, 60, 115],
    [26.8, 60, 115],
    [28.5, 60, 115],
    [41.5, 85, 160],
    [50, 105, 200],
    [50.1, 105, 200],
    [54.6, 115, 220],
    [75, 155, 295],
    [87.5, 175, 335],
    [89, 180, 340],
    [100, 200, 380],
    [100.1, 200, 380],
    [101.3, 200, 380],
    [129.5, 250, 475],
    [150, 285, 540],
    [200, 370, 705],
    [213.4, 395, 750],
    [246.2, 450, 855],
    [250, 455, 865],
    [300, 540, 1025],
    [600, 1050, 1995],
  ],
};
PINS.trafic = PINS.vclass;  // identical tariff
for (const [veh, rows] of Object.entries(PINS)) {
  test(`${veh}: tariff pins (one way and return)`, () => {
    for (const [km, one, ret] of rows) {
      assert.strictEqual(calculateTotal(km, veh, "oneway"), one, `${km} km one way`);
      assert.strictEqual(calculateTotal(km, veh, "return"), ret, `${km} km return`);
    }
  });
}
test("tariff definition: rates, tiers and minimum fares", () => {
  const rates = (v) => VEHICLES[v].tiers.map((t) => [t.upToKm, t.ratePerKm]);
  assert.deepStrictEqual(rates("skoda"), [[50, 1.7], [100, 1.5], [Infinity, 1.4]]);
  assert.deepStrictEqual(rates("vclass"), [[50, 2.1], [100, 1.9], [Infinity, 1.7]]);
  assert.deepStrictEqual(rates("trafic"), [[50, 2.1], [100, 1.9], [Infinity, 1.7]]);
  assert.strictEqual(VEHICLES.skoda.minPrice, 45);
  assert.strictEqual(VEHICLES.vclass.minPrice, 60);
  assert.strictEqual(VEHICLES.trafic.minPrice, 60);
  assert.deepStrictEqual(VEHICLES.vclass.tiers, VEHICLES.trafic.tiers, "V-Class and Trafic have identical tariffs");
  assert.deepStrictEqual([VEHICLES.skoda.maxPax, VEHICLES.vclass.maxPax, VEHICLES.trafic.maxPax], [4, 7, 8]);
});
test("progressive: each km at the rate of its tier, also beyond 200 km", () => {
  const raw = (km, v) => pricing.calculateTieredPrice(km, VEHICLES[v].tiers);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  // Škoda: 50 x 1.70 = 85, + 50 x 1.50 = 160, then 1.40 per km for every km beyond 100
  assert.ok(near(raw(50, "skoda"), 85) && near(raw(100, "skoda"), 160) && near(raw(150, "skoda"), 230) && near(raw(200, "skoda"), 300));
  assert.ok(near(raw(300, "skoda"), 440) && near(raw(600, "skoda"), 860), "the third rate continues beyond 200 km");
  // vans: 50 x 2.10 = 105, + 50 x 1.90 = 200, then 1.70 per km
  assert.ok(near(raw(50, "vclass"), 105) && near(raw(100, "vclass"), 200) && near(raw(150, "vclass"), 285) && near(raw(200, "vclass"), 370));
  assert.ok(near(raw(300, "vclass"), 540) && near(raw(600, "vclass"), 1050), "the third rate continues beyond 200 km");
  // a km is charged at its own tier: 50.1 km costs 0.1 km at the second rate more than 50 km, not everything at the second rate
  assert.ok(near(raw(50.1, "skoda") - raw(50, "skoda"), 0.15) && near(raw(100.1, "skoda") - raw(100, "skoda"), 0.14));
});
test("minimum fare: 45 for the Škoda, 60 for the vans, applied up to the point where the tariff reaches it", () => {
  for (let km = 0; km <= 26.4; km = r1(km + 0.1)) assert.strictEqual(calculateTotal(km, "skoda", "oneway"), 45, `skoda ${km} km`);   // 26.5 km x 1.70 = 45.05
  for (const v of ["vclass", "trafic"]) for (let km = 0; km <= 28.5; km = r1(km + 0.1)) assert.strictEqual(calculateTotal(km, v, "oneway"), 60, `${v} ${km} km`);  // 28.6 km x 2.10 = 60.06
  assert.strictEqual(calculateTotal(0.5, "skoda", "oneway"), 45);
  assert.strictEqual(calculateTotal(0.5, "vclass", "oneway"), 60);
  assert.strictEqual(calculateTotal(0.5, "trafic", "return"), 115, "return of the minimum: 2 x 60 x 0.95 = 114 -> 115");
  assert.strictEqual(calculateTotal(0.5, "skoda", "return"), 85, "return of the minimum: 2 x 45 x 0.95 = 85.5 -> 85");
});
test("boundaries 20, 50, 100 and 200 km: no jump on either side, for all three vehicles", () => {
  for (const v of Object.keys(VEHICLES)) for (const edge of [20, 50, 100, 200]) {
    const before = calculateTotal(r1(edge - 0.1), v, "oneway"), at = calculateTotal(edge, v, "oneway"), after = calculateTotal(r1(edge + 0.1), v, "oneway");
    assert.ok(before <= at && at <= after, `${v} at ${edge} km: ${before} / ${at} / ${after}`);
    assert.ok(after - before <= 10, `${v} at ${edge} km jumps by ${after - before}`);
  }
});
test("the price never falls as the distance grows (all vehicles, one way and return, 0 to 600 km in 0.1 km steps)", () => {
  for (const v of Object.keys(VEHICLES)) for (const trip of ["oneway", "return"]) {
    let prev = -1;
    for (let i = 0; i <= 6000; i++) {
      const km = i / 10, p = calculateTotal(km, v, trip);
      assert.ok(p >= prev, `${v} ${trip}: ${km} km costs ${p}, the step before cost ${prev}`);
      assert.strictEqual(p % 5, 0, `${v} ${trip} ${km} km is not a multiple of 5`);
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
test("a van is never cheaper than the Škoda, and the ratio stays in a sensible band beyond the minimum fares", () => {
  for (let i = 0; i <= 6000; i++) {
    const km = i / 10, s = calculateTotal(km, "skoda", "oneway"), v = calculateTotal(km, "vclass", "oneway");
    assert.ok(v >= s, `${km} km: van ${v} < Škoda ${s}`);
    if (km >= 50) assert.ok(v / s <= 1.35, `${km} km: van/Škoda ${(v / s).toFixed(2)}`);   // today 1.22-1.26
  }
});

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
    assert.strictEqual(d.calculated_price, "70", `claimed ${claimed}`);
  }
  const ok = { distance_km: "41.5", vehicle: "vclass", trip_type: "return", calculated_price: "160" };
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
  assert.strictEqual(booking.transferPrice({ distance_km: "41.5", vehicle: "skoda", trip_type: "return; drop" }), 70);
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
