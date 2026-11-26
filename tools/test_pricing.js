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
// Škoda Superb:               1.50 EUR/km to 100 km, 1.30 beyond (also beyond 200 km), minimum 30
// V-Class and Trafic (same):  1.90 EUR/km to 100 km, 1.70 beyond (also beyond 200 km), minimum 45
const PINS = {  // [km, one way, return]
  skoda: [
    [0, 30, 55], [3, 30, 55], [7, 30, 55], [20, 30, 55], [20.1, 30, 55], [22.8, 35, 65],
    [41.2, 60, 115], [41.5, 60, 115], [45, 70, 135], [50, 75, 145], [89, 135, 255],
    [100, 150, 285], [100.1, 150, 285], [101.3, 150, 285], [129.5, 190, 360],
    [150, 215, 410], [200, 280, 530], [213.4, 295, 560], [230, 320, 610], [246.2, 340, 645], [250, 345, 655], [300, 410, 780],
  ],
  vclass: [
    [0, 45, 85], [3, 45, 85], [5.4, 45, 85], [20, 45, 85], [22.8, 45, 85], [23.7, 45, 85], [26.8, 50, 95], [41.2, 80, 150], [41.5, 80, 150],
    [50, 95, 180], [54.6, 105, 200], [87.5, 165, 315], [89, 170, 325], [100, 190, 360], [100.1, 190, 360], [101.3, 190, 360],
    [129.5, 240, 455], [150, 275, 525], [200, 360, 685], [213.4, 385, 730], [230, 410, 780], [246.2, 440, 835], [250, 445, 845], [300, 530, 1005],
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
  assert.deepStrictEqual(rates("skoda"), [[100, 1.5], [Infinity, 1.3]]);
  assert.deepStrictEqual(rates("vclass"), [[100, 1.9], [Infinity, 1.7]]);
  assert.deepStrictEqual(rates("trafic"), [[100, 1.9], [Infinity, 1.7]]);
  assert.strictEqual(VEHICLES.skoda.minPrice, 30);
  assert.strictEqual(VEHICLES.vclass.minPrice, 45);
  assert.strictEqual(VEHICLES.trafic.minPrice, 45);
  assert.deepStrictEqual(VEHICLES.vclass.tiers, VEHICLES.trafic.tiers, "V-Class and Trafic have identical tariffs");
  assert.deepStrictEqual([VEHICLES.skoda.maxPax, VEHICLES.vclass.maxPax, VEHICLES.trafic.maxPax], [4, 7, 8]);
});
test("progressive: each km at the rate of its tier, also beyond 200 km", () => {
  const raw = (km, v) => pricing.calculateTieredPrice(km, VEHICLES[v].tiers);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  assert.ok(near(raw(100, "skoda"), 150) && near(raw(150, "skoda"), 215) && near(raw(200, "skoda"), 280) && near(raw(250, "skoda"), 345));
  assert.ok(near(raw(100, "vclass"), 190) && near(raw(150, "vclass"), 275) && near(raw(200, "vclass"), 360) && near(raw(250, "vclass"), 445) && near(raw(300, "vclass"), 530));
});
test("minimum fare: 30 for the Škoda, 45 for the vans, applied up to the point where the tariff reaches it", () => {
  for (let km = 0; km <= 20; km = r1(km + 0.1)) assert.strictEqual(calculateTotal(km, "skoda", "oneway"), 30, `skoda ${km} km`);
  for (const v of ["vclass", "trafic"]) for (let km = 0; km <= 23.7; km = r1(km + 0.1)) assert.strictEqual(calculateTotal(km, v, "oneway"), 45, `${v} ${km} km`);
  assert.strictEqual(calculateTotal(0.5, "skoda", "oneway"), 30);
  assert.strictEqual(calculateTotal(0.5, "vclass", "oneway"), 45);
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
    if (km >= 50) assert.ok(v / s <= 1.35, `${km} km: van/Škoda ${(v / s).toFixed(2)}`);
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
    assert.strictEqual(d.calculated_price, "60", `claimed ${claimed}`);
  }
  const ok = { distance_km: "41.5", vehicle: "vclass", trip_type: "return", calculated_price: "150" };
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
