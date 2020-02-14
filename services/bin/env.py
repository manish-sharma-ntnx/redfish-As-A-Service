import sys
import glob
import os

_PYLIBS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../lib/py"))

egg_globs = ["%s/*.egg" % _PYLIBS_PATH]
eggs = []
for egg_glob in egg_globs:
  eggs += glob.glob(egg_glob)
sys.path = list(reversed(sorted(eggs))) + sys.path
