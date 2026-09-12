// Netlify Edge Function — tags each visitor as EU/EEA/UK or not, via a
// short-lived, non-identifying cookie, so the Klaro consent banner can
// decide client-side whether to render at all. This runs at Netlify's
// edge (no origin round-trip, no client-side geo-IP call), so it adds no
// measurable latency and has no effect on Core Web Vitals.
//
// The cookie only ever holds the literal string "eu" or "other" — never
// the visitor's actual country, city or IP.

const EU_EEA_UK_COUNTRIES = new Set([
  // EU member states
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA (non-EU)
  "IS", "LI", "NO",
  // UK GDPR still applies post-Brexit
  "GB"
]);

export default async (request, context) => {
  const response = await context.next();

  // Don't override a region the visitor (or a previous visit) already has.
  const cookieHeader = request.headers.get("cookie") || "";
  if (/(?:^|;\s*)region=/.test(cookieHeader)) {
    return response;
  }

  const countryCode = context.geo?.country?.code;
  const region = countryCode && EU_EEA_UK_COUNTRIES.has(countryCode) ? "eu" : "other";

  response.headers.append(
    "Set-Cookie",
    `region=${region}; Path=/; Max-Age=2592000; SameSite=Lax`
  );
  return response;
};

export const config = { path: "/*" };
