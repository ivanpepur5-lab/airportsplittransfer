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
// Only the "booking" form (index.html / de/index.html / sv/index.html) is
// handled; submissions from any other Netlify form on the site are ignored
// so adding a new form elsewhere later can't break this function.

const { renderTemplate } = require("./lib/template");
const { sendEmail } = require("./lib/resend");
const { vehicleLabel, formatDate, buildBookingReference, formatPrice, digitsAndPlus } = require("./lib/booking");
const { CUSTOMER_TEMPLATE, ADMIN_TEMPLATE } = require("./lib/templates");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Airport Split Transfer <booking@airportsplittransfer.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@airportsplittransfer.com";

const customerTemplateSrc = CUSTOMER_TEMPLATE;
const adminTemplateSrc = ADMIN_TEMPLATE;

exports.handler = async (event) => {
  // Logged unconditionally, before any early return, so a real submission
  // is always traceable in Netlify's function logs even if everything past
  // this point is skipped — this was previously silent, which is exactly
  // why booking emails not sending in production was hard to diagnose.
  console.log("[booking-email] submission-created invoked, body length:", event.body ? event.body.length : 0);

  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    console.error("[booking-email] Could not parse Netlify submission payload:", err);
    return { statusCode: 400, body: "Invalid payload" };
  }

  console.log("[booking-email] form_name:", payload && payload.form_name, "| has RESEND_API_KEY:", Boolean(process.env.RESEND_API_KEY));

  if (!payload || payload.form_name !== "booking") {
    // Not the booking form — ignore so other/future Netlify forms on the
    // site don't get emails they weren't meant to trigger.
    return { statusCode: 200, body: "Ignored (not the booking form)" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[booking-email] RESEND_API_KEY is not set — booking emails were NOT sent for submission", payload.id);
    return { statusCode: 200, body: "RESEND_API_KEY missing" };
  }

  const data = payload.data || {};
  const { price, priceDisplay } = formatPrice(data.calculated_price);

  const templateData = {
    booking_reference: buildBookingReference(payload),
    full_name: data.full_name || "",
    customer_name: data.full_name || "",
    email: data.email || "",
    email_addr: cleanEmail(data.email),
    phone: data.phone || "",
    phone_tel: digitsAndPlus(data.phone),
    date: formatDate(data.date),
    pickup_time: data.time || "",
    pickup: data.pickup || "",
    dropoff: data.dropoff || "",
    return_date: formatDate(data.return_date),
    return_time: data.return_time || "",
    passengers: data.passengers || "",
    vehicle: vehicleLabel(data.vehicle),
    price,
    price_display: priceDisplay,
    flight_number: data.flight_number || "",
    notes: data.notes || "",
  };

  const results = await Promise.allSettled([
    sendCustomerEmail(templateData),
    sendAdminEmail(templateData),
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

function cleanEmail(email) {
  // Emails don't need cleaning the way phone numbers do; kept as its own
  // token only so the template's {{email_addr}} (used in mailto: hrefs)
  // and {{email}} (used for display) can diverge later without a template
  // change if ever needed.
  return (email || "").trim();
}

async function sendCustomerEmail(templateData) {
  if (!templateData.email) {
    throw new Error("Submission has no customer email address — cannot send confirmation");
  }
  const html = renderTemplate(customerTemplateSrc, templateData);
  const subject = `✅ Booking Confirmed — ${templateData.date} at ${templateData.pickup_time} | Airport Split Transfer`;
  return sendEmail({
    from: FROM_EMAIL,
    to: templateData.email,
    replyTo: ADMIN_EMAIL,
    subject,
    html,
  });
}

async function sendAdminEmail(templateData) {
  const html = renderTemplate(adminTemplateSrc, templateData);
  const subject = `🚖 NEW BOOKING • ${templateData.date} ${templateData.pickup_time} • ${templateData.customer_name}`;
  return sendEmail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: templateData.email || undefined,
    subject,
    html,
  });
}
