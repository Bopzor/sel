import { beforeEach } from 'vitest';
import { generateVAPIDKeys } from 'web-push';

import { Config } from './infrastructure/config';
import { container } from './infrastructure/container';
import { TestErrorReporter } from './infrastructure/error-reporter';
import { NoopLogger } from './infrastructure/logger';
import { TOKENS } from './tokens';

const databaseUrl = process.env.DATABASE_URL ?? 'postgres://postgres@localhost:5432/test';
const vapidKeys = generateVAPIDKeys();

const config: Config = {
  server: { host: '', port: 0 },
  files: { uploadDir: '' },
  session: { secret: '', secure: false },
  app: { baseUrl: 'http://localhost' },
  database: { url: databaseUrl, debug: false },
  email: { host: '', port: 0, secure: false, sender: '', password: '' },
  push: { subject: 'mailto:', ...vapidKeys },
  slack: { webhookUrl: '' },
};

container.bindValue(TOKENS.config, config);

beforeEach(() => {
  container.bindValue(TOKENS.config, config);
  container.bindValue(TOKENS.logger, new NoopLogger());
  container.bindValue(TOKENS.errorReporter, new TestErrorReporter());
});
