import { createForm, getValue, setValue } from '@modular-forms/solid';
import { FeedItem as FeedItemType, LightMember, Message as MessageType } from '@sel/shared';
import { debounce } from '@solid-primitives/scheduled';
import { keepPreviousData, useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { ComponentProps, createSignal, For, JSX, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { Input } from 'src/components/input';
import { Link } from 'src/components/link';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';
import { Pagination } from 'src/components/pagination';
import { Query } from 'src/components/query';
import { ResourceIcon } from 'src/components/resource-icon';
import { FormattedRelativeDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.home.feed');

export function Feed() {
  const t = T.useTranslate();

  const [page, setPage] = createSignal(1);

  const [form, { Field }] = createForm<{ search: string }>({
    initialValues: {
      search: '',
    },
  });

  const debounceSearch = debounce((value: string) => {
    setValue(form, 'search', value);
    setPage(1);
  }, 500);

  const query = useQuery(() => ({
    ...apiQuery('getFeed', {
      query: {
        search: getValue(form, 'search'),
        page: page(),
      },
    }),
    placeholderData: keepPreviousData,
  }));

  const feedProps = ([type, entity]: FeedItemType): ComponentProps<typeof FeedItem> => {
    if (type === 'request') {
      return {
        type,
        member: entity.requester,
        date: entity.publishedAt,
        title: entity.title,
        message: entity.message,
        link: routes.requests.details(entity.id),
      };
    }

    if (type === 'event') {
      return {
        type,
        member: entity.organizer,
        date: entity.publishedAt,
        title: entity.title,
        message: entity.message,
        link: routes.events.details(entity.id),
      };
    }

    if (type === 'information') {
      return {
        type,
        member: entity.author,
        date: entity.publishedAt,
        title: entity.title,
        message: entity.message,
        link: routes.information.details(entity.id),
      };
    }

    return type;
  };

  return (
    <>
      <form class="mb-8">
        <Field name="search">
          {(_, fieldProps) => (
            <Input
              classes={{ root: 'flex-1' }}
              type="search"
              start={<Icon path={magnifyingGlass} class="size-5 text-dim" />}
              placeholder={t('filters.search')}
              {...fieldProps}
              onInput={(event) => debounceSearch(event.target.value)}
            />
          )}
        </Field>
      </form>

      <Query query={query}>
        {(feed) => (
          <Show
            when={feed().items.length > 0}
            fallback={
              <div class={card.fallback()}>
                <T id="empty" />
              </div>
            }
          >
            <div class="col flex-1 gap-4">
              <For each={feed().items}>{(item) => <FeedItem {...feedProps(item)} />}</For>
            </div>

            <div class="mt-6 row justify-center">
              <Pagination
                page={page()}
                onChange={(page) => {
                  setPage(page);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                pages={Math.ceil(feed().total / feed().pageSize)}
              />
            </div>
          </Show>
        )}
      </Query>
    </>
  );
}

function FeedItem(props: {
  type: FeedItemType[0];
  member?: LightMember;
  date: string;
  title: JSX.Element;
  message: MessageType;
  link: string;
}) {
  return (
    <div class="group row">
      <div class="mr-2 col items-center sm:mr-4">
        <div class="rounded-full border-2 border-primary/50 bg-neutral p-1.5 sm:p-2">
          <ResourceIcon type={props.type} class="size-6 text-primary" />
        </div>
        <div class="flex-1 border-l-2 border-primary/50" />
      </div>

      <Link href={props.link} class="mt-2 mb-6 flex-1 group-last-of-type:mb-0">
        <section>
          <header class={card.header({ class: 'col justify-between gap-1 sm:row sm:gap-4' })}>
            <h2 class={card.title()}>
              <T id="itemTitle" values={{ type: <T id={`types.${props.type}`} />, title: props.title }} />
            </h2>

            <div class="text-xs text-nowrap text-dim sm:self-end">
              <FormattedRelativeDate date={props.date} />
            </div>
          </header>

          <div class={card.content()}>
            <MemberAvatarName
              member={props.member}
              classes={{ root: 'mb-4', name: 'text-lg' }}
              link={false}
            />
            <Message class="line-clamp-6" message={props.message} />
          </div>
        </section>
      </Link>
    </div>
  );
}
