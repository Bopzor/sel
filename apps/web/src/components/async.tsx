import { JSX, Match, Switch } from 'solid-js';

import { QueryResult } from '../utils/query';

import { Loader } from './loader';

type AsyncProps<T> = {
  query: QueryResult<T>;
  fallback?: JSX.Element;
  children: (data: T) => JSX.Element;
};

export function Async<T>(props: AsyncProps<T>) {
  return (
    <Switch fallback="fallback">
      <Match when={props.query.isPending}>{props.fallback ?? <Loader />}</Match>
      <Match when={props.query.isSuccess}>{props.children(props.query.data as T)}</Match>
      <Match when={props.query.isError}>error</Match>
    </Switch>
  );
}
