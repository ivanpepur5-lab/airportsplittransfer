// Shared report builder for the booking-email self-check. Used by
// booking-email-status.js (a plain, publicly-GET-able function — see that
// file for why the equivalent check inside submission-created.js itself
// returns 403 in production instead of ever running).

async function buildReport({ apiKey, fromEmail, adminEmail, customerTemplateSrc, adminTemplateSrc, wantsResendCheck }) {
  const report = {
    ok: true,
    message: "booking-email-status is deployed and reachable.",
    resendApiKeyPresent: Boolean(apiKey),
    resendApiKeyPrefix: apiKey ? apiKey.slice(0, 6) + "…" : null,
    fromEmail,
    adminEmail,
    templatesEmbedded: {
      customer: customerTemplateSrc.length > 0,
      admin: adminTemplateSrc.length > 0,
    },
    nodeVersion: process.version,
  };

  if (wantsResendCheck) {
    if (!apiKey) {
      report.resendCheck = { skipped: true, reason: "RESEND_API_KEY not set" };
    } else {
      try {
        const response = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        const json = await response.json().catch(() => ({}));
        if (response.ok) {
          report.resendCheck = {
            apiKeyValid: true,
            domains: Array.isArray(json.data)
              ? json.data.map((d) => ({ name: d.name, status: d.status }))
              : json,
          };
        } else {
          report.resendCheck = {
            apiKeyValid: false,
            status: response.status,
            error: json.message || json,
          };
        }
      } catch (err) {
        report.resendCheck = { apiKeyValid: false, error: String(err) };
      }
    }
  } else {
    report.hint = "Add ?checkResend=1 to also verify the key against Resend's API and see sending-domain status.";
  }

  return report;
}

module.exports = { buildReport };
