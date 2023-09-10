import { Icon } from 'solid-heroicons';
import { magnifyingGlass, plus } from 'solid-heroicons/solid';
import { Component, For, createEffect } from 'solid-js';

import { BackLink } from '../components/back-link';
import { LinkButton } from '../components/button';
import { Input } from '../components/input';
import { Translate, useTranslation } from '../intl/translate';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectRequests } from './requests.slice';
import { fetchRequests } from './use-cases/fetch-requests/fetch-requests';

const T = Translate.prefix('requests');

export const RequestsPage: Component = () => {
  const requests = selector(selectRequests);
  const t = useTranslation();

  createEffect(() => {
    void store.dispatch(fetchRequests());
  });

  return (
    <>
      <BackLink href="/" />

      <div class="row gap-8">
        <Input
          type="search"
          width="full"
          placeholder={t('common.search')}
          start={<Icon path={magnifyingGlass} class="h-6 w-6" />}
        />

        <LinkButton unstyled href="/demandes/créer">
          <Icon path={plus} class="h-6 w-6" />
          <T id="createRequest" />
        </LinkButton>
      </div>

      <For each={requests()}>{(request) => <>{request.id}</>}</For>
    </>
  );
};
