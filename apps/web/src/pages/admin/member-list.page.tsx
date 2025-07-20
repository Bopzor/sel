import { MemberStatus as MemberStatusEnum } from '@sel/shared';
import { useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, exclamationTriangle, xMark } from 'solid-heroicons/solid';
import { For } from 'solid-js';

import { getLetsConfig } from 'src/application/config';
import { apiQuery } from 'src/application/query';
import { breadcrumb, Breadcrumb } from 'src/components/breadcrumb';
import { Card2, CardContent } from 'src/components/card';
import { Table } from 'src/components/table';
import { TranslateMembersStatus } from 'src/intl/enums';
import { FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { MemberAvatarName } from '../../components/member-avatar-name';

const T = createTranslate('pages.admin.members');

export function AdminMemberListPage() {
  const config = getLetsConfig();
  const members = useQuery(() => apiQuery('listMembersAdmin', {}));

  return (
    <>
      <Breadcrumb items={[breadcrumb.admin(), breadcrumb.adminMembers()]} />

      <h1 class="mb-4">
        <T id="title" />
      </h1>

      <Card2>
        <CardContent class="p-0!">
          <Table
            items={members.data}
            columns={[
              {
                header: () => <T id="name" />,
                cell: (member) => (
                  <MemberAvatarName link={member.status === MemberStatusEnum.active} member={member} />
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
                  <ul>
                    <For each={member.phoneNumbers}>
                      {({ number }) => (
                        <li>
                          <FormattedPhoneNumber phoneNumber={number} />
                        </li>
                      )}
                    </For>
                  </ul>
                ),
              },
              {
                header: () => <div class="capitalize">{config()?.currencyPlural}</div>,
                cell: (member) => <div class="text-end">{member.balance}</div>,
              },
            ]}
            class="table w-full"
          />
        </CardContent>
      </Card2>
    </>
  );
}

function MemberStatus(props: { status: MemberStatusEnum }) {
  const icons = {
    [MemberStatusEnum.active]: check,
    [MemberStatusEnum.onboarding]: exclamationTriangle,
    [MemberStatusEnum.inactive]: xMark,
  };

  return (
    <div class="inline-flex flex-row items-center gap-2">
      <div>
        <Icon
          path={icons[props.status]}
          class="size-5 stroke-2"
          classList={{
            'text-emerald-600': props.status === MemberStatusEnum.active,
            'text-amber-600': props.status === MemberStatusEnum.onboarding,
            'text-dim': props.status === MemberStatusEnum.inactive,
          }}
        />
      </div>

      <TranslateMembersStatus value={props.status} />
    </div>
  );
}
