import { Middleware, configureStore } from '@reduxjs/toolkit';

import { Dependencies } from '../dependencies';
import { membersSlice } from '../members/members.slice';

export const createStore = (deps: Dependencies, middlewares: Middleware[] = []) => {
  return configureStore({
    reducer: {
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
