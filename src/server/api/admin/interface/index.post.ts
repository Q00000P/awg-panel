import { createError, readValidatedBody } from 'h3';

import Database from '#server/utils/Database';
import WireGuard from '#server/utils/WireGuard';
import { WG_ENV } from '#server/utils/config';
import { firewall } from '#server/utils/firewall';
import {
  definePermissionEventHandler,
  getInterfaceParam,
} from '#server/utils/handler';
import { validateZod } from '#server/utils/types';
import { InterfaceUpdateSchema } from '#db/repositories/interface/types';

export default definePermissionEventHandler(
  'admin',
  'any',
  async ({ event }) => {
    const data = await readValidatedBody(
      event,
      validateZod(InterfaceUpdateSchema, event)
    );

    // If enabling firewall, check if iptables is available
    if (data.firewallEnabled) {
      // Clear cache to force fresh check
      firewall.clearAvailabilityCache();

      const iptablesAvailable = await firewall.isAvailable(
        !WG_ENV.DISABLE_IPV6
      );
      if (!iptablesAvailable) {
        const requiredTools = WG_ENV.DISABLE_IPV6
          ? 'iptables'
          : 'iptables and ip6tables';
        throw createError({
          statusCode: 400,
          statusMessage: `Per-Client Firewall requires ${requiredTools} to be installed on the host system. Please install ${requiredTools} before enabling this feature.`,
        });
      }
    }

    const name = getInterfaceParam(event);
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
    await WireGuard.saveConfig();
    return { success: true };
  }
);
