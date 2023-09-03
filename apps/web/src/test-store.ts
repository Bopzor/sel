import { Middleware } from '@reduxjs/toolkit';

import { Dependencies } from './dependencies';
import { StubMembersGateway } from './members/stub-members.gateway';
import { createStore } from './store/create-store';
import { AppSelector } from './store/types';

export class TestStore implements Dependencies {
  public debug = false;

  private logActionMiddleware: Middleware = () => {
    return (next) => (action) => {
      if (this.debug) {
        console.log(action);
      }

      return next(action);
    };
  };

  public membersGateway = new StubMembersGateway();

  private store = createStore(this, [this.logActionMiddleware]);

  getState = this.store.getState.bind(this.store);
  dispatch = this.store.dispatch.bind(this.store);

  select = <Params extends unknown[], Result>(
    selector: AppSelector<Params, Result>,
    ...params: Params
  ): Result => {
    return selector(this.getState(), ...params);
  };
}
