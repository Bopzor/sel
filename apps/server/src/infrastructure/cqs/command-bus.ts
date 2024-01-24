import { injectableClass } from 'ditox';

import { Database } from '../../persistence/database';
import { TOKENS } from '../../tokens';

import { Bus } from './bus';

export class CommandBus extends Bus {
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {
    super();
  }

  init() {
    this.before((next) => this.database.createTransaction(next));
  }
}
