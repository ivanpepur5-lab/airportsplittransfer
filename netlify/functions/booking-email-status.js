// Plain, ordinary Netlify function — deliberately NOT named
// "submission-created" or any other Netlify Forms special-invocation name,
// so it carries none of that convention's platform-level restrictions.
//
// submission-created.js originally answered a plain GET (no body) with
// this same diagnostic report, on the theory that a real Netlify form
// submission always sends a JSON body, so a bare visit was safe to treat
// as a manual check. In production that direct visit returns HTTP 403 —
// before submission-created.js's own code ever runs (nothing in this
// repo's code, headers, redirects, or edge functions returns 403 anywhere;
// confirmed by grepping all of it). That points at Netlify itself applying
// extra access restrictions specifically to functions bound to the Forms
// submission-created convention when they're hit directly rather than
// invoked by Netlify's own form-processing pipeline. A function under any
// other name has no such binding and is just a normal public endpoint.
//
// Visit directly:
//   https://<your-site>/.netlify/functions/booking-email-status
//   https://<your-site>/.netlify/functions/booking-email-status?checkResend=1
//   https://<your-site>/.netlify/functions/booking-email-status?sendTestTo=you@example.com
//   https://<your-site>/.netlify/functions/booking-email-status?sendTestTo=you@example.com&fullTemplate=1
//
// ?checkResend=1 calls Resend's /domains endpoint — this fails with 401
// "restricted to only send emails" for a send-only scoped API key (a
// narrower permission level Resend lets you create keys with). That 401
// is about that endpoint specifically, not proof the key can't send.
//
// ?sendTestTo=<address> sends one real, clearly-labeled test email to
// that address using the exact same send path as a real booking (same
// lib/resend.js, same FROM_EMAIL) — the one thing a send-only key can
// always be tested with directly. By default this uses a short inline
// message, not the real customer template.
//
// Add &fullTemplate=1 to instead render and send the ACTUAL customer
// confirmation template (with sample booking data) through the exact same
// renderTemplate()/renderTextTemplate() calls submission-created.js uses.
// This exists because a minimal test message succeeding doesn't rule out
// something specific to the full ~20KB rendered HTML/text — a rendering
// exception, an oversized payload, a character encoding issue — that a
// real booking hits and a two-line test message never would.

const { buildReport } = require("./lib/diagnostics");
const { CUSTOMER_TEMPLATE, ADMIN_TEMPLATE, CUSTOMER_TEMPLATE_TEXT } = require("./lib/templates");
const { sendEmail } = require("./lib/resend");
const { renderTemplate, renderTextTemplate } = require("./lib/template");
const { vehicleLabel, formatDate, formatPrice } = require("./lib/booking");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Airport Split Transfer <booking@airportsplittransfer.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@airportsplittransfer.com";

const SAMPLE_BOOKING_DATA = {
  booking_reference: "AST-TEST",
  full_name: "Test Customer",
  email: "placeholder@example.com", // overwritten with the real sendTestTo below
  phone: "+385 91 000 0000",
  date: formatDate("2026-01-15"),
  pickup_time: "10:00",
  pickup: "Split Airport (SPU), Croatia",
  dropoff: "Hotel Test, Split",
  passengers: "2",
  vehicle: vehicleLabel("skoda"),
  flight_number: "OU491",
};

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const wantsResendCheck = Boolean(params.checkResend);
  const sendTestTo = params.sendTestTo;
  const useFullTemplate = Boolean(params.fullTemplate);

  const report = await buildReport({
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: FROM_EMAIL,
    adminEmail: ADMIN_EMAIL,
    customerTemplateSrc: CUSTOMER_TEMPLATE,
    adminTemplateSrc: ADMIN_TEMPLATE,
    wantsResendCheck,
  });

  if (sendTestTo) {
    if (!process.env.RESEND_API_KEY) {
      report.sendTest = { to: sendTestTo, success: false, error: "RESEND_API_KEY not set" };
    } else {
      try {
        let emailPayload;
        if (useFullTemplate) {
          const { priceDisplay } = formatPrice("45");
          const templateData = { ...SAMPLE_BOOKING_DATA, email: sendTestTo, price_display: priceDisplay };
          emailPayload = {
            subject: "Airport Split Transfer — FULL TEMPLATE test",
            html: renderTemplate(CUSTOMER_TEMPLATE, templateData),
            text: renderTextTemplate(CUSTOMER_TEMPLATE_TEXT, templateData),
          };
        } else {
          emailPayload = {
            subject: "Airport Split Transfer — Resend test email",
            html: "<p>This is a test email from booking-email-status.js to check whether Resend accepts sends to this address. Safe to ignore/delete.</p>",
            text: "This is a test email from booking-email-status.js to check whether Resend accepts sends to this address. Safe to ignore/delete.",
          };
        }
        const result = await sendEmail({ from: FROM_EMAIL, to: sendTestTo, ...emailPayload });
        report.sendTest = { to: sendTestTo, fullTemplate: useFullTemplate, success: true, id: result && result.id };
      } catch (err) {
        report.sendTest = { to: sendTestTo, fullTemplate: useFullTemplate, success: false, error: err.message };
      }
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report, null, 2),
  };
};
