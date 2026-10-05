import sys, os, glob, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trtool as t
T = {}
for name in ['tr_a', 'tr_b', 'tr_c', 'tr_d', 'tr_e']:
    try: T.update(importlib.import_module(name).T)
    except ModuleNotFoundError: pass
PAGES = sys.argv[1:] or open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages.txt")).read().split()
exists_hr = set(PAGES) | {p for p in ['index.html'] }
bad = 0
for p in PAGES:
    if p.startswith('partials/'):
        miss = t.build(p, p.replace('.html', '.hr.html'), T, exists_hr, prefix_depth=False)
        s = open(p.replace('.html', '.hr.html'), encoding='utf-8').read().replace('href="day-trips.html"', 'href="../day-trips.html"')
        open(p.replace('.html', '.hr.html'), 'w', encoding='utf-8').write(s)
    else:
        miss = t.build(p, 'hr/' + p, T, exists_hr)
    if miss:
        bad += 1; print('MISSING in', p); [print('  ', repr(m)) for m in miss]
print('done, pages with missing:', bad)
