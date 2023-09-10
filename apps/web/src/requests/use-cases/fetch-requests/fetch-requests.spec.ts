import { createRequest } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { TestStore } from '../../../test-store';
import { selectRequests } from '../../requests.slice';

import { fetchRequests } from './fetch-requests';

describe('fetchRequests', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it('fetches the list of requests', async () => {
    const request = createRequest();

    store.requestsGateway.requests = [request];

    await store.dispatch(fetchRequests());

    expect(store.select(selectRequests)).toEqual([request]);
  });
});
