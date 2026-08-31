import { defineCommand } from 'citty';
import { consola } from 'consola';

import { db } from '#cli/db';

export default defineCommand({
  meta: {
    name: 'interface:list',
    description: 'List configured interfaces',
  },
  async run() {
    const interfaces = await db.query.wgInterface.findMany();
    const clients = await db.query.client.findMany();

    if (interfaces.length === 0) {
      consola.info('No interfaces configured');
      return;
    }

    for (const i of interfaces) {
      const count = clients.filter((c) => c.interfaceId === i.name).length;
      const version = i.headerProtectionKey ? 'AWG 3.1' : 'AWG 2.0';
      consola.log(
        `${i.name}\tport ${i.port}\t${i.ipv4Cidr}\t${version}\t${count} client(s)\t${
          i.enabled ? 'enabled' : 'disabled'
        }`
      );
    }
  },
});
