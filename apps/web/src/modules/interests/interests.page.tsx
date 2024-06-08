import { createForm } from '@felte/solid';
import { Interest } from '@sel/shared';
import { removeDiacriticCharacters } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { For, Show, createResource } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../components/breadcrumb';
import { Input } from '../../components/input';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { TOKENS } from '../../tokens';

import { InterestItem } from './components/interest-item';

const T = Translate.prefix('interests');

export default function InterestsPage() {
  const t = T.useTranslation();

  const interestApi = container.resolve(TOKENS.interestApi);
  const [interests, { refetch }] = createResource(() => interestApi.listInterests());

  const { form, data } = createForm<{ search: string }>();

  const filteredInterests = () => {
    const search = removeDiacriticCharacters(data('search') ?? '').toLowerCase();

    if (search === '') {
      return interests.latest;
    }

    const matchInterest = (interest: Interest) => {
      return [interest.label, interest.description]
        .map((string) => removeDiacriticCharacters(string).toLowerCase())
        .some((string) => string.includes(search));
    };

    return interests.latest?.filter(matchInterest);
  };

  return (
    <>
      <Breadcrumb items={[breadcrumb.interests()]} />

      <form ref={form}>
        <Input
          name="search"
          type="search"
          start={<Icon path={magnifyingGlass} class="size-6" />}
          placeholder={t('searchPlaceholder')}
          class="my-8"
        />
      </form>

      <ul class="card divide-y px-8 py-2">
        <For
          each={filteredInterests()}
          fallback={
            <div class="py-8 text-center text-dim">
              <Show when={data('search') !== ''} fallback={<T id="noInterests" />}>
                <T id="noSearchResults" />
              </Show>
            </div>
          }
        >
          {(interest) => (
            <li>
              <InterestItem interest={interest} refetch={() => void refetch()} />
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
