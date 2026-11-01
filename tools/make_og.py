#!/usr/bin/env python3
"""Per-page Open Graph images (1200x630): page photo, dark gradient, logo and title.

Routes use one language-neutral image (place name); articles, day trips, airports, hotel
and service pages get one image per language with that page's own H1.
Writes assets/og/<section>-<slug>[-<lang>].jpg and sets og:image / twitter:image in the pages.
hr/ and it/ pages are generated from English, so for them tools/hr|it/tr_zz_og.py hold literal URL swaps (JSR).
Run from the repo root:  python3 tools/make_og.py
"""
import re, glob, html, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SCRATCH = os.environ.get('OG_FONT_DIR', '/tmp')
TTF = os.path.join(SCRATCH, 'lexend-og.ttf')
if not os.path.exists(TTF):
    t = TTFont('assets/fonts/lexend-latin-wght-normal.woff2'); t.flavor = None; t.save(TTF)
BASE = 'https://airportsplittransfer.com/assets/og/'
VER = '?v=1'
LANGS = ['', 'de/', 'sv/', 'no/', 'hr/', 'it/']
SECTIONS = ['destinations', 'blog', 'day-trips', 'airports', 'services', 'hotel-transfers']
ROUTE_NEUTRAL = {'destinations'}
FALLBACK_PHOTO = {'blog/vclass-vs-trafic': 'assets/hero-vclass.webp'}

def font(size, w=800):
    f = ImageFont.truetype(TTF, size); f.set_variation_by_axes([w]); return f

def text_of(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()

def photo_for(page, s):
    slug = page[:-5]
    if slug in FALLBACK_PHOTO: return FALLBACK_PHOTO[slug]
    cands = []
    m = re.search(r'assets/((?:photo|daytrips|hotel)-[a-z0-9-]+?)(?:-m|-card)?\.(?:webp|avif)', s)
    if m: cands.append(m.group(1))
    cands.append('photo-' + slug.split('/')[-1])
    for c in cands:
        for suffix in ('', '-hero'):
            p = f'assets/{c}{suffix}.webp'
            if os.path.exists(p) and Image.open(p).size[0] >= 1200: return p
        p = f'assets/{c}.webp'
        if os.path.exists(p): return p
    raise SystemExit('no photo for ' + page)

def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=fnt) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def make(photo, title, out):
    im = Image.open(photo).convert('RGB')
    W, H = 1200, 630
    sc = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    x0 = (im.width - W) // 2; y0 = (im.height - H) // 2
    im = im.crop((x0, y0, x0 + W, y0 + H))
    grad = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gp = grad.load()
    for y in range(H):
        a = 0 if y < H * 0.18 else int(235 * ((y - H * 0.18) / (H * 0.82)) ** 1.15)
        for x in range(W): gp[x, y] = (7, 22, 46, min(a, 235))
    im = Image.alpha_composite(im.convert('RGBA'), grad)
    d = ImageDraw.Draw(im)
    logo = Image.open('assets/logo-white.png').convert('RGBA'); lh = 74
    logo = logo.resize((round(logo.width * lh / logo.height), lh), Image.LANCZOS)
    im.alpha_composite(logo, (56, 44))
    size = 78
    while size > 40:
        f = font(size); lines = wrap(d, title, f, 1080)
        if len(lines) <= 3 and all(d.textlength(l, font=f) <= 1080 for l in lines): break
        size -= 4
    lh_ = int(size * 1.18); total = lh_ * len(lines)
    y = H - 92 - total
    for l in lines:
        d.text((56, y), l, font=f, fill=(255, 255, 255)); y += lh_
    d.text((56, H - 70), 'airportsplittransfer.com', font=font(30, 500), fill=(150, 195, 255))
    im.convert('RGB').save(out, 'JPEG', quality=58, optimize=True, progressive=True, subsampling=2)

def set_og(path, url):
    s = open(path, encoding='utf-8').read()
    n = 0
    for pat in (r'(<meta property="og:image" content=")[^"]*(")', r'(<meta name="twitter:image" content=")[^"]*(")'):
        s, k = re.subn(pat, lambda m: m.group(1) + url + m.group(2), s, count=1); n += k
    s = re.sub(r'(<meta property="og:image:width" content=")\d+(")', r'\g<1>1200\2', s)
    s = re.sub(r'(<meta property="og:image:height" content=")\d+(")', r'\g<1>630\2', s)
    open(path, 'w', encoding='utf-8').write(s); return n

def main():
    jsr = {'hr': {}, 'it': {}}
    count = 0
    for sec in SECTIONS:
        for en in sorted(glob.glob(f'{sec}/*.html')):
            if en.endswith('index.html'): continue
            page = en
            s_en = open(en, encoding='utf-8').read()
            photo = photo_for(page, s_en)
            slug = f'{sec}-{os.path.basename(en)[:-5]}'
            for lang in LANGS:
                f = lang + page
                if not os.path.exists(f): continue
                s = open(f, encoding='utf-8').read()
                h = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
                if sec in ROUTE_NEUTRAL:
                    name = lang and '' or ''
                    bc = text_of(re.search(r'<h1[^>]*>(.*?)</h1>', s_en, re.S).group(1))
                    title = re.sub(r'^Private Transfer to ', '', bc)
                    fn = f'{slug}.jpg'
                else:
                    title = text_of((h or re.search(r'<h1[^>]*>(.*?)</h1>', s_en, re.S)).group(1))
                    fn = f'{slug}.jpg' if lang == '' else f'{slug}-{lang[:-1]}.jpg'
                out = 'assets/og/' + fn
                if not os.path.exists(out) or '--force' in sys.argv:
                    make(photo, title, out); count += 1
                if lang in ('hr/', 'it/'):
                    # generated from English: swap the URL literally in the build output
                    if sec not in ROUTE_NEUTRAL:
                        jsr[lang[:-1]][BASE + f'{slug}.jpg' + VER] = BASE + fn + VER
                    continue
                set_og(f, BASE + fn + VER)
    for l in ('hr', 'it'):
        body = '# generated by tools/make_og.py: per-language Open Graph image URLs\nT = {}\nJSR = {\n'
        for a, b in sorted(jsr[l].items()): body += f' {a!r}: {b!r},\n'
        open(f'tools/{l}/tr_zz_og.py', 'w', encoding='utf-8').write(body + '}\n')
    print('images made:', count)

if __name__ == '__main__':
    main()
