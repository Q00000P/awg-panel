import { sql, relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { hooks } from '../hooks/schema';
import { userConfig } from '../userConfig/schema';

// maybe support multiple interfaces in the future
export const wgInterface = sqliteTable('interfaces_table', {
  name: text().primaryKey(),
  device: text().notNull(),
  port: int().notNull().unique(),
  privateKey: text('private_key').notNull(),
  publicKey: text('public_key').notNull(),
  ipv4Cidr: text('ipv4_cidr').notNull(),
  ipv6Cidr: text('ipv6_cidr').notNull(),
  mtu: int().notNull(),
  routingTable: text('routing_table').notNull().default('auto'),
  jC: int('j_c').default(7),
  jMin: int('j_min').default(10),
  jMax: int('j_max').default(1000),
  s1: int().default(128),
  s2: int().default(56),
  s3: int(),
  s4: int(),
  h1: text(),
  h2: text(),
  h3: text(),
  h4: text(),
  i1: text(),
  i2: text(),
  i3: text(),
  i4: text(),
  i5: text(),
  // --- AmneziaWG 3.1 ---
  // Server-side: must match on both ends. null = 2.0 mode.
  // 'auto' at startup = generate once via `awg genkey`.
  headerProtectionKey: text('header_protection_key'),
  // Client-side ranges "min-max"; rendered on both ends like Amnezia does.
  contentPaddingAddition: text('content_padding_addition'),
  rekeyAfterTime: text('rekey_after_time'),
  rekeyTimeout: text('rekey_timeout'),
  rejectAfterTime: text('reject_after_time'),
  keepaliveTimeout: text('keepalive_timeout'),
  maxHandshakeAttempts: text('max_handshake_attempts'),
  // Must match on both ends: receiver drops trailered handshakes otherwise.
  randomTrailers: int('random_trailers', { mode: 'boolean' })
    .notNull()
    .default(false),
  // Server-only, only under load. Kills cookie-reply AND per-IP rate limiter.
  disableCookies: int('disable_cookies', { mode: 'boolean' })
    .notNull()
    .default(false),
  // does nothing yet
  enabled: int({ mode: 'boolean' }).notNull(),
  // Enable per-client firewall filtering via iptables
  firewallEnabled: int('firewall_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const wgInterfaceRelations = relations(wgInterface, ({ one }) => ({
  hooks: one(hooks, {
    fields: [wgInterface.name],
    references: [hooks.id],
  }),
  userConfig: one(userConfig, {
    fields: [wgInterface.name],
    references: [userConfig.id],
  }),
}));
