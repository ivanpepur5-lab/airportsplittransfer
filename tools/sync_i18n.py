#!/usr/bin/env python3
"""Rebuild hreflang tags and language switchers on every page.

For each page, looks up which language versions of it exist (EN at the
root, DE in de/, SV in sv/, NO in no/) and rewrites:
  - the <link rel="alternate" hreflang=...> block after the canonical tag
    (only languages that exist, plus x-default -> English);
  - the desktop .lang-dropdown-menu and the mobile .mobile-lang links.
A switcher link to a language the page isn't translated into yet points to
that language's homepage instead, so every switcher always offers all four.

It also keeps in-page links inside a translated section honest: a link to a
sibling page that hasn't been translated yet falls back to the English page
(never a 404), and a fallback link to an English page switches back to the
translated page as soon as that translation exists.

Run from the repo root after adding or removing any translated page:
    python3 tools/sync_i18n.py
"""
import glob, os, re

BASE = "https://airportsplittransfer.com/"
LANGS = [("en", "", "English", "EN"), ("de", "de/", "Deutsch", "DE"),
         ("sv", "sv/", "Svenska", "SV"), ("no", "no/", "Norsk", "NO"),
         ("hr", "hr/", "Hrvatski", "HR")]
SECTIONS = ["*.html", "blog/*.html", "destinations/*.html", "day-trips/*.html", "hotel-transfers/*.html", "services/*.html"]


def keys_for(prefix):
    out = set()
    for pattern in SECTIONS:
        for path in glob.glob(prefix + pattern):
            out.add(path[len(prefix):])
    return out


def url_for(prefix, key):
    if key == "index.html":
        path = ""
    elif key.endswith("/index.html"):
        path = key[: -len("index.html")]
    else:
        path = key[: -len(".html")]
    return BASE + prefix + path


def main():
    exists = {code: keys_for(prefix) for code, prefix, _, _ in LANGS}
    changed = 0
    for code, prefix, _, _ in LANGS:
        for key in sorted(exists[code]):
            path = prefix + key
            s = open(path, encoding="utf-8").read()
            if "lang-dropdown-menu" not in s:
                continue
            orig = s
            here = os.path.dirname(path) or "."

            # hreflang block
            s = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n', "", s)
            alts = [f'<link rel="alternate" hreflang="{c}" href="{url_for(p, key)}">'
                    for c, p, _, _ in LANGS if key in exists[c]]
            if key in exists["en"]:
                alts.append(f'<link rel="alternate" hreflang="x-default" href="{url_for("", key)}">')
            s = re.sub(r'(<link rel="canonical" href="[^"]*">\n)', lambda m: m.group(1) + "\n".join(alts) + "\n", s, count=1)

            # switcher targets: the same page in each language, else that language's homepage
            def target(c, p):
                return os.path.relpath(p + (key if key in exists[c] else "index.html"), here)

            items = []
            mobile = []
            for c, p, name, short in LANGS:
                href = target(c, p)
                active = ' active" aria-current="page' if c == code else ""
                items.append(f'        <a href="{href}" class="lang-option{active}">{name}</a>')
                mobile.append(f'<a href="{href}" class="mobile-lang-opt{active}">{short}</a>')
            s = re.sub(r'(<div class="lang-dropdown-menu">\n)(?:\s*<a [^\n]*</a>\n)+',
                       lambda m: m.group(1) + "\n".join(items) + "\n", s, count=1)
            s = re.sub(r'(<div class="mobile-lang"[^>]*>)(?:<a [^>]*>[^<]*</a>)+(</div>)',
                       lambda m: m.group(1) + "".join(mobile) + m.group(2), s, count=1)
            # in-page links (not the switcher) to pages in this language
            if prefix:
                def fix(m):
                    attr, href = m.group(1), m.group(2)
                    if href.startswith(("http", "mailto:", "tel:", "#", "/")) or ".html" not in href:
                        return m.group(0)
                    file, _, frag = href.partition("#")
                    resolved = os.path.normpath(os.path.join(here, file))
                    if resolved.startswith(prefix):
                        k = resolved[len(prefix):]
                        if not os.path.exists(resolved) and k in exists["en"]:
                            new = os.path.relpath(k, here)
                            return f'{attr}"{new}{"#" + frag if frag else ""}"'
                    elif not any(resolved.startswith(p2) for _, p2, _, _ in LANGS if p2):
                        if resolved in exists["en"] and os.path.exists(prefix + resolved):
                            new = os.path.relpath(prefix + resolved, here)
                            return f'{attr}"{new}{"#" + frag if frag else ""}"'
                    return m.group(0)
                lines = s.split("\n")
                for i, line in enumerate(lines):
                    if "lang-option" in line or "mobile-lang-opt" in line:
                        continue
                    lines[i] = re.sub(r'(href=)"([^"]+)"', fix, line)
                s = "\n".join(lines)

            if s != orig:
                open(path, "w", encoding="utf-8").write(s)
                changed += 1
    print(f"updated {changed} pages")


if __name__ == "__main__":
    main()
