import { debounce } from '@solid-primitives/scheduled';
import { UseQueryResult } from '@tanstack/solid-query';
import {
  Accessor,
  ComponentProps,
  createSignal,
  JSX,
  Match,
  mergeProps,
  onCleanup,
  onMount,
  Switch,
} from 'solid-js';

import { createTranslate } from 'src/intl/translate';

import { Spinner } from './spinner';

const Translate = createTranslate('components.query');

export function Query<Data>(props_: {
  query: UseQueryResult<Data>;
  pending?: JSX.Element;
  error?: (error: Error) => JSX.Element;
  children: (data: Accessor<Data>) => JSX.Element;
}) {
  const props = mergeProps(
    {
      pending: <QueryPending />,
      error: (error) => <QueryError error={error} />,
    } satisfies Partial<ComponentProps<typeof Query>>,
    props_,
  );

  const [showPending, setShowPending] = createSignal(false);
  const setShowDebounce = debounce(() => setShowPending(true), 250);

  onMount(setShowDebounce);
  onCleanup(setShowDebounce.clear);

  return (
    <Switch>
      <Match when={props.query.isPending}>{showPending() && props.pending}</Match>
      <Match when={props.query.isError ? props.query.error : false}>{(error) => props.error(error())}</Match>
      <Match when={props.query.isSuccess ? props.query.data : false}>{props.children}</Match>
    </Switch>
  );
}

export function QueryPending() {
  return (
    <div class="row min-h-16 items-center justify-center">
      <Spinner class="size-6" />
    </div>
  );
}

export function QueryError(props: { error: Error }) {
  return (
    <div class="rounded-lg border-2 border-orange-600/20 bg-orange-600/10 p-6 text-orange-800 dark:text-orange-100">
      <Translate id="error" values={{ message: props.error.message }} />

      <details class="mt-4 text-dim">
        <summary class="max-w-fit cursor-pointer">
          <Translate id="errorDetails" />
        </summary>

        <div class="mt-4 col gap-4">
          <pre class="whitespace-pre-wrap">{props.error.stack}</pre>
          <pre class="whitespace-pre-wrap">{JSON.stringify(props.error, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
}
