import { beforeEach, describe, expect, it } from 'vitest';

import { container } from './container';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { Server } from './server';
import { TOKENS } from './tokens';

describe('Server E2E', () => {
  let config: StubConfigAdapter;

  beforeEach(() => {
    config = new StubConfigAdapter({
      server: { host: 'localhost', port: 3030 },
      database: { url: 'postgres://postgres@localhost:5432/test' },
    });

    container.bindValue(TOKENS.config, config);
  });

  it('starts a HTTP server', async () => {
    const server = new Server(container, config);

    await server.start();

    const response = await fetch('http://localhost:3030/members');
    expect(response.status).toEqual(200);

    await server.close();
  });

  it('handles zod errors', async () => {
    const server = new Server(container, config);

    await server.start();

    const response = await fetch('http://localhost:3030/members?sort=invalid');

    expect(response.status).toEqual(400);

    expect(await response.json()).toEqual({
      _errors: [],
      sort: {
        _errors: [expect.any(String)],
      },
    });

    await server.close();
  });
});
