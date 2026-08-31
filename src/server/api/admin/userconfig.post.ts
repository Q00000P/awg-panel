import { readValidatedBody } from 'h3';

import Database from '#server/utils/Database';
import WireGuard from '#server/utils/WireGuard';
import {
  definePermissionEventHandler,
  getInterfaceParam,
} from '#server/utils/handler';
import { validateZod } from '#server/utils/types';
import { UserConfigUpdateSchema } from '#db/repositories/userConfig/types';

export default definePermissionEventHandler(
  'admin',
  'any',
  async ({ event }) => {
    const data = await readValidatedBody(
      event,
      validateZod(UserConfigUpdateSchema, event)
    );
    await Database.userConfigs.update(data, getInterfaceParam(event));
    await WireGuard.saveConfig();
    return { success: true };
  }
);
