import {
  AnyAction,
  SerializedError,
  createSelector,
  createSlice,
  isAsyncThunkAction,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import { dequal } from 'dequal';

import { AppState } from './types';

const getAsyncThunkActionIdentifier = (action: AnyAction) => {
  return action.type.replace(/\/(pending|fulfilled|rejected)$/, '');
};

type AsyncThunkLifecycleActionPending = {
  status: 'pending';
  params: unknown;
};

type AsyncThunkLifecycleActionFulfilled = {
  status: 'fulfilled';
  params: unknown;
  result: unknown;
};

type AsyncThunkLifecycleActionRejected = {
  status: 'rejected';
  params: unknown;
  error: SerializedError;
};

type AsyncThunkLifecycleAction =
  | AsyncThunkLifecycleActionPending
  | AsyncThunkLifecycleActionFulfilled
  | AsyncThunkLifecycleActionRejected;

type AsyncThunkLifecycleSlice = Record<string, AsyncThunkLifecycleAction[]>;

export const asyncThunkLifecycleSlice = createSlice({
  name: 'asyncThunkLifecycle',
  initialState: {} as AsyncThunkLifecycleSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addMatcher(isAsyncThunkAction, (state, action) => {
      const identifier = getAsyncThunkActionIdentifier(action);

      if (!state[identifier]) {
        state[identifier] = [];
      }

      const actions = state[identifier];
      const params = action.meta.arg;

      if (isPending(action)) {
        actions.push({
          status: 'pending',
          params,
        });
      }

      if (isFulfilled(action)) {
        actions.push({
          status: 'fulfilled',
          params,
          result: action.payload,
        });
      }

      if (isRejected(action)) {
        actions.push({
          status: 'rejected',
          params,
          error: action.error,
        });
      }
    });
  },
});

const selectLifecycleSlice = (state: AppState) => {
  return state.asyncThunkLifecycle;
};

const selectLifecycleActions = createSelector(
  selectLifecycleSlice,
  (state: AppState, identifier: string, ..._params: unknown[]) => identifier,
  (state: AppState, identifier: string, ...params: unknown[]) => params,
  (slice, identifier, params) => {
    return slice?.[identifier]?.filter((action) => dequal(action.params, params));
  }
);

const selectLastLifecycleAction = createSelector(selectLifecycleActions, (actions) => {
  if (actions) {
    return actions[actions.length - 1];
  }
});

const selectLastLifecycleActionStatus = createSelector(selectLastLifecycleAction, (action) => {
  return action?.status;
});

export const selectIsPending = createSelector(selectLastLifecycleActionStatus, (status) => {
  return status === 'pending';
});

export const selectIsFulfilled = createSelector(selectLastLifecycleActionStatus, (status) => {
  return status === 'fulfilled';
});

export const selectIsRejected = createSelector(selectLastLifecycleActionStatus, (status) => {
  return status === 'rejected';
});
