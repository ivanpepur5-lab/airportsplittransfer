import sys, os, glob, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trtool as t
T = {}
JSR = {}  # literal replacements inside inline scripts (strings the segment tool skips)
for name in sorted(f[:-3] for f in os.listdir(os.path.dirname(os.path.abspath(__file__))) if f.startswith('tr_') and f.endswith('.py')):
    mod = importlib.import_module(name)
    T.update(mod.T)
    JSR.update(getattr(mod, 'JSR', {}))
PAGES = sys.argv[1:] or open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages.txt")).read().split()
exists_hr = set(PAGES) | {p for p in ['index.html'] }
bad = 0
for p in PAGES:
    if p.startswith('partials/'):
        miss = t.build(p, p.replace('.html', '.hr.html'), T, exists_hr, prefix_depth=False)
        s = open(p.replace('.html', '.hr.html'), encoding='utf-8').read()
        if 'day-trips.html' not in PAGES: s = s.replace('href="day-trips.html"', 'href="../day-trips.html"')
        open(p.replace('.html', '.hr.html'), 'w', encoding='utf-8').write(s)
    else:
        miss = t.build(p, 'hr/' + p, T, exists_hr)
        out = 'hr/' + p
        js = open(out, encoding='utf-8').read()
        for a, b in JSR.items(): js = js.replace(a, b)
        open(out, 'w', encoding='utf-8').write(js)
    if miss:
        bad += 1; print('MISSING in', p); [print('  ', repr(m)) for m in miss]
print('done, pages with missing:', bad)
