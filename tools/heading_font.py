"""Headings in the logo's typeface: Montserrat ExtraBold on every h1 and h2.

Writes the block between the heading-font markers at the end of
css/style.css, and removes the older homepage-only inline <style
id="hero-font"> if a page still has one (rebuild hr/ and it/ afterwards).

The font is subset to the characters the site's six languages need (full
ASCII, the German/Nordic/French/Italian accents, Croatian č ć đ š ž, quotes,
dashes, euro sign: about 10 KB) and inlined in the stylesheet as a data URI.
The stylesheet is already on every page and cached, so there is no extra
request and no late font swap that would move text or delay the headline.

Source: the OFL-licensed @fontsource/montserrat npm package (licence copied
to assets/fonts/OFL-montserrat.txt):
    npm pack @fontsource/montserrat@5 && tar xzf fontsource-montserrat-*.tgz
    pip install fonttools brotli
    python3 tools/heading_font.py package/files
    python3 tools/hr/build.py && python3 tools/it/build.py
"""
import base64, io, os, re, sys
from fontTools.ttLib import TTFont
from fontTools import subset

LATIN = ("".join(chr(c) for c in range(0x20, 0x7F))
         + "ÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÖØÙÚÛÜßàáâäåæçèéêëìíîïñòóôöøùúûü"
         + "‘’“”–—…€«»· ")
EXT = "ĆćČčĐđŠšŽž"
HOMES = ["index.html", "de/index.html", "sv/index.html", "no/index.html"]
START, END = "/* heading-font:start */", "/* heading-font:end */"

# Homepage headline on phones: where it fits on one line it is sized to the
# screen so it stays on one line (FIT = the headline's width in em, plus a
# little air). Longer headlines keep the normal size and wrap, balanced.
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


def block(files_dir):
    latin = subset_b64(os.path.join(files_dir, "montserrat-latin-800-normal.woff2"), LATIN)
    ext = subset_b64(os.path.join(files_dir, "montserrat-latin-ext-800-normal.woff2"), EXT)
    rng = ",".join("U+%04X" % ord(c) for c in EXT)
    fit = "\n".join(f'html[lang="{k}"] body.page-home .hero h1{{--h1-fit:{v};}}' for k, v in FIT.items())
    return f"""{START}
/* ============ HEADINGS: LOGO TYPEFACE ============
   h1 and h2 in Montserrat ExtraBold (SIL OFL, assets/fonts/OFL-montserrat.txt),
   the typeface of the logo, in the logo's navy. Subset and inlined by
   tools/heading_font.py: edit there, not here. */
@font-face{{font-family:'Montserrat Heading'; font-style:normal; font-weight:800; font-display:swap; src:url(data:font/woff2;base64,{latin}) format('woff2');}}
@font-face{{font-family:'Montserrat Heading'; font-style:normal; font-weight:800; font-display:swap; src:url(data:font/woff2;base64,{ext}) format('woff2'); unicode-range:{rng};}}
:root{{--heading:#0D2A52;}}
h1, h2{{font-family:'Montserrat Heading','Schibsted Grotesk',sans-serif; font-weight:800; letter-spacing:-0.025em; line-height:1.18; color:var(--heading); text-wrap:balance;}}
.hero h1{{color:var(--heading);}}
body.page-home .hero h1{{max-width:880px;}}
{fit}
@media (max-width:1023px){{ body.page-home .hero h1{{font-size:min(2.05rem, calc((100vw - 40px) / var(--h1-fit, 1)));}} }}
{END}"""


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    css = block(sys.argv[1])
    path = os.path.join(root, "css", "style.css")
    s = open(path, encoding="utf-8").read()
    if START in s:
        s = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda m: css, s, count=1, flags=re.S)
    else:
        s = s.rstrip("\n") + "\n\n" + css + "\n"
    open(path, "w", encoding="utf-8").write(s)
    print("updated css/style.css")
    for rel in HOMES:
        p = os.path.join(root, rel)
        h = open(p, encoding="utf-8").read()
        h2 = re.sub(r'\n?<style id="hero-font">.*?</style>', "", h, count=1, flags=re.S)
        if h2 != h:
            open(p, "w", encoding="utf-8").write(h2)
            print("removed inline hero font from", rel)


if __name__ == "__main__":
    main()
