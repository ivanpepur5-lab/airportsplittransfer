"""Add sitemap entries for every page listed in tools/<lang>/pages.txt that
is missing from sitemap.xml. Priority and changefreq are copied from the
English entry; lastmod is today.  Usage: python3 tools/sitemap_lang.py hr it"""
import re, sys, datetime, os
BASE = "https://airportsplittransfer.com/"
s = open("sitemap.xml", encoding="utf-8").read()
today = datetime.date.today().isoformat()
def url(prefix, page):
    p = page[:-5]
    if p == "index": p = ""
    elif p.endswith("/index"): p = p[:-5]
    return BASE + prefix + p
added = 0
for lang in sys.argv[1:]:
    for page in open(os.path.join("tools", lang, "pages.txt")).read().split():
        if not page.endswith(".html") or page.startswith("partials/"): continue
        u = url(lang + "/", page)
        if f"<loc>{u}</loc>" in s: continue
        m = re.search(r"<url>\s*<loc>" + re.escape(url("", page)) + r"</loc>.*?</url>", s, re.S)
        if not m: print("no EN entry for", page); continue
        blk = m.group(0).replace(f"<loc>{url('', page)}</loc>", f"<loc>{u}</loc>")
        blk = re.sub(r"<lastmod>[^<]*</lastmod>", f"<lastmod>{today}</lastmod>", blk)
        s = s.replace("</urlset>", "  " + blk + "\n</urlset>"); added += 1
open("sitemap.xml", "w", encoding="utf-8").write(s)
print("added", added)
