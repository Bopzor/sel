import { AdminMember, MemberStatus } from '@sel/shared';
import { createQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { check, exclamationTriangle, xMark } from 'solid-heroicons/solid';
import { For } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';
import { formatPhoneNumber } from '../../utils/format-phone-number';
import { getLetsConfig } from '../../utils/lets-config';

const T = Translate.prefix('admin.members');

export default function MemberListPage() {
  const api = container.resolve(TOKENS.api);
  const config = getLetsConfig();

  const members = createQuery(() => ({
    queryKey: ['listMembersAdmin'],
    queryFn: () => api.listMembersAdmin({}),
  }));

  return (
    <div class="card my-8">
      <table class="w-full">
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
          <For each={members.data}>{(member) => <MemberRow member={member} />}</For>
        </tbody>
      </table>
    </div>
  );
}

function MemberRow(props: { member: AdminMember }) {
  const linkComponent = (): DynamicProps<'div' | typeof Link> => {
    if (props.member.status !== MemberStatus.active) {
      return { component: 'div' };
    }

    return {
      component: Link,
      href: routes.members.member(props.member.id),
      unstyled: true,
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
        <div class="row items-center gap-2">
          <div>
            <Icon
              path={statusIcons[props.member.status]}
              class="size-5 stroke-2"
              classList={{
                'text-green-600': props.member.status === MemberStatus.active,
                'text-yellow-600': props.member.status === MemberStatus.onboarding,
                'text-dim': props.member.status === MemberStatus.inactive,
              }}
            />
          </div>
          <TranslateMemberStatus value={props.member.status} />
        </div>
      </td>

      <td>{props.member.email}</td>

      <td>
        <ul>
          <For each={props.member.phoneNumbers}>{({ number }) => <li>{formatPhoneNumber(number)}</li>}</For>
        </ul>
      </td>

      <td>{props.member.balance}</td>
    </tr>
  );
}

const TranslateMemberStatus = Translate.enum('members.statuses');

const statusIcons = {
  [MemberStatus.active]: check,
  [MemberStatus.onboarding]: exclamationTriangle,
  [MemberStatus.inactive]: xMark,
};
