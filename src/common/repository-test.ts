import { MikroORM } from '@mikro-orm/core';

import mikroOrmConfig from '../api/persistence/mikro-orm.config';
import { OrmType } from '../api/persistence/types';

export interface RepositoryTest {
  arrange?(): Promise<void>;
}

export class RepositoryTest {
  protected orm!: OrmType;

  async setup() {
    this.orm = await MikroORM.init({
      ...mikroOrmConfig,
      dbName: 'integration-test',
      allowGlobalContext: true,
    });

    this.orm.config.getLogger().setDebugMode(false);

    const schemaGenerator = this.orm.getSchemaGenerator();

    await schemaGenerator.refreshDatabase();
    await schemaGenerator.clearDatabase();

    await this.arrange?.();
  }

  async cleanup() {
    await this.orm?.close(true);
  }
}
