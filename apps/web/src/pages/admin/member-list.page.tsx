import { listAdminMembersQuerySchema } from '@sel/shared';
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
import { Table, TableHeader } from 'src/components/table';
import { FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';

import { MemberAvatarName } from '../../components/member-avatar-name';

const T = createTranslate('pages.admin.members');

export function AdminMemberListPage() {
  const config = getLetsConfig();

  const [order] = useSearchParam('order', listAdminMembersQuerySchema.shape.order);
  const [sort] = useSearchParam('sort', listAdminMembersQuerySchema.shape.sort);
  const [, setSearchParams] = useSearchParams();

  const members = useQuery(() => ({
    placeholderData: keepPreviousData,
    ...apiQuery('listMembersAdmin', {
      query: { order: order(), sort: sort() },
    }),
  }));

  const onSort = (column: z.output<typeof listAdminMembersQuerySchema>['sort']) => {
    if (sort() !== column) {
      setSearchParams({ sort: column, order: undefined }, { replace: true });
    } else if (order() === undefined) {
      setSearchParams({ sort: column, order: 'desc' }, { replace: true });
    } else {
      setSearchParams({ order: undefined, sort: undefined }, { replace: true });
    }
  };

  return (
    <>
      <h1 class="mb-4">
        <T id="title" />
      </h1>

      <section class={card.content({ padding: false })}>
        <Table
          items={members.data}
          columns={[
            {
              headerClass: clsx('max-md:hidden'),
              cellClass: clsx('max-md:hidden'),
              header: () => (
                <TableHeader sorting={sort() === 'number'} onSort={() => onSort('number')} order={order()}>
                  <T id="memberNumber" />
                </TableHeader>
              ),
              cell: (member) => member.number,
            },
            {
              header: () => (
                <TableHeader sorting={sort() === 'name'} onSort={() => onSort('name')} order={order()}>
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
                <TableHeader sorting={sort() === 'balance'} onSort={() => onSort('balance')} order={order()}>
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
      </section>
    </>
  );
}
