// Tiny mail-merge renderer, shared by the HTML templates and their plain-
// text fallbacks in email-templates/*. Supports exactly the two constructs
// used in those templates:
//   {{#if field}} ... {{/if}}   — keeps the block only if data[field] is truthy
//   {{field}}                  — substitution, HTML-escaped only for HTML
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

function renderTemplate(template, data, { escape = true } = {}) {
  let out = template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, field, body) => (data[field] ? body : "")
  );
  out = out.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    const value = data[field];
    if (value === undefined || value === null || value === "") return "";
    return escape ? escapeHtml(value) : String(value);
  });
  return out;
}

// Plain-text templates must never get HTML entities (&#39; etc. would show
// up literally with no HTML parser around to un-escape them) — this is
// renderTemplate() with escaping off, kept as a named export so the call
// site reads as intent rather than a flag to remember. Also collapses the
// blank lines a removed {{#if}} block leaves behind (whitespace an HTML
// renderer ignores, but that reads as sloppy double/triple gaps in plain
// text) down to at most one blank line between sections.
function renderTextTemplate(template, data) {
  const rendered = renderTemplate(template, data, { escape: false });
  return rendered.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

module.exports = { renderTemplate, renderTextTemplate, escapeHtml };
