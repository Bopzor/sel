import { ClassType } from '@sel/utils';

import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { StubDate } from './infrastructure/date/stub-date.adapter';
import { Database } from './infrastructure/persistence/database';
import { Persistor } from './persistor';

export class RepositoryTest {
  config = new StubConfigAdapter({
    database: {
      url: process.env.DATABASE_URL ?? 'postgres://postgres@localhost/test',
    },
  });

  database = new Database(this.config);

  dateAdapter = new StubDate();

  persist = new Persistor(this.database, this.dateAdapter);

  static async create<Test extends RepositoryTest>(TestClass: ClassType<Test>) {
    const test = new TestClass();

    await test.database.ensureTestDatabase();
    await test.database.migrate();
    await test.database.reset();

    await test.setup?.();

    return test;
  }

  setup?(): Promise<void>;
}
