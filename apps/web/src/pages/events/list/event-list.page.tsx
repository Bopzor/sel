import { createListCollection, useFilter, useListCollection } from '@ark-ui/solid';
import { createForm, Field, FormStore, getValue, getValues, setValue } from '@modular-forms/solid';
import { EventsListItem, Member } from '@sel/shared';
import { getId, noop } from '@sel/utils';
import { useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { calendar, magnifyingGlass, plus } from 'solid-heroicons/solid';
import { createEffect, createSignal, For } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Button, LinkButton } from 'src/components/button';
import { Dialog, DialogFooter, DialogHeader } from 'src/components/dialog';
import { Combobox, Input, Select } from 'src/components/form-controls';
import { Link } from 'src/components/link';
import { List } from 'src/components/list';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';
import { Pagination } from 'src/components/pagination';
import { Query } from 'src/components/query';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { useTranslateEnum } from 'src/intl/enums';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.list');
const Translate = createTranslate('common');

type FiltersForm = {
  search: string;
  timing: 'past' | 'upcoming' | 'all';
  organizerId: string | null;
  year: number | null;
};

export function EventListPage() {
  const [page, setPage] = createSignal(1);

  const [filtersDialogOpen, setFiltersDialogOpen] = createSignal(false);
  const closeFiltersDialog = () => setFiltersDialogOpen(false);

  const [form] = createForm<FiltersForm>({
    initialValues: {
      search: '',
      timing: 'all',
      organizerId: null,
      year: null,
    },
  });

  const query = useQuery(() =>
    apiQuery('listEvents', {
      query: {
        page: page(),
        search: getValue(form, 'search') || undefined,
        timing: ((val) => (val === 'all' ? undefined : val))(getValue(form, 'timing')),
        organizerId: getValue(form, 'organizerId') ?? undefined,
        year: getValue(form, 'year') || undefined,
      },
    }),
  );

  createEffect(() => {
    getValues(form);
    setPage(1);
  });

  return (
    <>
      <Dialog open={filtersDialogOpen()} onClose={closeFiltersDialog} class="max-w-lg">
        <DialogHeader title={<T id="filters.title" />} onClose={closeFiltersDialog} />

        <Filters form={form} variant="outlined" />

        <DialogFooter>
          <Button variant="solid" onClick={closeFiltersDialog}>
            <T id="filters.apply" />
          </Button>
        </DialogFooter>
      </Dialog>

      <h1 class="mb-8">
        <T id="title" />
      </h1>

      <div class="col gap-8 lg:row lg:items-start">
        <div class="col w-full gap-4 lg:max-w-sm lg:gap-8">
          <LinkButton href={routes.events.create}>
            <Icon path={plus} class="size-6" />
            <T id="createEvent" />
          </LinkButton>

          <LinkButton variant="outline" href={routes.events.calendar}>
            <Icon path={calendar} class="size-6" />
            <T id="calendar" />
          </LinkButton>

          <Button variant="outline" onClick={() => setFiltersDialogOpen(true)} class="lg:hidden">
            <T id="filters.trigger" />
          </Button>

          <hr class="max-lg:hidden" />

          <div class="max-lg:hidden">
            <Filters form={form} variant="solid" />
          </div>
        </div>

        <Query query={query} pending={<Skeleton />}>
          {(events) => (
            <div class="col flex-1 gap-8">
              <List
                each={events().items}
                fallback={
                  <div class="items-center text-center font-medium text-dim">
                    <T id="noResults" />
                  </div>
                }
                class="col flex-1 gap-8"
              >
                {(event) => <EventItem event={event} />}
              </List>

              {events().items.length > 0 && (
                <Pagination
                  pages={Math.ceil(events().total / events().pageSize)}
                  page={page()}
                  onChange={setPage}
                />
              )}
            </div>
          )}
        </Query>
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div class="col flex-1 gap-8">
      <For each={Array(3).fill(null)}>
        {() => (
          <div class="col gap-2">
            <TextSkeleton width={12} />
            <BoxSkeleton height={8} />
          </div>
        )}
      </For>
    </div>
  );
}

function Filters(props: { form: FormStore<FiltersForm>; variant: 'solid' | 'outlined' }) {
  const t = Translate.useTranslate();
  const translateEnum = useTranslateEnum();

  const membersQuery = useQuery(() => apiQuery('listMembers', { query: {} }));
  const filterFn = useFilter({ sensitivity: 'base' });

  const membersList = useListCollection<Member>({
    initialItems: [],
    itemToString: (member) => [member.firstName, member.lastName].join(' '),
    itemToValue: getId,
    filter: filterFn().contains,
  });

  createEffect(() => {
    if (membersQuery.isSuccess) {
      membersList.set(membersQuery.data);
    }
  });

  const timingCollection = createListCollection<'past' | 'upcoming' | 'all'>({
    items: ['past', 'upcoming', 'all'],
    itemToString: (item) => (item === 'all' ? t('all') : translateEnum('eventTiming', item)),
    itemToValue: (item) => (item === 'all' ? 'all' : item),
  });

  const yearCollection = createListCollection({
    items: Array(4)
      .fill(null)
      .map((_, index) => new Date().getFullYear() - index),
    itemToString: String,
    itemToValue: String,
  });

  return (
    <form class="col gap-4">
      <Field of={props.form} name="search">
        {(field, fieldProps) => (
          <Input
            {...fieldProps}
            type="search"
            variant={props.variant}
            placeholder={t('search')}
            start={<Icon path={magnifyingGlass} class="size-5" />}
            value={field.value}
            error={field.error}
          />
        )}
      </Field>

      <Field of={props.form} name="organizerId">
        {(field, fieldProps) => (
          <Combobox
            {...fieldProps}
            variant={props.variant}
            collection={membersList.collection()}
            renderItem={(member) => <MemberAvatarName member={member} link={false} />}
            label={<T id="filters.organizer" />}
            onInputValueChange={({ inputValue }) => membersList.filter(inputValue)}
            value={field.value ?? undefined}
            onValueChange={(organizerId) => setValue(props.form, 'organizerId', organizerId ?? null)}
            onInput={noop}
          />
        )}
      </Field>

      <Field of={props.form} name="timing">
        {(field, fieldProps) => (
          <Select
            {...fieldProps}
            variant={props.variant}
            label={<T id="filters.timing" />}
            collection={timingCollection}
            renderItem={timingCollection.stringifyItem}
            value={field.value}
            onValueChange={(value) => setValue(props.form, 'timing', timingCollection.find(value)!)}
            error={field.error}
          />
        )}
      </Field>

      <Field of={props.form} name="year" type="number">
        {(field, fieldProps) => (
          <Select
            {...fieldProps}
            deselectable
            variant={props.variant}
            label={<T id="filters.year" />}
            collection={yearCollection}
            renderItem={String}
            value={field.value ? String(field.value) : null}
            onValueChange={(value) => setValue(props.form, 'year', value ? Number(value) : null)}
          />
        )}
      </Field>
    </form>
  );
}

function EventItem(props: { event: EventsListItem }) {
  return (
    <li class="col gap-2">
      <div class="row items-end justify-between">
        {props.event.date ? (
          <FormattedDate date={props.event.date} dateStyle="long" timeStyle="short" />
        ) : (
          <T id="dateToBeDefined" />
        )}
        <div class="text-xs text-dim">
          {[props.event.organizer.firstName, props.event.organizer.lastName].join(' ')}
        </div>
      </div>

      <Link
        href={`/events/${props.event.id}`}
        class="col-span-2 col gap-4 rounded-lg bg-neutral p-4 shadow-sm"
      >
        <div class="text-xl font-medium">{props.event.title}</div>
        <Message class="line-clamp-3" message={props.event.message} />
      </Link>
    </li>
  );
}
