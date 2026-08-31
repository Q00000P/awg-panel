import { eq, sql } from 'drizzle-orm';

import { hooks } from './schema';
import type { HooksUpdateType } from './types';

import type { DBType } from '#db/sqlite';
import { DEFAULT_INTERFACE } from '#server/utils/types';

function createPreparedStatement(db: DBType) {
  return {
    get: db.query.hooks
      .findFirst({ where: eq(hooks.id, sql.placeholder('interface')) })
      .prepare(),
  };
}

export class HooksService {
  #db: DBType;
  #statements: ReturnType<typeof createPreparedStatement>;

  constructor(db: DBType) {
    this.#db = db;
    this.#statements = createPreparedStatement(db);
  }

  async get(name: string = DEFAULT_INTERFACE) {
    const hooks = await this.#statements.get.execute({ interface: name });
    if (!hooks) {
      throw new Error(`Hooks for ${name} not found`);
    }
    return hooks;
  }

  update(data: HooksUpdateType, name: string = DEFAULT_INTERFACE) {
    return this.#db
      .update(hooks)
      .set(data)
      .where(eq(hooks.id, name))
      .execute();
  }
}
