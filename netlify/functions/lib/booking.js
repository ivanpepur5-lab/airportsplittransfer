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

const VEHICLE_LABELS_I18N = {
  en: VEHICLE_LABELS,
  de: {
    skoda: "Sedan — Škoda Superb oder ähnlich",
    vclass: "Business-Van — Mercedes-Benz V-Klasse",
    trafic: "Van — Renault Trafic oder ähnlich",
  },
  sv: {
    skoda: "Sedan — Škoda Superb eller liknande",
    vclass: "Business-van — Mercedes-Benz V-klass",
    trafic: "Van — Renault Trafic eller liknande",
  },
};

// The forms send a hidden `lang` field (en/de/sv) so the customer's
// confirmation matches the language they booked in; anything else is en.
function normalizeLang(lang) {
  return lang === "de" || lang === "sv" ? lang : "en";
}

function vehicleLabel(vehicleKey, lang = "en") {
  if (!vehicleKey) return "";
  return VEHICLE_LABELS_I18N[normalizeLang(lang)][vehicleKey] || vehicleKey;
}

// Day trips (Krka, Plitvice) are a separate flat-rate product from the
// point-to-point transfer form above — fixed price per trip/vehicle, not a
// per-km calculation. Keep in sync with the hidden `trip`/`vehicle` fields
// on day-trips/krka-national-park.html and day-trips/plitvice-lakes.html.
const DAYTRIP_NAMES = {
  en: { krka: "Krka National Park", plitvice: "Plitvice Lakes" },
  de: { krka: "Nationalpark Krka", plitvice: "Plitvicer Seen" },
  sv: { krka: "Nationalparken Krka", plitvice: "Plitvicesjöarna" },
};

const DAYTRIP_VEHICLE_LABELS = {
  en: { car: "Car — Škoda Superb or similar (1–4 passengers)", van: "Van — up to 8 passengers" },
  de: { car: "PKW — Škoda Superb oder ähnlich (1–4 Personen)", van: "Van — bis zu 8 Personen" },
  sv: { car: "Bil — Škoda Superb eller liknande (1–4 personer)", van: "Van — upp till 8 personer" },
};

const DAYTRIP_TEXT = {
  en: { label: "Day Trip", pickupFallback: "Hotel / accommodation pickup in Split" },
  de: { label: "Tagesausflug", pickupFallback: "Abholung am Hotel / an der Unterkunft in Split" },
  sv: { label: "Dagsutflykt", pickupFallback: "Upphämtning vid hotell/boende i Split" },
};

function daytripText(lang) {
  return DAYTRIP_TEXT[normalizeLang(lang)];
}

const DAYTRIP_PRICES = {
  krka: { car: 230, van: 270 },
  plitvice: { car: 390, van: 450 },
};

function daytripName(tripKey, lang = "en") {
  return DAYTRIP_NAMES[normalizeLang(lang)][tripKey] || tripKey || "";
}

function daytripVehicleLabel(vehicleKey, lang = "en") {
  return DAYTRIP_VEHICLE_LABELS[normalizeLang(lang)][vehicleKey] || vehicleKey || "";
}

// Recomputed server-side from the trusted trip/vehicle keys rather than
// trusting the client-submitted `price` field, since day-trip pricing is
// just a fixed lookup table — there's no reason to trust user input for it.
function daytripPrice(tripKey, vehicleKey) {
  const forTrip = DAYTRIP_PRICES[tripKey];
  return forTrip ? forTrip[vehicleKey] : undefined;
}

// Keep in sync with the hidden `trip_type` field on the booking form
// (js/booking-widget.js setTripType()), which is always "oneway" or
// "return". Falls back to "One way" for anything unexpected so the admin
// email never renders a blank trip type.
const TRIP_TYPE_LABELS = {
  en: { oneway: "One way", return: "Return" },
  de: { oneway: "Einfache Fahrt", return: "Hin- & Rückfahrt" },
  sv: { oneway: "Enkel resa", return: "Tur och retur" },
};

function tripTypeLabel(tripType, lang = "en") {
  const labels = TRIP_TYPE_LABELS[normalizeLang(lang)];
  return tripType === "return" ? labels.return : labels.oneway;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_ABBR_SV = [
  "jan", "feb", "mar", "apr", "maj", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

// Form fields are plain <input type="date"> values ("YYYY-MM-DD"). Render
// them the way the site's own confirmation UI does, e.g. "24 Sep 2026".
// Deliberately not using toLocaleDateString here: its "short" month name
// depends on the runtime's bundled ICU data (e.g. "Sep" vs "Sept"), which
// can differ between a local Node install and Netlify's Lambda runtime —
// a fixed lookup table keeps the output identical everywhere.
// German uses the numeric 24.09.2026 form, Swedish "3 maj 2026".
function formatDate(isoDate, lang = "en") {
  if (!isoDate) return "";
  const parts = String(isoDate).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return isoDate;
  const [year, month, day] = parts;
  if (month < 1 || month > 12) return isoDate;
  const dd = String(day).padStart(2, "0");
  const l = normalizeLang(lang);
  if (l === "de") return `${dd}.${String(month).padStart(2, "0")}.${year}`;
  if (l === "sv") return `${day} ${MONTH_ABBR_SV[month - 1]} ${year}`;
  return `${dd} ${MONTH_ABBR[month - 1]} ${year}`;
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
const PRICE_TBC = { en: "Price to be confirmed", de: "Preis wird bestätigt", sv: "Pris bekräftas" };

function formatPrice(rawPrice, lang = "en") {
  const num = Number(rawPrice);
  if (rawPrice === undefined || rawPrice === null || rawPrice === "" || Number.isNaN(num)) {
    return { price: "", priceDisplay: PRICE_TBC[normalizeLang(lang)] };
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
  tripTypeLabel,
  formatDate,
  buildBookingReference,
  formatPrice,
  digitsAndPlus,
  daytripName,
  daytripVehicleLabel,
  daytripPrice,
  daytripText,
  normalizeLang,
};
