import { createForm } from '@felte/solid';
import { Interest } from '@sel/shared';
import { removeDiacriticCharacters } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { For, Show, createSignal } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../components/breadcrumb';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Link } from '../../components/link';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';

import { CreateInterestForm } from './components/create-interest-form';
import { InterestItem } from './components/interest-item';

const T = Translate.prefix('interests');

export default function InterestsPage() {
  const t = T.useTranslation();

  const api = container.resolve(TOKENS.api);
  const query = createQuery(() => ({
    queryKey: ['listInterests'],
    queryFn: () => api.listInterests({}),
  }));

  // @ts-expect-error solidjs directive
  const { form, data, setFields } = createForm<{ search: string }>();
  const search = () => data('search');

  const [createInterest, setCreateInterest] = createSignal<string>();

  const filteredInterests = () => {
    const search = removeDiacriticCharacters(data('search') ?? '').toLowerCase();

    if (search === '') {
      return query.data;
    }

    const matchInterest = (interest: Interest) => {
      return [interest.label, interest.description]
        .map((string) => removeDiacriticCharacters(string).toLowerCase())
        .some((string) => string.includes(search));
    };

    return query.data?.filter(matchInterest);
  };

  const onCreate = () => {
    setCreateInterest(search());
    setFields('search', '');
  };

  return (
    <>
      <Breadcrumb items={[breadcrumb.interests()]} />

      <p class="my-1 max-w-3xl">
        <T id="intro.sentence1" />
      </p>

      <p class="my-1 max-w-3xl">
        <T
          id="intro.sentence2"
          values={{ link: (children) => <Link href={routes.profile.interests}>{children}</Link> }}
        />
      </p>

      <form use:form>
        <Input
          name="search"
          type="search"
          disabled={createInterest() !== undefined}
          start={<Icon path={magnifyingGlass} class="size-6" />}
          placeholder={t('searchPlaceholder')}
          class="my-8"
        />
      </form>

      <Show when={!createInterest()}>
        <ul class="card divide-y px-8 py-2">
          <For each={filteredInterests()} fallback={<NoResults search={search()} onCreate={onCreate} />}>
            {(interest) => (
              <li>
                <InterestItem interest={interest} />
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={createInterest()}>
        {(label) => (
          <CreateInterestForm
            initialLabel={label()}
            onCancel={() => setCreateInterest(undefined)}
            onCreated={() => setCreateInterest(undefined)}
          />
        )}
      </Show>
    </>
  );
}

function NoResults(props: { search: string; onCreate: () => void }) {
  return (
    <>
      <div class="col gap-4 py-8 text-center text-dim">
        <Show when={props.search !== ''} fallback={<T id="noInterests" />}>
          <T id="noSearchResults" />

          <Button class="self-center" onClick={props.onCreate}>
            <T id="createInterest" values={{ label: props.search }} />
          </Button>
        </Show>
      </div>
    </>
  );
}
