// Tiny mail-merge renderer for the email-templates/*.html files.
// Supports exactly the two constructs already used in those templates:
//   {{#if field}} ... {{/if}}   — keeps the block only if data[field] is truthy
//   {{field}}                  — HTML-escaped substitution
// Deliberately not a full templating engine — the templates only ever need
// these two features, and keeping this dependency-free avoids pulling in a
// bundler-unfriendly library for two small emails.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTemplate(template, data) {
  let out = template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, field, body) => (data[field] ? body : "")
  );
  out = out.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    const value = data[field];
    return value === undefined || value === null || value === "" ? "" : escapeHtml(value);
  });
  return out;
}

module.exports = { renderTemplate, escapeHtml };
