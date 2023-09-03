import { Dependencies } from '../dependencies';

import { AppGetState, AppDispatch, AppThunk } from './types';

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
