import { defineCommand } from 'citty';
import { consola } from 'consola';
import { eq } from 'drizzle-orm';

import { db, schema } from '#cli/db';
import { wg } from '#server/utils/wgHelper';
import { encodeQRCodeTerm } from '#server/utils/qr';

export default defineCommand({
  meta: {
    name: 'clients:qr',
    description: 'Generate QR code for a client',
  },
  args: {
    id: {
      required: true,
      type: 'positional',
    },
    ipv6: {
      required: false,
      type: 'boolean',
      default: true,
    },
  },
  async run(ctx) {
    const clientId = Number(ctx.args.id);
    const enableIpv6 = ctx.args.ipv6;

    if (Number.isNaN(clientId)) {
      consola.error('Invalid client ID');
      return;
    }

    consola.info('Generating QR code for client...');

    const client = await db.query.client.findFirst({
      where: eq(schema.client.id, clientId),
    });
    if (!client) {
      consola.error(`Client with ID ${clientId} not found`);
      return;
    }

    // Interface and config come from whichever interface this client is on
    const wgInterface = await db.query.wgInterface.findFirst({
      where: eq(schema.wgInterface.name, client.interfaceId),
    });
    if (!wgInterface) {
      consola.error('WireGuard interface not found');
      return;
    }

    const userConfig = await db.query.userConfig.findFirst({
      where: eq(schema.userConfig.id, client.interfaceId),
    });
    if (!userConfig) {
      consola.error('User config not found');
      return;
    }

    const clientConfig = wg.generateClientConfig(
      wgInterface,
      userConfig,
      client,
      {
        enableIpv6,
      }
    );

    consola.log(encodeQRCodeTerm(clientConfig));
  },
});
