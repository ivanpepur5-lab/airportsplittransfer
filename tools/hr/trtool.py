import re, html, json, os, sys
BASE = "https://airportsplittransfer.com/"
SKIP_BLOCKS = re.compile(r'(<script(?![^>]*application/ld\+json)[^>]*>.*?</script>|<style[^>]*>.*?</style>|<svg.*?</svg>|<!--.*?-->)', re.S)
ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'data-label']
def norm(t):
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()
def is_text(t):
    n = norm(t)
    return bool(n) and re.search(r'[A-Za-zÀ-ž]', n) and not re.fullmatch(r'[\w.\-]+@[\w.\-]+|\+?[\d\s]+|https?://\S+|\{\{.*\}\}', n)

def segments(s):
    """yield (kind, start, end, text) for translatable spans in s"""
    out = []
    masked = SKIP_BLOCKS.sub(lambda m: '\x00' * len(m.group(0)), s)
    # text nodes (not inside masked areas, not inside ld+json)
    ld_spans = [(m.start(), m.end()) for m in re.finditer(r'<script type="application/ld\+json">.*?</script>', s, re.S)]
    inld = lambda i: any(a <= i < b for a, b in ld_spans)
    body_start = s.find('<body')
    for m in re.finditer(r'[>\x00]([^<>\x00]+)(?=[<\x00])', masked):
        if inld(m.start(1)): continue
        t = s[m.start(1):m.end(1)]
        if is_text(t):
            # skip <title> handled same way; head text only title
            out.append(('text', m.start(1), m.end(1), t))
    # attributes
    for m in re.finditer(r'<(?!script|style)[a-zA-Z][^>]*>', masked):
        tag = s[m.start():m.end()]
        for a in ATTRS:
            for am in re.finditer(r'\s' + a + r'="([^"]*)"', tag):
                if is_text(am.group(1)):
                    out.append(('attr', m.start() + am.start(1), m.start() + am.end(1), am.group(1)))
        if tag.startswith('<meta') and re.search(r'(name|property)="(description|og:title|og:description|twitter:title|twitter:description)"', tag):
            cm = re.search(r'\scontent="([^"]*)"', tag)
            if cm and is_text(cm.group(1)):
                out.append(('attr', m.start() + cm.start(1), m.start() + cm.end(1), cm.group(1)))
    # json-ld strings
    for a, b in ld_spans:
        blk = s[a:b]
        js = blk[blk.index('>') + 1: blk.rindex('<')]
        try: data = json.loads(js)
        except Exception: continue
        out.append(('ld', a, b, data))
    return sorted(out, key=lambda x: x[1])

LD_KEYS = {'name', 'text', 'description', 'headline', 'serviceType', 'areaServed', 'priceRange', 'alternateName', 'reviewBody', 'about', 'category'}
def ld_strings(data, acc):
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, str) and k in LD_KEYS and is_text(v): acc.append(v)
            else: ld_strings(v, acc)
    elif isinstance(data, list):
        for v in data: ld_strings(v, acc)
    return acc

def extract(path):
    s = open(path, encoding='utf-8').read()
    res = []
    for kind, a, b, t in segments(s):
        if kind == 'ld': res += [norm(x) for x in ld_strings(t, [])]
        else: res.append(norm(t))
    return res

if __name__ == '__main__':
    seen = []; ss = set()
    for p in sys.argv[1:]:
        for t in extract(p):
            if t not in ss: ss.add(t); seen.append(t)
    print(len(seen), 'unique segments,', sum(len(t.split()) for t in seen), 'words')

URL_ATTRS = ['href', 'src', 'srcset', 'action', 'data-base', 'poster']
def is_rel(u):
    return u and not re.match(r'(https?:|//|/|#|mailto:|tel:|data:|javascript:|\?|\{)', u)

def prefix_paths(s, depth_prefix='../', en_dir='', exists_hr=()):
    hr_dir = os.path.join('hr', en_dir) if en_dir else 'hr'
    def remap(val):
        m = re.match(r'([^?#]*)(.*)', val); f, rest = m.group(1), m.group(2)
        target = os.path.normpath(os.path.join(en_dir, f or '.'))
        if f.endswith('.html') and target in exists_hr: return val
        new = os.path.relpath(target, hr_dir)
        if not f or f.endswith('/'): new += '/'
        return new + rest
    def fix_attr(m):
        attr, val = m.group(1), m.group(2)
        if attr == 'srcset':
            parts = [p.strip() for p in val.split(',')]
            out = []
            for p in parts:
                u, _, d = p.partition(' ')
                out.append((remap(u) + (' ' + d if d else '')) if is_rel(u) else p)
            return f' {attr}="{", ".join(out)}"'
        if attr == 'data-base':
            return f' {attr}="{remap(val)}"'
        return f' {attr}="{remap(val) if is_rel(val) else val}"'
    return re.sub(r'\s(' + '|'.join(URL_ATTRS) + r')="([^"]*)"', fix_attr, s)

def hr_url(u, exists_hr):
    # absolute site URL -> hr URL when that page exists in hr
    if not u.startswith(BASE): return u
    path = u[len(BASE):]
    if re.match(r'(assets|css|js|de/|sv/|no/|hr/)', path) or re.search(r'\.(jpg|png|webp|avif|svg|ico)(\?|$)', path): return u
    key = (path.split('?')[0].split('#')[0] or 'index') 
    key = key.rstrip('/') or 'index'
    if key + '.html' in exists_hr or path == '':
        return BASE + 'hr/' + path
    return u

def translate_ld(data, T, missing, exists_hr):
    if isinstance(data, dict):
        out = {}
        for k, v in data.items():
            if isinstance(v, str):
                if k in LD_KEYS and is_text(v):
                    n = norm(v)
                    if n in T: v = T[n]
                    else: missing.append(n)
                elif k in ('url', 'item', '@id'):
                    v = hr_url(v, exists_hr)
                out[k] = v
            else:
                out[k] = translate_ld(v, T, missing, exists_hr)
        if out.get('@type') == 'WebPage' or 'inLanguage' in out: out['inLanguage'] = 'hr'
        return out
    if isinstance(data, list): return [translate_ld(v, T, missing, exists_hr) for v in data]
    return data

def build(en_path, out_path, T, exists_hr, prefix_depth=True):
    s = open(en_path, encoding='utf-8').read()
    missing = []
    segs = segments(s)
    for kind, a, b, t in reversed(segs):
        if kind == 'ld':
            blk = s[a:b]; js = blk[blk.index('>') + 1: blk.rindex('<')]
            new = translate_ld(json.loads(js), T, missing, exists_hr)
            s = s[:a] + '<script type="application/ld+json">' + json.dumps(new, ensure_ascii=False) + '</script>' + s[b:]
            continue
        n = norm(t)
        if n not in T: missing.append(n); continue
        rep = T[n]
        lead = re.match(r'\s*', t).group(0); trail = re.search(r'\s*$', t).group(0)
        if rep[:1] in '.,;:!?': lead = ''
        rep = html.escape(rep, quote=(kind == 'attr'))
        s = s[:a] + lead + rep + trail + s[b:]
    s = s.replace('<html lang="en">', '<html lang="hr">', 1)
    s = re.sub(r'<meta property="og:locale" content="[^"]*">', '<meta property="og:locale" content="hr_HR">', s)
    s = re.sub(r'(name="lang" value=")en(")', r'\1hr\2', s)
    for attr in ['canonical']:
        s = re.sub(r'(<link rel="canonical" href=")([^"]+)(")', lambda m: m.group(1) + hr_url(m.group(2), exists_hr) + m.group(3), s)
    s = re.sub(r'(<meta property="og:url" content=")([^"]+)(")', lambda m: m.group(1) + hr_url(m.group(2), exists_hr) + m.group(3), s)
    if prefix_depth: s = prefix_paths(s, en_dir=os.path.dirname(en_path), exists_hr=exists_hr)
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)
    open(out_path, 'w', encoding='utf-8').write(s)
    return sorted(set(missing))

def dump(paths, out):
    seen = []; ss = set()
    with open(out, 'w', encoding='utf-8') as f:
        for p in paths:
            f.write(f'\n# ===== {p}\n')
            for t in extract(p):
                if t not in ss:
                    ss.add(t); seen.append(t); f.write(json.dumps(t, ensure_ascii=False) + '\n')
    return seen
