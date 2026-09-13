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
// The .html files remain the source of truth for editing/reviewing the
// email design (see email-templates/README.md) — this script is the one
// place that needs to be re-run after changing them, and templates.js is
// committed so the function never depends on running this at deploy time.

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "..", "..", "email-templates");
const OUT_PATH = path.join(__dirname, "templates.js");

const customerHtml = fs.readFileSync(path.join(TEMPLATES_DIR, "booking-confirmation-customer.html"), "utf8");
const adminHtml = fs.readFileSync(path.join(TEMPLATES_DIR, "booking-notification-admin.html"), "utf8");

const output = `// GENERATED FILE — do not edit by hand.
// Source of truth: email-templates/*.html
// Regenerate with: node netlify/functions/lib/generate-templates.js

module.exports = {
  CUSTOMER_TEMPLATE: ${JSON.stringify(customerHtml)},
  ADMIN_TEMPLATE: ${JSON.stringify(adminHtml)},
};
`;

fs.writeFileSync(OUT_PATH, output, "utf8");
console.log(`Wrote ${OUT_PATH} (${customerHtml.length + adminHtml.length} chars embedded)`);
