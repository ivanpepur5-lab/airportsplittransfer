/* ==========================================================================
   AirportSplitTransfer.com — Pricing Engine
   Distance-bracket flat-rate pricing: the total trip distance picks ONE
   per-km rate (from the bracket it falls into) and that single rate is
   charged for the whole distance — not a progressive/tiered sum across
   brackets. Works for ANY address Google Maps can resolve a driving
   distance for, not just a hardcoded destination list.
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
      { upToKm: 100, ratePerKm: 1.60 },
      { upToKm: Infinity, ratePerKm: 1.50 }
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
      { upToKm: 100, ratePerKm: 1.90 },
      { upToKm: Infinity, ratePerKm: 1.80 }
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
      { upToKm: 100, ratePerKm: 1.90 },
      { upToKm: Infinity, ratePerKm: 1.80 }
    ]
  }
};

const RETURN_DISCOUNT = 0.05; // discount applied to the combined return-trip total

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
 * Distance-bracket flat-rate price calculation — the bracket the TOTAL
 * distance falls into sets a single per-km rate, charged for the entire
 * distance from km 0. Not progressive: the trip is never split across
 * brackets.
 *
 * Example (Škoda, 105 km — falls in the 100+ bracket):
 *   105 km @ 1.50/km = 157.50 → rounded to nearest €5 = 160
 *
 * The last tier's upToKm is Infinity, so any distance is always matched by
 * some bracket — there's no unhandled distance.
 */
function calculateTieredPrice(distanceKm, tiers) {
  if (!distanceKm || distanceKm <= 0) return 0;

  const bracket = tiers.find(tier => distanceKm <= tier.upToKm) || tiers[tiers.length - 1];
  return distanceKm * bracket.ratePerKm;
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
