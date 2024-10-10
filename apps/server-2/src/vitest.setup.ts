import { beforeEach } from 'vitest';

import { container } from './infrastructure/container';
import { TestErrorReporter } from './infrastructure/error-reporter';
import { NoopLogger } from './infrastructure/logger';
import { TOKENS } from './tokens';

beforeEach(() => {
  container.bindValue(TOKENS.logger, new NoopLogger());
  container.bindValue(TOKENS.errorReporter, new TestErrorReporter());
});
