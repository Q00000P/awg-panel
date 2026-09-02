#!/usr/bin/env python3
# Патч 5 к awg-panel.sh: HSchema = z.string() + границы H_MIN..H_MAX.
# Строки в пределах int32 — панель сама генерит в таком же диапазоне.
import pathlib, sys

p = pathlib.Path("awg-panel.sh")
if not p.exists():
    sys.exit("awg-panel.sh не найден в текущем каталоге")
s = p.read_text()

old = '''    _h.add(rnd(5, 4294967295))
hdr = list(_h)'''
new = '''    _h.add(rnd(5, 2147483647))
hdr = [str(x) for x in _h]   # HSchema: z.string(), 1-4 зарезервированы'''
assert s.count(old) == 1, "якорь hdr не найден — патчи 2-3 применены?"
s = s.replace(old, new, 1)

p.write_text(s)
print("патч 5 применён")
