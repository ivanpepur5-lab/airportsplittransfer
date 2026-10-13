"""Stamp every stylesheet and script URL with a hash of the file's content.

    python3 tools/stamp_assets.py

css/style.css and js/*.js are not fingerprinted by the host, and a CDN or the
browser can keep serving an old copy after a deploy (the HTML is new, the CSS
is old). Giving each URL ?v=<hash of the file> makes the URL change exactly
when the file changes, so a deploy can never run new HTML against old CSS/JS.
Safe to run any number of times. netlify.toml runs it at the start of every
build, and it is also run before committing.
"""
import glob, hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = ("tools/", "content-pipeline/", "marketing/", "email-templates/", "node_modules/", ".git/")


def digest(path):
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:10]


def main():
    os.chdir(ROOT)
    hashes = {"css/style.css": digest("css/style.css")}
    for p in glob.glob("js/*.js"):
        hashes[p.replace(os.sep, "/")] = digest(p)
    pat = re.compile(r'((?:href|src)=")((?:\.\./)*)((?:css/style\.css|js/[A-Za-z0-9_.-]+\.js))(\?v=[^"]*)?(")')

    def sub(m):
        h = hashes.get(m.group(3))
        if not h:
            return m.group(0)
        return f"{m.group(1)}{m.group(2)}{m.group(3)}?v={h}{m.group(5)}"

    changed = total = 0
    for p in glob.glob("**/*.html", recursive=True):
        if p.startswith(SKIP):
            continue
        s = open(p, encoding="utf-8").read()
        s2 = pat.sub(sub, s)
        total += 1
        if s2 != s:
            open(p, "w", encoding="utf-8").write(s2)
            changed += 1
    print(f"stamped {changed} of {total} pages ({len(hashes)} assets)")


if __name__ == "__main__":
    sys.exit(main())
