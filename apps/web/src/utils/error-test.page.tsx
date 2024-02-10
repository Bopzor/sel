import { createEffect, createResource, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { useSearchParam } from '../infrastructure/router/use-search-param';

export function ErrorTestPage() {
  return (
    <div class="col my-4 items-start gap-4">
      <h1>Test errors</h1>
      <RenderError />
      <EffectError />
      <CallbackError />
      <CreateResourceError />
    </div>
  );
}

function RenderError() {
  const [throwParam] = useSearchParam('throw', Boolean);

  if (throwParam()) {
    throw new Error('Test error: render');
  }

  return (
    <a class="unstyled button button-primary" href="?throw=true">
      Render
    </a>
  );
}

function EffectError() {
  const [error, setError] = createSignal(false);

  createEffect(() => {
    if (error()) {
      throw new Error('Test error: effect');
    }
  });

  return <Button onClick={() => setError(true)}>Effect</Button>;
}

function CallbackError() {
  return (
    <Button
      onClick={() => {
        throw new Error('Test error: callback');
      }}
    >
      Callback
    </Button>
  );
}

function CreateResourceError() {
  const [error, setError] = createSignal(false);

  const [result] = createResource(error, async () => {
    throw new Error('Test error: createResource');
  });

  return <Button onClick={() => setError(true)}>createResource {result()}</Button>;
}
