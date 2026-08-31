import Database from '#server/utils/Database';
import {
  definePermissionEventHandler,
  getInterfaceParam,
} from '#server/utils/handler';

export default definePermissionEventHandler(
  'admin',
  'any',
  async ({ event }) => {
    return Database.hooks.get(getInterfaceParam(event));
  }
);
