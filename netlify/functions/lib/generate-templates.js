#!/usr/bin/env node
// Regenerates templates.js from the canonical HTML source in
// ../../../email-templates/*.html. Run this after editing either template:
//
//   node netlify/functions/lib/generate-templates.js
//
// Why generated instead of read from disk at runtime: submission-created.js
// previously used fs.readFileSync() against a path relying on netlify.toml's
// [functions].included_files to bundle the .html files alongside the
// function. That depends on exactly how Netlify's bundler (esbuild) lays out
// included_files relative to __dirname at runtime, which isn't something
// verifiable from outside an actual Netlify deploy — and booking emails
// silently not sending in production, with no way to inspect the function
// logs from here, is exactly the failure mode a wrong assumption there would
// produce. Embedding the HTML as a plain JS string means esbuild bundles it
// as ordinary code (via the require() in submission-created.js), with zero
// runtime file-system dependency and nothing left to get wrong about the
// deployment layout.
//
// The .html/.txt files remain the source of truth for editing/reviewing
// the email design (see email-templates/README.md) — this script is the
// one place that needs to be re-run after changing them, and templates.js
// is committed so the function never depends on running this at deploy
// time.
//
// The .html files each start with a large `<!-- ... -->` documentation
// comment (field mapping, hide-if-empty rules) for anyone reading the file
// in an editor or on GitHub. That comment is stripped here before
// embedding — it's dev-facing documentation, not part of the email, and a
// customer received it verbatim at the top of a real confirmation email:
// with no explicit `text` part on the Resend payload, something in the
// send/render path was generating a plain-text fallback from the raw HTML
// source, and a multi-paragraph comment full of "<tr>"/"<div>" mentions
// and no real tags to balance against broke whatever naive tag-stripping
// produced it. HTML comments are supposed to be invisible either way, but
// the actual fix is not shipping 40 lines of internal docs inside the
// literal payload sent to a real inbox at all — regardless of whether a
// given renderer strips comments correctly. Only the leading comment is
// touched; MSO conditional comments and everything else deeper in the
// file are left exactly as they are.

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "..", "..", "email-templates");
const OUT_PATH = path.join(__dirname, "templates.js");

function stripLeadingComment(html) {
  return html.replace(/^\s*<!--[\s\S]*?-->\s*/, "");
}

const customerHtml = stripLeadingComment(
  fs.readFileSync(path.join(TEMPLATES_DIR, "booking-confirmation-customer.html"), "utf8")
);
const adminHtml = stripLeadingComment(
  fs.readFileSync(path.join(TEMPLATES_DIR, "booking-notification-admin.html"), "utf8")
);
const customerText = fs.readFileSync(path.join(TEMPLATES_DIR, "booking-confirmation-customer.txt"), "utf8");
const adminText = fs.readFileSync(path.join(TEMPLATES_DIR, "booking-notification-admin.txt"), "utf8");

// Translated customer confirmations (booking-confirmation-customer.<lang>.html/.txt).
// The admin notification stays English — it goes to the business, not the customer.
const customerByLang = { en: { html: customerHtml, text: customerText } };
for (const lang of ["de", "sv"]) {
  customerByLang[lang] = {
    html: stripLeadingComment(fs.readFileSync(path.join(TEMPLATES_DIR, `booking-confirmation-customer.${lang}.html`), "utf8")),
    text: fs.readFileSync(path.join(TEMPLATES_DIR, `booking-confirmation-customer.${lang}.txt`), "utf8"),
  };
}

const output = `// GENERATED FILE — do not edit by hand.
// Source of truth: email-templates/*.html and email-templates/*.txt
// Regenerate with: node netlify/functions/lib/generate-templates.js

module.exports = {
  CUSTOMER_TEMPLATE: ${JSON.stringify(customerHtml)},
  ADMIN_TEMPLATE: ${JSON.stringify(adminHtml)},
  CUSTOMER_TEMPLATE_TEXT: ${JSON.stringify(customerText)},
  ADMIN_TEMPLATE_TEXT: ${JSON.stringify(adminText)},
  CUSTOMER_TEMPLATES: {
    en: ${JSON.stringify(customerByLang.en.html)},
    de: ${JSON.stringify(customerByLang.de.html)},
    sv: ${JSON.stringify(customerByLang.sv.html)},
  },
  CUSTOMER_TEMPLATES_TEXT: {
    en: ${JSON.stringify(customerByLang.en.text)},
    de: ${JSON.stringify(customerByLang.de.text)},
    sv: ${JSON.stringify(customerByLang.sv.text)},
  },
};
`;

fs.writeFileSync(OUT_PATH, output, "utf8");
console.log(
  `Wrote ${OUT_PATH} (${customerHtml.length + adminHtml.length + customerText.length + adminText.length} chars embedded)`
);
