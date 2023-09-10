import { Component, For, createEffect } from 'solid-js';

import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectRequests } from './requests.slice';
import { fetchRequests } from './use-cases/fetch-requests/fetch-requests';

export const RequestsPage: Component = () => {
  const requests = selector(selectRequests);

  createEffect(() => {
    void store.dispatch(fetchRequests());
  });

  return <For each={requests()}>{(request) => <>{request.id}</>}</For>;
};
