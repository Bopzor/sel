import { assert } from '@sel/utils';
import { Component, JSX, Match, Switch, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { Input } from '../components/input';
import { Translate } from '../intl/translate';
import { Header } from '../layout/header/header';
import { mutation } from '../utils/mutation';

const T = Translate.prefix('authentication');

export const Authentication: Component = () => {
  const t = T.useTranslation();
  const [email, setEmail] = createSignal<string>();

  const [requestAuthenticationLink, meta] = mutation((fetcher) => ({
    key: ['requestAuthenticationLink'],
    async mutate(email: string) {
      await fetcher.post(`/api/authentication/request-authentication-link?${new URLSearchParams({ email })}`);
    },
  }));

  const handleSubmit: JSX.EventHandler<HTMLFormElement, Event> = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get('email');

    assert(typeof email === 'string');

    setEmail(email.trim());
    requestAuthenticationLink(email.trim());
  };

  return (
    <div class="col flex-1 items-center justify-center px-4">
      <div class="w-full max-w-2xl overflow-hidden rounded-lg bg-neutral">
        <Header />

        <div class="col gap-4 p-4">
          <Switch>
            <Match when={!meta.isSuccess}>
              <p class="my-4">
                <T id="description" />
              </p>

              <form onSubmit={handleSubmit} class="col gap-4">
                <Input
                  autofocus
                  name="email"
                  type="email"
                  variant="outlined"
                  placeholder={t('emailAddress')}
                />

                <Button type="submit" loading={meta.isPending} class="self-end">
                  <T id="send" />
                </Button>
              </form>
            </Match>

            <Match when={meta.isSuccess}>
              <p class="my-4">
                <T
                  id="authenticationLinkRequested"
                  values={{
                    email: email(),
                    strong: (children) => <strong>{children}</strong>,
                  }}
                />
              </p>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};
