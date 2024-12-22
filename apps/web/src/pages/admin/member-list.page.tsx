import { AdminMember, MemberStatus as MemberStatusEnum } from '@sel/shared';
import { createArray } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, exclamationTriangle, xMark } from 'solid-heroicons/solid';
import { For } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { getLetsConfig } from 'src/application/config';
import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { breadcrumb, Breadcrumb } from 'src/components/breadcrumb';
import { Card } from 'src/components/card';
import { TextSkeleton } from 'src/components/skeleton';
import { TranslateMembersStatus } from 'src/intl/enums';
import { FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';

const T = createTranslate('pages.admin.members');

export function AdminMemberListPage() {
  const config = getLetsConfig();
  const members = createQuery(() => apiQuery('listMembersAdmin', {}));

  return (
    <>
      <Breadcrumb items={[breadcrumb.admin(), breadcrumb.adminMembers()]} />

      <h1 class="mb-4">
        <T id="title" />
      </h1>

      <Card class="overflow-hidden p-0">
        <table class="table w-full">
          <thead>
            <tr>
              <th>
                <T id="name" />
              </th>
              <th>
                <T id="status" />
              </th>
              <th>
                <T id="email" />
              </th>
              <th>
                <T id="phoneNumber" />
              </th>
              <th class="capitalize">{config()?.currencyPlural}</th>
            </tr>
          </thead>

          <tbody>
            <For each={members.data} fallback={<Skeleton />}>
              {(member) => <MemberRow member={member} />}
            </For>
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Skeleton() {
  return (
    <>
      {createArray(3, () => (
        <tr>
          <For each={[16, 4, 16, 8, 4]}>
            {(value) => (
              <td>
                <TextSkeleton width={value} />
              </td>
            )}
          </For>
        </tr>
      ))}
    </>
  );
}

function MemberRow(props: { member: AdminMember }) {
  const linkComponent = (): DynamicProps<'div' | typeof Link> => {
    if (props.member.status !== MemberStatusEnum.active) {
      return { component: 'div' };
    }

    return {
      component: Link,
      href: routes.members.details(props.member.id),
    };
  };

  return (
    <tr>
      <td>
        <Dynamic {...linkComponent()} class="row items-center gap-2">
          <MemberAvatarName member={props.member} />
        </Dynamic>
      </td>

      <td>
        <MemberStatus status={props.member.status} />
      </td>

      <td>{props.member.email}</td>

      <td>
        <ul>
          <For each={props.member.phoneNumbers}>
            {({ number }) => (
              <li>
                <FormattedPhoneNumber phoneNumber={number} />
              </li>
            )}
          </For>
        </ul>
      </td>

      <td>{props.member.balance}</td>
    </tr>
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
            'text-green-600': props.status === MemberStatusEnum.active,
            'text-yellow-600': props.status === MemberStatusEnum.onboarding,
            'text-dim': props.status === MemberStatusEnum.inactive,
          }}
        />
      </div>
      <TranslateMembersStatus value={props.status} />
    </div>
  );
}
