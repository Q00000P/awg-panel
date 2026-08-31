import { defineCommand } from 'citty';
import { consola } from 'consola';
import { eq } from 'drizzle-orm';
import isCidr from 'is-cidr';

import { db, schema } from '#cli/db';
import { DEFAULT_INTERFACE } from '#server/utils/types';

/**
 * Default NAT hooks for a new interface.
 *
 * {{name}} is substituted at config-render time, so the FORWARD rules apply
 * to this interface and not to wg0 (which is what the seeded wg0 hooks
 * hardcode).
 */
const POST_UP = [
  'iptables -t nat -A POSTROUTING -s {{ipv4Cidr}} -o {{device}} -j MASQUERADE;',
  'iptables -A INPUT -p udp -m udp --dport {{port}} -j ACCEPT;',
  'iptables -A FORWARD -i {{name}} -j ACCEPT;',
  'iptables -A FORWARD -o {{name}} -j ACCEPT;',
  'ip6tables -t nat -A POSTROUTING -s {{ipv6Cidr}} -o {{device}} -j MASQUERADE;',
  'ip6tables -A INPUT -p udp -m udp --dport {{port}} -j ACCEPT;',
  'ip6tables -A FORWARD -i {{name}} -j ACCEPT;',
  'ip6tables -A FORWARD -o {{name}} -j ACCEPT;',
].join(' ');

const POST_DOWN = POST_UP.replace(/ -A /g, ' -D ');

export default defineCommand({
  meta: {
    name: 'interface:create',
    description: 'Create an additional WireGuard/AmneziaWG interface',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Interface name, e.g. awg1',
      required: true,
    },
    port: {
      type: 'string',
      description: 'UDP port to listen on',
      required: true,
    },
    cidr: {
      type: 'string',
      description: 'IPv4 CIDR for clients, e.g. 10.9.0.0/24',
      required: true,
    },
    cidr6: {
      type: 'string',
      description: 'IPv6 CIDR for clients',
      default: 'fdcc:ad94:bacf:61a5::cafe:0/112',
    },
    device: {
      type: 'string',
      description: 'Uplink device for NAT (defaults to the one wg0 uses)',
      required: false,
    },
    host: {
      type: 'string',
      description: 'Public host clients connect to (defaults to wg0 host)',
      required: false,
    },
    mtu: {
      type: 'string',
      description: 'Interface MTU',
      default: '1420',
    },
  },
  async run(ctx) {
    const name = String(ctx.args.name);
    const port = Number(ctx.args.port);
    const mtu = Number(ctx.args.mtu);
    const ipv4Cidr = String(ctx.args.cidr);
    const ipv6Cidr = String(ctx.args.cidr6);

    if (!/^[a-z][a-z0-9_-]{0,14}$/.test(name)) {
      consola.error(
        'Name must be 1-15 chars: lowercase letters, digits, - or _, starting with a letter'
      );
      return;
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      consola.error('Port must be between 1 and 65535');
      return;
    }

    if (!isCidr(ipv4Cidr) || !isCidr(ipv6Cidr)) {
      consola.error('CIDR is not valid');
      return;
    }

    const existing = await db.query.wgInterface.findMany();

    if (existing.some((i) => i.name === name)) {
      consola.error(`Interface ${name} already exists`);
      return;
    }

    if (existing.some((i) => i.port === port)) {
      consola.error(`Port ${port} is already used by another interface`);
      return;
    }

    if (existing.some((i) => i.ipv4Cidr === ipv4Cidr)) {
      consola.error(`IPv4 CIDR ${ipv4Cidr} is already used`);
      return;
    }

    // Fall back to whatever the default interface uses, so a second
    // interface works out of the box on the same host.
    const base = existing.find((i) => i.name === DEFAULT_INTERFACE);
    const device = String(ctx.args.device || base?.device || 'eth0');

    const baseConfig = base
      ? await db.query.userConfig.findFirst({
          where: eq(schema.userConfig.id, base.name),
        })
      : undefined;

    const host = String(ctx.args.host || baseConfig?.host || '');

    await db.transaction(async (tx) => {
      await tx.insert(schema.wgInterface).values({
        name,
        device,
        port,
        // Keys and H1-H4 are generated on next startup, same as wg0
        privateKey: '---default---',
        publicKey: '---default---',
        ipv4Cidr,
        ipv6Cidr,
        mtu,
        enabled: true,
      });

      await tx.insert(schema.hooks).values({
        id: name,
        preUp: '',
        postUp: POST_UP,
        preDown: '',
        postDown: POST_DOWN,
      });

      await tx.insert(schema.userConfig).values({
        id: name,
        defaultMtu: mtu,
        defaultPersistentKeepalive:
          baseConfig?.defaultPersistentKeepalive ?? '0',
        defaultDns: baseConfig?.defaultDns ?? ['1.1.1.1'],
        defaultAllowedIps: baseConfig?.defaultAllowedIps ?? ['0.0.0.0/0', '::/0'],
        host,
        port,
      });
    });

    consola.success(`Interface ${name} created on port ${port} (${ipv4Cidr})`);
    consola.info('Restart the panel to bring it up.');
  },
});
