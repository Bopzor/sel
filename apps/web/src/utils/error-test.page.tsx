import { Component, createEffect, createResource, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { useSearchParam } from '../infrastructure/router/use-search-param';

export const ErrorTestPage: Component = () => {
  return (
    <div class="col my-4 items-start gap-4">
      <h1>Test errors</h1>
      <RenderError />
      <EffectError />
      <CallbackError />
      <CreateResourceError />
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

const CreateResourceError: Component = () => {
  const [error, setError] = createSignal(false);

  const [result] = createResource(error, async () => {
    throw new Error('Test error: createResource');
  });

  return <Button onClick={() => setError(true)}>createResource {result()}</Button>;
};
