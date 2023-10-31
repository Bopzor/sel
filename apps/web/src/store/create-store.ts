import { Middleware, configureStore } from '@reduxjs/toolkit';

import { authenticationSlice } from '../authentication/authentication.slice';
import { Dependencies } from '../dependencies';
import { membersSlice } from '../members/members.slice';
import { requestsSlice } from '../requests/requests.slice';

export const createStore = (deps: Dependencies, middlewares: Middleware[] = []) => {
  return configureStore({
    reducer: {
      [authenticationSlice.name]: authenticationSlice.reducer,
      [requestsSlice.name]: requestsSlice.reducer,
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
