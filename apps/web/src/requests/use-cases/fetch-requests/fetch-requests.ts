import { createAction } from '@reduxjs/toolkit';
import * as shared from '@sel/shared';

import { createThunk } from '../../../store/create-thunk';

export const fetchRequests = createThunk(async ({ dispatch, requestsGateway }) => {
  const requests = await requestsGateway.listRequests();

  dispatch(requestsFetched(requests));
});

export const requestsFetched = createAction('requests/fetched', (request: shared.Request[]) => ({
  payload: request,
}));
