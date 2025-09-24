import type { LightMember, SearchEvent, SearchInformation, SearchItem, SearchRequest } from '@sel/shared';
import { useSearchParams } from '@solidjs/router';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { calendar } from 'solid-heroicons/outline';
import { chatBubbleBottomCenterText, handRaised, magnifyingGlass, user } from 'solid-heroicons/solid';
import { ComponentProps, createEffect, createMemo, createSignal, For, JSX, onCleanup, Show } from 'solid-js';

import { api } from '../application/api';
import { createTranslate } from '../intl/translate';
import { debounce } from '../utils/debounce';
import { Dialog, DialogFooter, DialogHeader } from './dialog';
import { Input } from './input';
import { Link } from './link';
import { MemberAvatarName, memberName } from './member-avatar-name';
import { Pagination } from './pagination';

const T = createTranslate('components.searchDialog');

export function SearchDialog(props: { open: boolean; onClose: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchPage = createMemo(() => {
    if (!searchParams.searchPage) {
      return 1;
    }

    return Number(searchParams.searchPage);
  });

  const searchQuery = createMemo(() => searchParams.searchQuery as string | undefined);
  const [inputSearch, setInputSearch] = createSignal<string | undefined>();
  const { debounced, clear } = debounce((value: string | undefined) =>
    setSearchParams({ searchQuery: value, searchPage: undefined }),
  );

  const t = T.useTranslate();

  const query = useQuery(() => ({
    queryKey: ['search', searchQuery(), searchPage()],
    queryFn: () =>
      api.search({
        query: { search: searchQuery() ?? '', page: searchPage() },
      }),
    placeholderData: searchQuery() ? keepPreviousData : undefined,
    enabled: Boolean(searchQuery()),
  }));
  const queryClient = useQueryClient();

  createEffect(() => {
    if (props.open === false) {
      setSearchParams({ searchQuery: undefined, searchPage: undefined });
      setInputSearch(undefined);
    }
  });

  createEffect(() => {
    debounced(inputSearch());
  });

  createEffect(() => {
    if (!searchQuery()) {
      setSearchParams({ searchQuery: undefined, searchPage: undefined });
      setInputSearch(undefined);
      queryClient.setQueryData([['search', searchQuery(), searchPage()]], undefined);
    }
  });

  onCleanup(() => clear());

  const totalItems = createMemo(() => {
    if (!query.data) {
      return 0;
    }

    return Object.values(query.data)
      .map(({ total }) => total ?? 0)
      .reduce((sum, total) => (sum += total), 0);
  });

  const numberOfPages = createMemo(() => {
    const ITEMS_PER_PAGE = 10;

    return Math.ceil(totalItems() / ITEMS_PER_PAGE);
  });

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} class="max-w-2xl">
      <DialogHeader title={<T id="title" />} onClose={() => props.onClose()} />

      <Input
        start={<Icon path={magnifyingGlass} class="size-6 stroke-2" />}
        variant="outlined"
        type="search"
        value={inputSearch() ?? ''}
        onInput={(event) => setInputSearch(event.target.value)}
        placeholder={t('placeholder')}
      />

      <Show when={query.data} fallback={<NoSearch />}>
        {(results) => (
          <div class="col">
            <section>
              <div class="col gap-4 py-4">
                <Show when={totalItems() > 0} fallback={<T id="empty" />}>
                  <Show when={results().members.items}>
                    {(members) => (
                      <SearchResultSection<LightMember>
                        title={<T id="members" />}
                        icon={user}
                        items={members()}
                        renderItem={(item) => <SearchMemberItem {...item} />}
                      />
                    )}
                  </Show>
                  <Show when={results().requests.items}>
                    {(requests) => (
                      <SearchResultSection<SearchRequest>
                        title={<T id="requests" />}
                        icon={handRaised}
                        items={requests()}
                        renderItem={(item) => (
                          <SearchItem
                            link={`/requests/${item.id}`}
                            member={item.requester}
                            title={item.title}
                          />
                        )}
                      />
                    )}
                  </Show>
                  <Show when={results().events.items}>
                    {(events) => (
                      <SearchResultSection<SearchEvent>
                        title={<T id="events" />}
                        icon={calendar}
                        items={events()}
                        renderItem={(item) => (
                          <SearchItem
                            link={`/events/${item.id}`}
                            member={item.organizer}
                            title={item.title}
                          />
                        )}
                      />
                    )}
                  </Show>
                  <Show when={results().information.items}>
                    {(information) => (
                      <SearchResultSection<SearchInformation>
                        title={<T id="information" />}
                        icon={chatBubbleBottomCenterText}
                        items={information()}
                        renderItem={(item) => (
                          <SearchItem
                            link={`/information/${item.id}`}
                            member={item.author}
                            title={item.title}
                          />
                        )}
                      />
                    )}
                  </Show>
                </Show>
              </div>
            </section>

            <Show when={numberOfPages() > 0}>
              <DialogFooter class="justify-center!">
                <Pagination
                  pages={numberOfPages()}
                  page={searchPage()}
                  onChange={(searchPage) => setSearchParams({ searchPage })}
                />
              </DialogFooter>
            </Show>
          </div>
        )}
      </Show>
    </Dialog>
  );
}

function NoSearch() {
  const translationKeys: ComponentProps<typeof T>['id'][] = [
    'membersExample',
    'requestsExample',
    'eventsExample',
    'informationExample',
  ];

  return (
    <div class="mt-2 col gap-4 p-4">
      <ul class="list-inside list-disc px-8">
        <For each={translationKeys}>
          {(label) => (
            <li>
              <T
                id={label}
                values={{ wrap: (children) => <span class="text-sm text-dim">{children}</span> }}
              />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function SearchResultSection<T extends SearchItem>(props: {
  title: JSX.Element;
  icon: ComponentProps<typeof Icon>['path'];
  items: T[];
  renderItem: (item: T) => JSX.Element;
}) {
  return (
    <div class="col gap-4">
      <div class="row items-center gap-2 truncate font-semibold">
        <Icon path={props.icon} class="size-6" /> {props.title}
      </div>

      <div class="col gap-2">
        <For each={props.items}>
          {(item) => (
            <ul class="pl-4 sm:pl-8">
              <li class="p-2 hover:bg-inverted/5 focus:bg-inverted/5">{props.renderItem(item)}</li>
            </ul>
          )}
        </For>
      </div>
    </div>
  );
}

function SearchMemberItem(props: LightMember) {
  return <MemberAvatarName member={props} classes={{ root: 'row max-w-full' }} />;
}

function SearchItem(props: { title: string; link: string; member?: LightMember }) {
  return (
    <Link href={props.link} class="grid grid-cols-3 items-start gap-2">
      <Show
        when={props.title}
        fallback={
          <span class="col-span-2 italic">
            <T id="withoutTitle" />
          </span>
        }
      >
        {(title) => <span class="col-span-2 line-clamp-2">{title()}</span>}
      </Show>

      <Show when={props.member}>
        {(member) => (
          <span class="line-clamp-1 text-right text-sm text-dim">({memberName(member(), true)})</span>
        )}
      </Show>
    </Link>
  );
}
