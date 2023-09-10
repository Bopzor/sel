import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as shared from '@sel/shared';

import { AppState } from '../store/types';

import { requestsFetched } from './use-cases/fetch-requests/fetch-requests';

const requestsAdapter = createEntityAdapter<shared.Request>();

export const requestsSlice = createSlice({
  name: 'requests',
  initialState: requestsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(requestsFetched, requestsAdapter.addMany.bind(requestsAdapter));
  },
});

export const { selectAll: selectRequests } = requestsAdapter.getSelectors(
  (state: AppState) => state.requests
);
