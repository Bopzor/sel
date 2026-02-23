import { AdminMember, listAdminMembersQuerySchema } from '@sel/shared';
import { useSearchParams } from '@solidjs/router';
import { keepPreviousData, useQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import z from 'zod';

import { getLetsConfig } from 'src/application/config';
import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { Link } from 'src/components/link';
import { List } from 'src/components/list';
import { MemberStatus } from 'src/components/member-status';
import { Query } from 'src/components/query';
import { Table, TableHeader } from 'src/components/table';
import { FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';

import { MemberAvatarName } from '../../components/member-avatar-name';

const T = createTranslate('pages.admin.members');

type SortColumn = z.infer<typeof listAdminMembersQuerySchema.shape.sort>;
type SortOrder = z.infer<typeof listAdminMembersQuerySchema.shape.order>;

export function AdminMemberListPage() {
  const [sort] = useSearchParam('sort', listAdminMembersQuerySchema.shape.sort);
  const [order] = useSearchParam('order', listAdminMembersQuerySchema.shape.order);

  const [, setSearchParams] = useSearchParams();

  const query = useQuery(() => ({
    placeholderData: keepPreviousData,
    ...apiQuery('listMembersAdmin', {
      query: { order: order(), sort: sort() },
    }),
  }));

  return (
    <>
      <h1 class="mb-4">
        <T id="title" />
      </h1>

      <section class={card.content({ padding: false })}>
        <Query query={query}>
          {(members) => (
            <MembersTable
              members={members()}
              sort={{ column: sort(), order: order() }}
              onSort={(sort, order) => setSearchParams({ sort, order }, { replace: true })}
            />
          )}
        </Query>
      </section>
    </>
  );
}

function MembersTable(props: {
  members: AdminMember[];
  sort: { column: SortColumn; order: SortOrder };
  onSort: (column: SortColumn, order: SortOrder) => void;
}) {
  const config = getLetsConfig();

  const onSort = (column: SortColumn) => {
    if (props.sort.column !== column) {
      props.onSort(column, 'asc');
    } else if (props.sort.order === 'asc') {
      props.onSort(column, 'desc');
    } else {
      props.onSort(undefined, undefined);
    }
  };

  return (
    <Table
      items={props.members}
      columns={[
        {
          headerClass: clsx('max-md:hidden'),
          cellClass: clsx('max-md:hidden'),
          header: () => (
            <TableHeader
              sorting={props.sort.column === 'number'}
              onSort={() => onSort('number')}
              order={props.sort.order}
            >
              <T id="memberNumber" />
            </TableHeader>
          ),
          cell: (member) => member.number,
        },
        {
          header: () => (
            <TableHeader
              sorting={props.sort.column === 'name'}
              onSort={() => onSort('name')}
              order={props.sort.order}
            >
              <T id="name" />
            </TableHeader>
          ),
          cell: (member) => (
            <Link href={routes.admin.memberDetails(member.id)} class="row items-center gap-2">
              <MemberAvatarName link={false} member={member} />
            </Link>
          ),
        },
        {
          headerClass: clsx('max-md:hidden'),
          cellClass: clsx('max-md:hidden'),
          header: () => <T id="status" />,
          cell: (member) => <MemberStatus status={member.status} />,
        },
        {
          headerClass: clsx('max-md:hidden'),
          cellClass: clsx('max-md:hidden'),
          header: () => <T id="email" />,
          cell: (member) => <>{member.email}</>,
        },
        {
          headerClass: clsx('max-md:hidden'),
          cellClass: clsx('max-md:hidden'),
          header: () => <T id="phoneNumber" />,
          cell: (member) => (
            <List each={member.phoneNumbers}>
              {({ number }) => (
                <li>
                  <FormattedPhoneNumber phoneNumber={number} />
                </li>
              )}
            </List>
          ),
        },
        {
          headerClass: clsx('max-md:hidden'),
          cellClass: clsx('max-md:hidden'),
          header: () => (
            <TableHeader
              sorting={props.sort.column === 'balance'}
              onSort={() => onSort('balance')}
              order={props.sort.order}
            >
              <div class="capitalize">{config()?.currencyPlural}</div>
            </TableHeader>
          ),
          cell: (member) => <div class="text-end">{member.balance}</div>,
        },
      ]}
      classes={{
        root: 'w-full',
      }}
    />
  );
}
