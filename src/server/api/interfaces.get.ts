import Database from '#server/utils/Database';
import { definePermissionEventHandler } from '#server/utils/handler';

/**
 * Interfaces available for client creation.
 * Only the fields the UI needs — no keys, no obfuscation parameters.
 */
export default definePermissionEventHandler('clients', 'view', async () => {
  const interfaces = await Database.interfaces.getAll();
  return interfaces.map((i) => ({
    name: i.name,
    port: i.port,
    enabled: i.enabled,
    isAwg31: !!i.headerProtectionKey,
  }));
});
