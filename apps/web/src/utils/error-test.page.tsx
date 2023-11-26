import { Component, createEffect, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { useSearchParam } from '../infrastructure/router/use-search-param';

import { mutation } from './mutation';
import { query } from './query';

export const ErrorTestPage: Component = () => {
  return (
    <div class="col my-4 items-start gap-4">
      <h1>Test errors</h1>
      <RenderError />
      <EffectError />
      <CallbackError />
      <QueryError />
      <MutationError />
    </div>
  );
};

const RenderError: Component = () => {
  const [throwParam] = useSearchParam('throw', Boolean);

  if (throwParam()) {
    throw new Error('Test error: render');
  }

  return (
    <a class="unstyled button button-primary" href="?throw=true">
      Render
    </a>
  );
};

const EffectError: Component = () => {
  const [error, setError] = createSignal(false);

  createEffect(() => {
    if (error()) {
      throw new Error('Test error: effect');
    }
  });

  return <Button onClick={() => setError(true)}>Effect</Button>;
};

const CallbackError: Component = () => {
  return (
    <Button
      onClick={() => {
        throw new Error('Test error: callback');
      }}
    >
      Callback
    </Button>
  );
};

const QueryError: Component = () => {
  const [error, setError] = createSignal(false);

  // eslint-disable-next-line solid/reactivity
  const [result] = query(() => ({
    key: ['test-error', 'query', error()],
    async query() {
      if (error()) {
        throw new Error('Test error: query');
      }

      return null;
    },
  }));

  return (
    <Button onClick={() => setError(true)}>
      Query
      {result()}
    </Button>
  );
};

const MutationError: Component = () => {
  const [trigger] = mutation(() => ({
    key: ['test-error', 'mutation'],
    async mutate() {
      throw new Error('Test error: mutation');
    },
  }));

  return <Button onClick={() => trigger()}>Mutation</Button>;
};
