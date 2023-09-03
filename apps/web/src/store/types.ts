import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { Dependencies } from '../dependencies';

import { createStore } from './create-store';

export type AppStore = ReturnType<typeof createStore>;

export type AppGetState = AppStore['getState'];
export type AppDispatch = AppStore['dispatch'];

export type AppState = ReturnType<AppGetState>;

export type AppThunk<ReturnType> = ThunkAction<ReturnType, AppState, Dependencies, AnyAction>;

export type AppSelector<Params extends unknown[], Result> = (state: AppState, ...params: Params) => Result;
