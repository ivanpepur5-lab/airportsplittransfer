// Field mapping helpers shared by the booking confirmation/notification
// emails — kept separate from submission-created.js so the mapping logic
// (vehicle labels, date formatting, reference numbers) is easy to find and
// test on its own.

// Keep in sync with the vehicle keys set on the booking form's hidden
// `vehicle` field (index.html / de/index.html / sv/index.html) and with
// js/pricing.js's VEHICLES table.
const VEHICLE_LABELS = {
  skoda: "Sedan — Škoda Superb or similar",
  vclass: "Business Van — Mercedes-Benz V-Class",
  trafic: "Van — Renault Trafic or similar",
};

function vehicleLabel(vehicleKey) {
  if (!vehicleKey) return "";
  return VEHICLE_LABELS[vehicleKey] || vehicleKey;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Form fields are plain <input type="date"> values ("YYYY-MM-DD"). Render
// them the way the site's own confirmation UI does, e.g. "24 Sep 2026".
// Deliberately not using toLocaleDateString here: its "short" month name
// depends on the runtime's bundled ICU data (e.g. "Sep" vs "Sept"), which
// can differ between a local Node install and Netlify's Lambda runtime —
// a fixed lookup table keeps the output identical everywhere.
function formatDate(isoDate) {
  if (!isoDate) return "";
  const parts = String(isoDate).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return isoDate;
  const [year, month, day] = parts;
  if (month < 1 || month > 12) return isoDate;
  return `${String(day).padStart(2, "0")} ${MONTH_ABBR[month - 1]} ${year}`;
}

// The booking form itself has no reference-number field. Netlify assigns
// every submission an incrementing `number` (and a UUID `id`) — use that as
// a stable, human-readable booking reference instead of inventing new
// booking state.
function buildBookingReference(payload) {
  if (payload && payload.number) return `AST-${payload.number}`;
  if (payload && payload.id) return `AST-${String(payload.id).slice(0, 8).toUpperCase()}`;
  return "";
}

// calculated_price is set client-side (js pricing engine) and rounded to
// the nearest €5 — see js/pricing.js roundToNearest5(). It can be blank if
// the distance/price never resolved (e.g. an address Google's Distance
// Matrix couldn't geocode), so this always returns a safe display string
// rather than emitting a bare "€" or "€NaN".
function formatPrice(rawPrice) {
  const num = Number(rawPrice);
  if (rawPrice === undefined || rawPrice === null || rawPrice === "" || Number.isNaN(num)) {
    return { price: "", priceDisplay: "Price to be confirmed" };
  }
  const rounded = Math.round(num);
  return { price: String(rounded), priceDisplay: `€${rounded}` };
}

function digitsAndPlus(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

module.exports = {
  VEHICLE_LABELS,
  vehicleLabel,
  formatDate,
  buildBookingReference,
  formatPrice,
  digitsAndPlus,
};
