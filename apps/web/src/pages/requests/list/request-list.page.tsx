import { createListCollection, useFilter, useListCollection } from '@ark-ui/solid';
import { createForm, Field, FormStore, getValue, getValues, setValue } from '@modular-forms/solid';
import { Member, RequestListItem, RequestStatus as RequestStatusEnum } from '@sel/shared';
import { getId, noop } from '@sel/utils';
import { keepPreviousData, useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass, plus } from 'solid-heroicons/solid';
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

import { RequestStatus } from '../components/request-status';

const T = createTranslate('pages.requests.list');
const Translate = createTranslate('common');

type FiltersForm = {
  search: string;
  requesterId: string | null;
  status: RequestStatusEnum | 'all';
  year: number | null;
};

export function RequestListPage() {
  const [page, setPage] = createSignal(1);

  const [filtersDialogOpen, setFiltersDialogOpen] = createSignal(false);
  const closeFiltersDialog = () => setFiltersDialogOpen(false);

  const [form] = createForm<FiltersForm>({
    initialValues: {
      search: '',
      requesterId: null,
      status: RequestStatusEnum.pending,
      year: null,
    },
  });

  const query = useQuery(() => ({
    ...apiQuery('listRequests', {
      query: {
        page: page(),
        search: getValue(form, 'search') || undefined,
        requesterId: getValue(form, 'requesterId') ?? undefined,
        status: ((val) => (val === 'all' ? undefined : val))(getValue(form, 'status')),
        year: getValue(form, 'year') || undefined,
      },
    }),
    enabled: !filtersDialogOpen(),
    placeholderData: keepPreviousData,
  }));

  createEffect(() => {
    getValues(form);
    setPage(1);
  });

  return (
    <>
      <Dialog open={filtersDialogOpen()} onClose={closeFiltersDialog}>
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
          <LinkButton href={routes.requests.create}>
            <Icon path={plus} class="size-6" />
            <T id="createRequest" />
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
          {(requests) => (
            <div class="col flex-1 gap-8">
              <List
                each={requests().items}
                fallback={
                  <div class="items-center text-center font-medium text-dim">
                    <T id="noResults" />
                  </div>
                }
                class="col flex-1 gap-8"
              >
                {(request) => <RequestItem request={request} />}
              </List>

              {requests().items.length > 0 && (
                <Pagination
                  pages={Math.ceil(requests().total / requests().pageSize)}
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

  const statusCollection = createListCollection<RequestStatusEnum | 'all'>({
    items: [RequestStatusEnum.pending, RequestStatusEnum.fulfilled, RequestStatusEnum.canceled, 'all'],
    itemToString: (item) => (item === 'all' ? 'Tous' : translateEnum('requestStatus', item)),
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

      <Field of={props.form} name="status">
        {(field, fieldProps) => (
          <Select
            {...fieldProps}
            variant={props.variant}
            label={<T id="filters.status" />}
            collection={statusCollection}
            renderItem={statusCollection.stringifyItem}
            value={field.value}
            onValueChange={(value) => setValue(props.form, 'status', statusCollection.find(value)!)}
            error={field.error}
          />
        )}
      </Field>

      <Field of={props.form} name="requesterId">
        {(field, fieldProps) => (
          <Combobox
            {...fieldProps}
            variant={props.variant}
            collection={membersList.collection()}
            renderItem={(member) => <MemberAvatarName member={member} link={false} />}
            label={<T id="filters.requester" />}
            onInputValueChange={({ inputValue }) => membersList.filter(inputValue)}
            value={field.value ?? undefined}
            onValueChange={(requesterId) => setValue(props.form, 'requesterId', requesterId ?? null)}
            onInput={noop}
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

function Skeleton() {
  return (
    <div class="col max-w-4xl gap-8">
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

function RequestItem(props: { request: RequestListItem }) {
  return (
    <li class="col gap-2">
      <div class="row items-end justify-between">
        <MemberAvatarName member={props.request.requester} />
        <div class="text-xs text-dim">
          <FormattedDate date={props.request.date} dateStyle="medium" timeStyle="medium" />
        </div>
      </div>

      <Link
        href={`/requests/${props.request.id}`}
        class="col-span-2 col gap-4 rounded-lg bg-neutral p-4 shadow-sm"
      >
        <div class="row justify-between gap-4">
          <div class="text-xl font-medium">{props.request.title}</div>
          <RequestStatus status={props.request.status} />
        </div>

        <Message class="line-clamp-3" message={props.request.message} />
      </Link>
    </li>
  );
}
