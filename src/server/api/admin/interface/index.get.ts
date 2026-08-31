import Database from '#server/utils/Database';
import {
  definePermissionEventHandler,
  getInterfaceParam,
} from '#server/utils/handler';

export default definePermissionEventHandler(
  'admin',
  'any',
  async ({ event }) => {
    const wgInterface = await Database.interfaces.get(
      getInterfaceParam(event)
    );

    return {
      ...wgInterface,
      privateKey: undefined,
    };
  }
);
