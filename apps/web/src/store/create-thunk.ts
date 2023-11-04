import { createAsyncThunk as createAsyncThunkRTK } from '@reduxjs/toolkit';

import { Dependencies } from '../dependencies';

import { selectIsFulfilled, selectIsPending, selectIsRejected } from './async-thunk-lifecycle';
import { AppGetState, AppDispatch, AppThunk, AppState } from './types';

type ThunkApi = {
  getState: AppGetState;
  dispatch: AppDispatch;
};

type ThunkFunction<Params extends unknown[], Result> = (
  api: ThunkApi & Dependencies,
  ...params: Params
) => Result;

export function createThunk<Params extends unknown[] = [], Result = void>(
  thunk: ThunkFunction<Params, Result>
) {
  return (...params: Params): AppThunk<Result> => {
    return (dispatch, getState, dependencies) => {
      return thunk({ dispatch, getState, ...dependencies }, ...params);
    };
  };
}

type ThunkApiConfig = {
  dispatch: AppDispatch;
  state: AppState;
  extra: Dependencies;
};

export const createAsyncThunk = <Params extends unknown[], Result>(
  identifier: string,
  fn: (deps: ThunkApi & Dependencies, ...params: Params) => Promise<Result>
) => {
  const asyncThunk = createAsyncThunkRTK<Result, Params, ThunkApiConfig>(identifier, (params, thunkApi) => {
    return fn({ ...thunkApi, ...thunkApi.extra }, ...params);
  });

  return Object.assign(
    (...params: Params) => {
      return asyncThunk(params);
    },
    {
      ...asyncThunk,
      selectIsPending: (state: AppState, ...params: Params) => {
        return selectIsPending(state, identifier, ...params);
      },
      selectIsFulfilled: (state: AppState, ...params: Params) => {
        return selectIsFulfilled(state, identifier, ...params);
      },
      selectIsRejected: (state: AppState, ...params: Params) => {
        return selectIsRejected(state, identifier, ...params);
      },
    }
  );
};
