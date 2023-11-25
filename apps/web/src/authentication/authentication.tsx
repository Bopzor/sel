import { assert } from '@sel/utils';
import { createMutation } from '@tanstack/solid-query';
import { Component, JSX, Show, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { Input } from '../components/input';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { Header } from '../layout/header/header';
import { TOKENS } from '../tokens';

const T = Translate.prefix('authentication');

export const Authentication: Component = () => {
  const t = T.useTranslation();
  const [email, setEmail] = createSignal<string>();

  const fetcher = container.resolve(TOKENS.fetcher);
  const requestAuthenticationLink = createMutation(() => ({
    mutationFn: (email: string) =>
      fetcher.post(`/api/authentication/request-authentication-link?${new URLSearchParams({ email })}`),
  }));

  const handleSubmit: JSX.EventHandler<HTMLFormElement, Event> = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get('email');

    assert(typeof email === 'string');

    setEmail(email.trim());
    void requestAuthenticationLink.mutate(email.trim());
  };

  return (
    <div class="col flex-1 items-center justify-center px-4">
      <div class="w-full max-w-2xl overflow-hidden rounded-lg bg-neutral">
        <Header />

        <div class="col gap-4 p-4">
          <Show
            when={!requestAuthenticationLink.isSuccess}
            fallback={
              <p class="my-4">
                <T
                  id="authenticationLinkRequested"
                  values={{
                    email: email(),
                    strong: (children) => <strong>{children}</strong>,
                  }}
                />
              </p>
            }
          >
            <p class="my-4">
              <T id="description" />
            </p>

            <form onSubmit={handleSubmit} class="col gap-4">
              <Input autofocus name="email" type="email" variant="outlined" placeholder={t('emailAddress')} />

              <Button type="submit" loading={requestAuthenticationLink.isPending} class="self-end">
                <T id="send" />
              </Button>
            </form>
          </Show>
        </div>
      </div>
    </div>
  );
};
