"""Homepage headline font: Montserrat ExtraBold, the typeface of the logo.

Writes an inline <style id="hero-font"> block into the hand-maintained
homepages (en/de/sv/no). hr/ and it/ get it from index.html through their
builds (tools/hr, tools/it), so rebuild those afterwards.

The font is subset to exactly the letters the six homepage headlines use
(read from the pages each run, about 4 KB) and inlined as a data URI, so it
costs no extra request and the headline (the LCP element) paints in it on
the first frame. If a homepage headline changes, run this again (and rebuild
hr/it), or the new letters fall back to the body font.

Source: the OFL-licensed @fontsource/montserrat npm package:
    npm pack @fontsource/montserrat@5 && tar xzf fontsource-montserrat-*.tgz
    pip install fonttools brotli
    python3 tools/hero_font.py package/files
    python3 tools/hr/build.py && python3 tools/it/build.py
"""
import base64, html, io, os, re, sys
from fontTools.ttLib import TTFont
from fontTools import subset

PAGES = ["index.html", "de/index.html", "sv/index.html", "no/index.html"]
ALL_HOMES = PAGES + ["hr/index.html", "it/index.html"]

# Montserrat runs wider than the body font. Where a headline fits on one line
# on a phone, it is sized to the screen so it stays on one line (FIT = the
# headline's width in em, plus a little air). hr/it headlines are long and
# wrap either way, so they keep the normal size.
FIT = {"en": 11.4, "de": 12.0, "sv": 11.7, "no": 11.55}


def subset_b64(src, text):
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "calt"]
    opts.name_IDs = []
    opts.hinting = False
    opts.desubroutinize = True
    font = TTFont(src)
    font.flavor = None
    s = subset.Subsetter(opts)
    s.populate(text=text)
    s.subset(font)
    font.flavor = "woff2"
    buf = io.BytesIO()
    font.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


def headline_chars(root):
    chars = set(" '\u2019")
    for rel in ALL_HOMES:
        s = open(os.path.join(root, rel), encoding="utf-8").read()
        m = re.search(r'<section class="hero hero--booking">.*?<h1[^>]*>(.*?)</h1>', s, re.S)
        chars |= set(html.unescape(re.sub(r"<[^>]+>", "", m.group(1))))
    return chars


def block(files_dir, chars):
    latin_src = os.path.join(files_dir, "montserrat-latin-800-normal.woff2")
    ext_src = os.path.join(files_dir, "montserrat-latin-ext-800-normal.woff2")
    in_latin = TTFont(latin_src).getBestCmap()
    latin_chars = "".join(sorted(c for c in chars if ord(c) in in_latin))
    ext_chars = sorted(c for c in chars if ord(c) not in in_latin)
    latin = subset_b64(latin_src, latin_chars)
    ext_face = ""
    if ext_chars:
        ext = subset_b64(ext_src, "".join(ext_chars))
        rng = ",".join("U+%04X" % ord(c) for c in ext_chars)
        ext_face = f"\n@font-face{{font-family:'Montserrat Hero'; font-style:normal; font-weight:800; font-display:swap; src:url(data:font/woff2;base64,{ext}) format('woff2'); unicode-range:{rng};}}"
    fit = "\n".join(f'html[lang="{k}"] body.page-home .hero h1{{--h1-fit:{v};}}' for k, v in FIT.items())
    return f"""<style id="hero-font">
/* Homepage headline in the logo's typeface: Montserrat ExtraBold (SIL OFL 1.1),
   subset and inlined by tools/hero_font.py. Edit there, not here. */
@font-face{{font-family:'Montserrat Hero'; font-style:normal; font-weight:800; font-display:swap; src:url(data:font/woff2;base64,{latin}) format('woff2');}}{ext_face}
body.page-home .hero h1{{font-family:'Montserrat Hero','Schibsted Grotesk',sans-serif; font-weight:800; color:#0D2A52; letter-spacing:-0.025em; max-width:700px;}}
{fit}
@media (max-width:1023px){{ body.page-home .hero h1{{font-size:min(2.05rem, calc((100vw - 40px) / var(--h1-fit, 1)));}} }}
</style>"""


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    css = block(sys.argv[1], headline_chars(root))
    for rel in PAGES:
        path = os.path.join(root, rel)
        s = open(path, encoding="utf-8").read()
        if 'id="hero-font"' in s:
            s = re.sub(r'<style id="hero-font">.*?</style>', lambda m: css, s, count=1, flags=re.S)
        else:
            s, n = re.subn(r'(<link rel="stylesheet" href="(?:\.\./)?css/style\.css\?v=[^"]*">)', lambda m: m.group(1) + "\n" + css, s, count=1)
            assert n == 1, rel
        open(path, "w", encoding="utf-8").write(s)
        print("updated", rel)


if __name__ == "__main__":
    main()
