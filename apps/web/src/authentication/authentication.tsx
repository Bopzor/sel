import { assert } from '@sel/utils';
import { Component, JSX, Show, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { Input } from '../components/input';
import { Translate } from '../intl/translate';
import { Header } from '../layout/header/header';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectAuthenticationLinkRequested } from './authentication.slice';
import { requestAuthenticationLink } from './use-cases/request-authentication-link/request-authentication-link';

const T = Translate.prefix('authentication');

export const Authentication: Component = () => {
  const t = T.useTranslation();
  const [email, setEmail] = createSignal<string>();

  const authenticationLinkRequested = selector(selectAuthenticationLinkRequested);

  const handleSubmit: JSX.EventHandler<HTMLFormElement, Event> = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get('email');

    assert(typeof email === 'string');

    setEmail(email.trim());
    void store.dispatch(requestAuthenticationLink(email));
  };

  return (
    <div class="col flex-1 items-center justify-center px-4">
      <div class="w-full max-w-2xl overflow-hidden rounded-lg bg-neutral">
        <Header />

        <div class="col gap-4 p-4">
          <Show
            when={!authenticationLinkRequested()}
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
            <>
              <p class="my-4">
                <T id="description" />
              </p>

              <form onSubmit={handleSubmit} class="col gap-4">
                <Input
                  autofocus
                  name="email"
                  type="email"
                  placeholder={t('emailAddress')}
                  class="border-inverted/20 shadow-none"
                />

                <Button type="submit" class="self-end">
                  <T id="send" />
                </Button>
              </form>
            </>
          </Show>
        </div>
      </div>
    </div>
  );
};
