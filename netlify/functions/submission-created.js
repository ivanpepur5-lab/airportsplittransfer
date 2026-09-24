// Auto-invoked by Netlify on every Netlify Forms submission on this site —
// this exact filename is a Netlify convention, no dashboard/webhook setup
// required. See: https://docs.netlify.com/forms/notifications/#trigger-serverless-functions
//
// Sends the two emails from email-templates/ through the Resend API:
//   1. Customer booking confirmation
//   2. Internal notification to the booking inbox
//
// Required environment variable (Netlify site settings → Environment):
//   RESEND_API_KEY            — Resend API key
// Optional overrides:
//   RESEND_FROM_EMAIL         — default: "Airport Split Transfer <booking@airportsplittransfer.com>"
//                               (must be a sender on a domain verified in Resend)
//   ADMIN_NOTIFICATION_EMAIL  — default: "info@airportsplittransfer.com"
//
// Two forms are handled: "booking" (index.html / de/index.html /
// sv/index.html — the point-to-point transfer form) and "daytrip"
// (day-trips/krka-national-park.html / day-trips/plitvice-lakes.html — the
// fixed-price Krka/Plitvice excursions). Submissions from any other Netlify
// form on the site are ignored so adding a new form elsewhere later can't
// break this function.

const { renderTemplate, renderTextTemplate } = require("./lib/template");
const { sendEmail } = require("./lib/resend");
const {
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
} = require("./lib/booking");
const { ADMIN_TEMPLATE, ADMIN_TEMPLATE_TEXT, CUSTOMER_TEMPLATES, CUSTOMER_TEMPLATES_TEXT } = require("./lib/templates");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Airport Split Transfer <booking@airportsplittransfer.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@airportsplittransfer.com";

const adminTemplateSrc = ADMIN_TEMPLATE;

const LANGUAGE_NAMES = { en: "English", de: "German", sv: "Swedish" };

const CUSTOMER_SUBJECTS = {
  en: {
    booking: (d) => `✅ Booking Confirmed — ${d.date} at ${d.pickup_time} | Airport Split Transfer`,
    daytrip: (d) => `✅ Day Trip Confirmed — ${d.trip_name} — ${d.date} | Airport Split Transfer`,
  },
  de: {
    booking: (d) => `✅ Buchung bestätigt — ${d.date} um ${d.pickup_time} | Airport Split Transfer`,
    daytrip: (d) => `✅ Tagesausflug bestätigt — ${d.trip_name} — ${d.date} | Airport Split Transfer`,
  },
  sv: {
    booking: (d) => `✅ Bokning bekräftad — ${d.date} kl. ${d.pickup_time} | Airport Split Transfer`,
    daytrip: (d) => `✅ Dagsutflykt bekräftad — ${d.trip_name} — ${d.date} | Airport Split Transfer`,
  },
};

exports.handler = async (event) => {
  // Logged unconditionally, before any early return, so a real submission
  // is always traceable in Netlify's function logs even if everything past
  // this point is skipped — this was previously silent, which is exactly
  // why booking emails not sending in production was hard to diagnose.
  console.log("[booking-email] submission-created invoked, body length:", event.body ? event.body.length : 0);

  // A direct GET to this function's own URL previously returned a small
  // diagnostic report from here. In production that request gets HTTP 403
  // before this handler ever runs — nothing in this repo returns 403
  // anywhere, so that's Netlify itself restricting direct access to a
  // function bound to the Forms submission-created convention. The same
  // diagnostics now live at the plain, unrestricted booking-email-status
  // function instead — see netlify/functions/booking-email-status.js.

  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    console.error("[booking-email] Could not parse Netlify submission payload:", err);
    return { statusCode: 400, body: "Invalid payload" };
  }

  console.log("[booking-email] form_name:", payload && payload.form_name, "| has RESEND_API_KEY:", Boolean(process.env.RESEND_API_KEY));

  if (!payload || (payload.form_name !== "booking" && payload.form_name !== "daytrip")) {
    // Not a form this function handles — ignore so other/future Netlify
    // forms on the site don't get emails they weren't meant to trigger.
    return { statusCode: 200, body: "Ignored (not booking or daytrip)" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[booking-email] RESEND_API_KEY is not set — booking emails were NOT sent for submission", payload.id);
    return { statusCode: 200, body: "RESEND_API_KEY missing" };
  }

  const data = payload.data || {};
  const lang = normalizeLang(data.lang);
  const build = payload.form_name === "daytrip" ? buildDaytripTemplateData : buildBookingTemplateData;
  // The customer gets labels/dates in the language they booked in; the
  // admin copy is always English, with the customer's language noted.
  const customerData = build(payload, data, lang);
  const adminData = Object.assign(build(payload, data, "en"), { customer_language: LANGUAGE_NAMES[lang] });

  const results = await Promise.allSettled([
    sendCustomerEmail(customerData, lang),
    sendAdminEmail(adminData, lang),
  ]);

  const [customerResult, adminResult] = results;
  if (customerResult.status === "rejected") {
    console.error("[booking-email] Customer confirmation email failed for submission", payload.id, customerResult.reason);
  } else {
    console.log("[booking-email] Customer confirmation email sent for submission", payload.id, customerResult.value && customerResult.value.id);
  }
  if (adminResult.status === "rejected") {
    console.error("[booking-email] Admin notification email failed for submission", payload.id, adminResult.reason);
  } else {
    console.log("[booking-email] Admin notification email sent for submission", payload.id, adminResult.value && adminResult.value.id);
  }

  // Netlify doesn't use this function's response to affect the original
  // form submission (the browser already got its response), so this always
  // returns 200 — send failures are surfaced via the logs above instead of
  // by failing the request.
  return { statusCode: 200, body: "Processed" };
};

function buildBookingTemplateData(payload, data, lang) {
  const { price, priceDisplay } = formatPrice(data.calculated_price, lang);
  return {
    booking_reference: buildBookingReference(payload),
    full_name: data.full_name || "",
    customer_name: data.full_name || "",
    email: data.email || "",
    email_addr: cleanEmail(data.email),
    phone: data.phone || "",
    phone_tel: digitsAndPlus(data.phone),
    date: formatDate(data.date, lang),
    pickup_time: data.time || "",
    pickup: data.pickup || "",
    dropoff: data.dropoff || "",
    trip_type: tripTypeLabel(data.trip_type, lang),
    return_date: formatDate(data.return_date, lang),
    return_time: data.return_time || "",
    passengers: data.passengers || "",
    vehicle: vehicleLabel(data.vehicle, lang),
    price,
    price_display: priceDisplay,
    flight_number: data.flight_number || "",
    notes: data.notes || "",
    show_daytrips_promo: true,
    is_daytrip: false,
  };
}

// Krka/Plitvice day trips — fixed price per trip/vehicle, recomputed here
// from the trusted trip/vehicle keys rather than the client-submitted
// `price` field (see lib/booking.js daytripPrice()). Mapped onto the same
// customer/admin templates as the transfer form: pickup/dropoff become the
// pickup description and trip name, trip_type reads "Day Trip", and there's
// no return leg (it's a round trip by definition) or flight number.
function buildDaytripTemplateData(payload, data, lang) {
  const { price, priceDisplay } = formatPrice(daytripPrice(data.trip, data.vehicle), lang);
  const text = daytripText(lang);
  return {
    booking_reference: buildBookingReference(payload),
    full_name: data.full_name || "",
    customer_name: data.full_name || "",
    email: data.email || "",
    email_addr: cleanEmail(data.email),
    phone: data.phone || "",
    phone_tel: digitsAndPlus(data.phone),
    date: formatDate(data.date, lang),
    pickup_time: data.time || "",
    pickup: data.pickup_address || text.pickupFallback,
    dropoff: `${daytripName(data.trip, lang)} (${text.label})`,
    trip_name: daytripName(data.trip, lang),
    trip_type: text.label,
    return_date: "",
    return_time: "",
    passengers: data.passengers || "",
    vehicle: daytripVehicleLabel(data.vehicle, lang),
    price,
    price_display: priceDisplay,
    flight_number: "",
    notes: data.notes || "",
    is_daytrip: true,
  };
}

function cleanEmail(email) {
  // Emails don't need cleaning the way phone numbers do; kept as its own
  // token only so the template's {{email_addr}} (used in mailto: hrefs)
  // and {{email}} (used for display) can diverge later without a template
  // change if ever needed.
  return (email || "").trim();
}

async function sendCustomerEmail(templateData, lang) {
  if (!templateData.email) {
    throw new Error("Submission has no customer email address — cannot send confirmation");
  }
  const html = renderTemplate(CUSTOMER_TEMPLATES[lang], templateData);
  const text = renderTextTemplate(CUSTOMER_TEMPLATES_TEXT[lang], templateData);
  const subjects = CUSTOMER_SUBJECTS[lang];
  const subject = templateData.is_daytrip ? subjects.daytrip(templateData) : subjects.booking(templateData);
  return sendEmail({
    from: FROM_EMAIL,
    to: templateData.email,
    replyTo: ADMIN_EMAIL,
    subject,
    html,
    text,
  });
}

async function sendAdminEmail(templateData, lang) {
  const html = renderTemplate(adminTemplateSrc, templateData);
  const text = renderTextTemplate(ADMIN_TEMPLATE_TEXT, templateData);
  const langTag = lang === "en" ? "" : ` • ${lang.toUpperCase()}`;
  const subject = `🚖 NEW BOOKING • ${templateData.date} ${templateData.pickup_time} • ${templateData.customer_name}${langTag}`;
  return sendEmail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: templateData.email || undefined,
    subject,
    html,
    text,
  });
}
