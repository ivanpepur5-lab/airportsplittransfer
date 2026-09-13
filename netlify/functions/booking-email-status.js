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
//
// Never sends a real booking email and never touches booking data.

const { buildReport } = require("./lib/diagnostics");
const { CUSTOMER_TEMPLATE, ADMIN_TEMPLATE } = require("./lib/templates");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Airport Split Transfer <booking@airportsplittransfer.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "info@airportsplittransfer.com";

exports.handler = async (event) => {
  const wantsResendCheck = Boolean(event.queryStringParameters && event.queryStringParameters.checkResend);

  const report = await buildReport({
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: FROM_EMAIL,
    adminEmail: ADMIN_EMAIL,
    customerTemplateSrc: CUSTOMER_TEMPLATE,
    adminTemplateSrc: ADMIN_TEMPLATE,
    wantsResendCheck,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report, null, 2),
  };
};
