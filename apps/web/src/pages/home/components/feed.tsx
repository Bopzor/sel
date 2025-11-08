import { createForm, Field, FormStore, getValue, setValue } from '@modular-forms/solid';
import { FeedItem as FeedItemType, LightMember, Message as MessageType } from '@sel/shared';
import { keepPreviousData, useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { ComponentProps, createSignal, For, JSX, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { Chip } from 'src/components/chip';
import { Input } from 'src/components/input';
import { Link } from 'src/components/link';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';
import { Pagination } from 'src/components/pagination';
import { ResourceIcon } from 'src/components/resource-icon';
import { Select } from 'src/components/select';
import { FormattedRelativeDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.home.feed');

type FeedFiltersForm = {
  resourceType: 'event' | 'request' | 'information' | null;
  sortOrder: 'desc' | 'asc';
  search: string;
};

export function Feed() {
  const [page, setPage] = createSignal(1);
  const [form] = createForm<FeedFiltersForm>({
    initialValues: {
      resourceType: null,
      sortOrder: 'desc',
      search: '',
    },
  });

  const feedQuery = useQuery(() => ({
    ...apiQuery('getFeed', {
      query: {
        sortOrder: getValue(form, 'sortOrder') ?? 'desc',
        resourceType: getValue(form, 'resourceType') ?? undefined,
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
    <div class="col flex-1 gap-4">
      <FeedFilters form={form} resetPagination={() => setPage(1)} />

      <Show when={feedQuery.data}>
        {(data) => (
          <Show
            when={data().items.length > 0}
            fallback={
              <div class={card.fallback()}>
                <T id="empty" />
              </div>
            }
          >
            <For each={data().items}>{(item) => <FeedItem {...feedProps(item)} />}</For>

            <Pagination page={page()} onChange={setPage} pages={Math.ceil(data().total / data().pageSize)} />
          </Show>
        )}
      </Show>
    </div>
  );
}

function FeedFilters(props: { form: FormStore<FeedFiltersForm>; resetPagination: () => void }) {
  const t = T.useTranslate();

  return (
    <form class="mb-8 col gap-4">
      <div class="row gap-2">
        <For each={['request', 'event', 'information'] as const}>
          {(resourceType) => (
            <Field name="resourceType" of={props.form} type="string">
              {(field, fieldProps) => (
                <Chip
                  {...fieldProps}
                  onClick={(event) => {
                    if (event.currentTarget.checked) {
                      setValue(props.form, 'resourceType', null);
                      props.resetPagination();
                    }
                  }}
                  type="radio"
                  value={resourceType}
                  checked={field.value === resourceType}
                  classes={{ root: 'row items-center gap-2' }}
                  onChange={(event) => {
                    fieldProps.onChange(event);
                    props.resetPagination();
                  }}
                >
                  <ResourceIcon type={resourceType} class="size-4 text-dim peer-checked:text-primary" />
                  <T id={`filters.${resourceType}`} />
                </Chip>
              )}
            </Field>
          )}
        </For>
      </div>

      <div class="col gap-4 lg:row">
        <Field name="search" of={props.form}>
          {(_, fieldProps) => (
            <Input
              classes={{ root: 'flex-1' }}
              type="search"
              start={<Icon path={magnifyingGlass} class="size-5 text-dim" />}
              placeholder={t('filters.search')}
              {...fieldProps}
              onInput={(event) => {
                fieldProps.onInput(event);
                props.resetPagination();
              }}
            />
          )}
        </Field>

        <Field name="sortOrder" of={props.form}>
          {(field, fieldProps) => (
            <Select
              classes={{ root: 'max-md:hidden' }}
              ref={fieldProps.ref}
              items={['desc', 'asc'] as const}
              selectedItem={() => field.value}
              onItemSelected={(item) => {
                if (item) {
                  setValue(props.form, 'sortOrder', item);
                  props.resetPagination();
                }
              }}
              renderItem={(item) => <T id={`filters.${item!}`} />}
              itemToString={(item) => t(`filters.${item!}`)}
            />
          )}
        </Field>
      </div>
    </form>
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
