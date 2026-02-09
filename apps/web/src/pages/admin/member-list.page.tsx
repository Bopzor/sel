import { useQuery } from '@tanstack/solid-query';

import { getLetsConfig } from 'src/application/config';
import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { Link } from 'src/components/link';
import { List } from 'src/components/list';
import { MemberStatus } from 'src/components/member-status';
import { Table } from 'src/components/table';
import { FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { MemberAvatarName } from '../../components/member-avatar-name';

const T = createTranslate('pages.admin.members');

export function AdminMemberListPage() {
  const config = getLetsConfig();
  const members = useQuery(() => apiQuery('listMembersAdmin', {}));

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
              header: () => <T id="memberNumber" />,
              cell: (member) => <>{member.number}</>,
            },
            {
              header: () => <T id="name" />,
              cell: (member) => (
                <Link href={routes.admin.memberDetails(member.id)} class="row items-center gap-2">
                  <MemberAvatarName link={false} member={member} />
                </Link>
              ),
            },
            {
              header: () => <T id="status" />,
              cell: (member) => <MemberStatus status={member.status} />,
            },
            {
              header: () => <T id="email" />,
              cell: (member) => <>{member.email}</>,
            },
            {
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
              header: () => <div class="capitalize">{config()?.currencyPlural}</div>,
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
