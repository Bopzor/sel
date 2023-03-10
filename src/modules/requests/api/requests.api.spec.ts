import { afterEach, beforeEach } from 'vitest';

import { ControllerTest } from '../../../common/controller-test';
import { TOKENS } from '../../../tokens';
import { createGetRequestResult } from '../use-cases/get-request/get-request-result';

import { router } from './requests.api';

describe('requests api', () => {
  let test: ControllerTest;

  beforeEach(async () => {
    test = new ControllerTest(router);
    await test.init();
  });

  afterEach(() => test?.cleanup());

  it('retrieves the list of requests', async () => {
    test.overrideQueryHandler(TOKENS.listRequestsHandler, () => {
      return [createGetRequestResult({ id: 'requestId' })];
    });

    const response = await test.fetch('/');

    expect(await response.json()).toEqual([expect.objectContaining({ id: 'requestId' })]);
  });

  it('retrieves the subset of requests matching a search query', async () => {
    const handle = vi.fn().mockResolvedValue([]);

    test.overrideQueryHandler(TOKENS.listRequestsHandler, handle);

    await test.fetch('/?search=toto');

    expect(handle).toHaveBeenCalledWith({ search: 'toto' });
  });

  it('retrieves a single request', async () => {
    test.overrideQueryHandler(TOKENS.getRequestHandler, () => {
      return createGetRequestResult({ id: 'requestId' });
    });

    const response = await test.fetch('/requestId');

    expect(await response.json()).toEqual(expect.objectContaining({ id: 'requestId' }));
  });

  it('returns a 404 status code when the request does not exist', async () => {
    const response = await test.fetch('/requestId');

    expect(response.status).toEqual(404);
  });
});
