#!/usr/bin/env python3
# Патч панели awg-panel (форк wg-easy v15). Запускать из корня репо:
#   python3 patch-panel-userconfig-sync.py
#
# POST /api/admin/interface сохраняет junk/CPS только в интерфейс, а клиентские
# конфиги собираются из userconfig (defaultJC/defaultJMin/defaultJMax/defaultI1-I5).
# Зеркалим при каждом сохранении — тогда и скрипт, и правка в UI доезжают до клиентов.
import pathlib, sys

p = pathlib.Path("src/server/api/admin/interface/index.post.ts")
if not p.exists():
    sys.exit(f"{p} не найден — запускай из корня репозитория")
s = p.read_text()

old = '''    await Database.interfaces.update(data, getInterfaceParam(event));
    await WireGuard.saveConfig();'''
new = '''    const name = getInterfaceParam(event);
    await Database.interfaces.update(data, name);
    // Клиентские конфиги собираются из userconfig, а не из интерфейса.
    // Без зеркалирования клиент получает дефолты wg-easy (Jmin/Jmax 10/1000,
    // пустые I1-I5), даже если интерфейс настроен.
    await Database.userConfigs.update(
      {
        defaultJC: data.jC,
        defaultJMin: data.jMin,
        defaultJMax: data.jMax,
        defaultI1: data.i1,
        defaultI2: data.i2,
        defaultI3: data.i3,
        defaultI4: data.i4,
        defaultI5: data.i5,
      },
      name
    );
    await WireGuard.saveConfig();'''
assert s.count(old) == 1, "якорь interfaces.update не найден"
s = s.replace(old, new, 1)

p.write_text(s)
print("index.post.ts пропатчен")
