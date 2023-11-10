import { Middleware, configureStore } from '@reduxjs/toolkit';

import { authenticationSlice } from '../authentication/authentication.slice';
import { Dependencies } from '../dependencies';
import { membersSlice } from '../members/members.slice';

import { asyncThunkLifecycleSlice } from './async-thunk-lifecycle';

export const createStore = (deps: Dependencies, middlewares: Middleware[] = []) => {
  return configureStore({
    reducer: {
      [asyncThunkLifecycleSlice.name]: asyncThunkLifecycleSlice.reducer,
      [authenticationSlice.name]: authenticationSlice.reducer,
      [membersSlice.name]: membersSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        thunk: {
          extraArgument: deps,
        },
      }).concat(middlewares);
    },
  });
};
