/* ==========================================================================
   AirportSplitTransfer.com — Pricing Engine
   Progressive (tiered) per-kilometre pricing — replaces the old fixed
   11-zone lookup table. Works for ANY address Google Maps can resolve a
   driving distance for, not just a hardcoded destination list.
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
    minPrice: 30,
    tiers: [
      { upToKm: 20, ratePerKm: 2.20 },
      { upToKm: 50, ratePerKm: 1.80 },
      { upToKm: 100, ratePerKm: 1.45 },
      { upToKm: 200, ratePerKm: 1.28 },
      { upToKm: Infinity, ratePerKm: 1.32 }
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
    minPrice: 40,
    tiers: [
      { upToKm: 20, ratePerKm: 3.20 },
      { upToKm: 50, ratePerKm: 2.60 },
      { upToKm: 100, ratePerKm: 1.95 },
      { upToKm: 200, ratePerKm: 1.55 },
      { upToKm: Infinity, ratePerKm: 1.56 }
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
    minPrice: 40,
    // Same per-km tariff as the V-Class, as specified.
    tiers: [
      { upToKm: 20, ratePerKm: 3.20 },
      { upToKm: 50, ratePerKm: 2.60 },
      { upToKm: 100, ratePerKm: 1.95 },
      { upToKm: 200, ratePerKm: 1.55 },
      { upToKm: Infinity, ratePerKm: 1.56 }
    ]
  }
};

const RETURN_DISCOUNT = 0.10; // discount applied to the return leg only

/**
 * Human-readable, geocodable place names for the `?to=` query-param links
 * used by destination pages and the fleet page (e.g. index.html?to=omis#booking).
 * These get typed into the dropoff field and resolved to a real driving
 * distance via DistanceMatrixService, same as anything a visitor types by hand.
 */
const DESTINATION_NAMES = {
  split: "Split, Croatia",
  podstrana: "Podstrana, Croatia",
  omis: "Omiš, Croatia",
  baskavoda: "Baška Voda, Croatia",
  brela: "Brela, Croatia",
  makarska: "Makarska, Croatia",
  sibenik: "Šibenik, Croatia",
  vodice: "Vodice, Croatia",
  zadar: "Zadar, Croatia",
  plitvice: "Plitvice Lakes National Park, Croatia",
  dubrovnik: "Dubrovnik, Croatia"
};

/**
 * Progressive (tiered) price calculation — each distance bracket is billed
 * at its own rate, not the whole trip at one flat rate.
 *
 * Example (Škoda, 65 km):
 *   first  20 km @ 2.00 =  40
 *   next   30 km @ 1.75 =  52.5
 *   next   15 km @ 1.55 =  23.25
 *   total               = 115.75  → rounded to nearest €5 = 115
 *
 * The last tier's upToKm is Infinity, so any distance past 200 km is simply
 * billed at that final open-ended rate — there's no unhandled distance.
 */
function calculateTieredPrice(distanceKm, tiers) {
  if (!distanceKm || distanceKm <= 0) return 0;

  let remaining = distanceKm;
  let previousCap = 0;
  let total = 0;

  for (const tier of tiers) {
    const bracketSize = tier.upToKm - previousCap;
    const kmInThisBracket = Math.min(remaining, bracketSize);
    if (kmInThisBracket <= 0) break;

    total += kmInThisBracket * tier.ratePerKm;
    remaining -= kmInThisBracket;
    previousCap = tier.upToKm;

    if (remaining <= 0) break;
  }

  if (remaining > 0) {
    const lastRate = tiers[tiers.length - 1].ratePerKm;
    total += remaining * lastRate;
  }

  return total;
}

function roundToNearest5(amount) {
  return Math.round(amount / 5) * 5;
}

/**
 * Full price for one vehicle given a driving distance in km.
 * Applies the tiered rate, the vehicle's minimum fare, and rounds to the
 * nearest €5.
 */
function priceForDistance(distanceKm, vehicleKey) {
  const vehicle = VEHICLES[vehicleKey];
  if (!vehicle || distanceKm == null) return null;
  const raw = calculateTieredPrice(distanceKm, vehicle.tiers);
  const withMinimum = Math.max(raw, vehicle.minPrice);
  return roundToNearest5(withMinimum);
}

/**
 * Full trip total including trip type. Return trips are billed as the
 * outbound leg at full price plus the return leg at a 10% discount.
 */
function calculateTotal(distanceKm, vehicleKey, tripType) {
  const base = priceForDistance(distanceKm, vehicleKey);
  if (base === null) return null;
  if (tripType === "return") return roundToNearest5(base + base * (1 - RETURN_DISCOUNT));
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
