/* ==========================================================================
   AirportSplitTransfer.com — Pricing Engine

   The ONLY place the tariff lives. The browser loads it as a plain script;
   the Netlify function (netlify/functions/lib/booking.js) require()s the same
   file to recompute the price of every booking, and the tools (check_prices.py,
   stamp_prices.py, tools/test_pricing.js) run it with node. Do not copy the
   rates anywhere else.

   One scheme for every vehicle: PROGRESSIVE. Each kilometre is charged at the
   rate of the tier it falls in (the first 100 km at one rate, every km beyond
   at the next), then the vehicle's minimum fare applies, then the total is
   rounded to the nearest 5 EUR. The price therefore grows steadily with the
   distance: there are no jumps at the tier boundaries.

   Škoda Superb:                 1.70 EUR/km for km 0-50, 1.50 for km 50-100,
                                 1.40 for every km beyond 100, minimum 45
   V-Class and Trafic (same):    2.10 EUR/km for km 0-50, 1.90 for km 50-100,
                                 1.70 for every km beyond 100, minimum 60
   The third rate continues for any distance (150, 200, 300, 600 km ...).
   Return = 2 x one way x 0.95, rounded to the nearest 5 EUR.

   Works for ANY address Google Maps can resolve a driving distance for, not
   just a hardcoded destination list.
   ========================================================================== */

const VEHICLES = {
  skoda: {
    name: "Škoda Superb",
    category: "Sedan",
    model: "Škoda Superb or similar",
    tagline: "Executive Sedan",
    color: "White",
    minPax: 1,
    maxPax: 4,
    suitcases: 3,
    minPrice: 45,
    // 1.70 EUR/km for km 0-50, 1.50 for km 50-100, 1.40 for every km beyond 100.
    tiers: [
      { upToKm: 50, ratePerKm: 1.7 },
      { upToKm: 100, ratePerKm: 1.5 },
      { upToKm: Infinity, ratePerKm: 1.4 }
    ]
  },
  vclass: {
    name: "Mercedes-Benz V-Class",
    category: "Business Van",
    model: "Mercedes-Benz V-Class",
    tagline: "Premium Van",
    color: "Black",
    minPax: 1,
    maxPax: 7,
    suitcases: 7,
    minPrice: 60,
    // 2.10 EUR/km for km 0-50, 1.90 for km 50-100, 1.70 for every km beyond 100.
    tiers: [
      { upToKm: 50, ratePerKm: 2.1 },
      { upToKm: 100, ratePerKm: 1.9 },
      { upToKm: Infinity, ratePerKm: 1.7 }
    ]
  },
  trafic: {
    name: "Renault Trafic",
    category: "Van",
    model: "Renault Trafic or similar",
    tagline: "Group Transfer",
    color: "White",
    minPax: 1,
    maxPax: 8,
    suitcases: 8,
    minPrice: 60,
    // Same tariff as the V-Class, as specified.
    tiers: [
      { upToKm: 50, ratePerKm: 2.1 },
      { upToKm: 100, ratePerKm: 1.9 },
      { upToKm: Infinity, ratePerKm: 1.7 }
    ]
  }
};

const RETURN_DISCOUNT = 0.05; // discount applied to the combined return-trip total

/**
 * Human-readable, geocodable place names for the `?to=` query-param links
 * used by destination pages and the fleet page (e.g. index.html?to=omis#booking).
 * These get typed into the dropoff field and resolved to a real driving
 * distance via the Routes library (DistanceMatrixService as fallback), same as anything a visitor types by hand.
 */
const DESTINATION_NAMES = {
  split: "Split, Croatia",
  splitport: "Split Ferry Port, Split, Croatia",
  podstrana: "Podstrana, Croatia",
  omis: "Omiš, Croatia",
  baskavoda: "Baška Voda, Croatia",
  brela: "Brela, Croatia",
  makarska: "Makarska, Croatia",
  sibenik: "Šibenik, Croatia",
  vodice: "Vodice, Croatia",
  zadar: "Zadar, Croatia",
  plitvice: "Plitvice Lakes National Park, Croatia",
  dubrovnik: "Dubrovnik, Croatia",
  trogir: "Trogir, Croatia",
  primosten: "Primošten, Croatia",
  kastela: "Kaštela, Croatia",
  acisplit: "ACI Marina Split, Split, Croatia",
  acitrogir: "ACI Marina Trogir, Čiovo, Croatia",
  baotic: "Marina Baotić, Seget Donji, Croatia",
  marinakastela: "Marina Kaštela, Kaštel Gomilica, Croatia",
  agana: "Marina Agana, Marina, Croatia",
  mandalina: "D-Marin Mandalina, Šibenik, Croatia",
  marinadalmacija: "D-Marin Dalmacija, Sukošan, Croatia",
  biograd: "Biograd na Moru, Croatia",
  grebastica: "Grebaštica, Croatia",
  marusici: "Marušići, Croatia",
  murter: "Murter, Croatia",
  pisak: "Pisak, Croatia",
  podgora: "Podgora, Croatia",
  promajna: "Promajna, Croatia",
  razanj: "Ražanj, Croatia",
  rogoznica: "Rogoznica, Croatia",
  frapa: "Marina Frapa, Rogoznica, Croatia",
  kornati: "Marina Kornati, Biograd na Moru, Croatia",
  segetdonji: "Seget Donji, Croatia",
  tucepi: "Tučepi, Croatia",
  viniste: "Vinišće, Croatia",
  zivogosce: "Živogošće, Croatia",
  solaris: "Amadria Park Šibenik, Solaris, Šibenik, Croatia",
  amphora: "Amphora Hotel, Split, Croatia",
  ambasador: "Hotel Ambasador, Split, Croatia",
  lemeridien: "Le Méridien Lav Split, Podstrana, Croatia",
  medora: "Medora Auri Family Beach Resort, Podgora, Croatia",
  radisson: "Radisson Blu Resort Split, Split, Croatia",
  // other airports: pickup points for the pages under /airports/ (?pickup=...)
  dbvairport: "Dubrovnik Airport (DBV), Croatia",
  zadairport: "Zadar Airport (ZAD), Croatia"
};

/**
 * Raw (unrounded, no minimum) price for a distance: each km at the rate of its tier.
 *
 * Škoda, 150 km: 50 x 1.70 + 50 x 1.50 + 50 x 1.40 = 230.
 * V-Class, 150 km: 50 x 2.10 + 50 x 1.90 + 50 x 1.70 = 285.
 *
 * The last tier's upToKm is Infinity, so any distance is always covered.
 */
function calculateTieredPrice(distanceKm, tiers) {
  if (!distanceKm || distanceKm <= 0) return 0;
  let total = 0;
  let from = 0;
  for (const tier of tiers) {
    if (distanceKm <= from) break;
    total += (Math.min(distanceKm, tier.upToKm) - from) * tier.ratePerKm;
    from = tier.upToKm;
  }
  return total;
}

function roundToNearest5(amount) {
  return Math.round(amount / 5) * 5;
}

/**
 * Full price for one vehicle given a driving distance in km.
 * Applies the tariff, the vehicle's minimum fare, and rounds to the
 * nearest €5. The distance is expected to have one decimal (the booking form
 * rounds the Google distance to 0.1 km, and submits exactly that value, so
 * the server recomputes the identical price).
 */
function priceForDistance(distanceKm, vehicleKey) {
  const vehicle = VEHICLES[vehicleKey];
  if (!vehicle || distanceKm == null) return null;
  const raw = calculateTieredPrice(distanceKm, vehicle.tiers);
  const withMinimum = Math.max(raw, vehicle.minPrice);
  return roundToNearest5(withMinimum);
}

/**
 * Full trip total including trip type. Return trips are billed as two
 * one-way transfers with a 5% discount on the combined total.
 */
function calculateTotal(distanceKm, vehicleKey, tripType) {
  const base = priceForDistance(distanceKm, vehicleKey);
  if (base === null) return null;
  if (tripType === "return") return roundToNearest5(base * 2 * (1 - RETURN_DISCOUNT));
  return base;
}

/**
 * Returns list of vehicle keys that can legally carry the given passenger count.
 */
function vehiclesForPassengers(paxCount) {
  return Object.keys(VEHICLES).filter(key => paxCount >= VEHICLES[key].minPax && paxCount <= VEHICLES[key].maxPax);
}

function formatEUR(amount) {
  return "€" + amount;
}

// The Netlify function loads this same file (CommonJS). In the browser and in
// the tools' vm context `module` is undefined, so this does nothing there.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    VEHICLES, RETURN_DISCOUNT, DESTINATION_NAMES,
    calculateTieredPrice, roundToNearest5, priceForDistance, calculateTotal,
    vehiclesForPassengers, formatEUR
  };
}
