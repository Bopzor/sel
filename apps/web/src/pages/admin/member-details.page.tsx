import { AdminMember } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { JSX, Show } from 'solid-js';

import { getLetsConfig } from 'src/application/config';
import { apiQuery } from 'src/application/query';
import { card } from 'src/components/card';
import { List } from 'src/components/list';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { MemberStatus } from 'src/components/member-status';
import { BoxSkeleton, CircleSkeleton, TextSkeleton } from 'src/components/skeleton';
import { FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.admin.memberDetails');

export function AdminMemberDetailsPage() {
  const params = useParams<{ memberId: string }>();

  const query = useQuery(() =>
    apiQuery('getMemberAdmin', {
      path: { memberId: params.memberId },
    }),
  );

  return (
    <Show when={query.data} fallback={<Skeleton />}>
      {(member) => <MemberDetails member={member()} />}
    </Show>
  );
}

function Skeleton() {
  return (
    <div class="col gap-8">
      <div class="row items-center gap-8 text-2xl">
        <CircleSkeleton radius={6} />
        <TextSkeleton width={12} />
      </div>

      <BoxSkeleton height={16} />
    </div>
  );
}

function MemberDetails(props: { member: AdminMember }) {
  const config = getLetsConfig();

  return (
    <div class="col gap-8">
      <h1>
        <MemberAvatarName
          link={false}
          member={props.member}
          classes={{ avatar: 'size-12! md:size-24!', root: 'gap-4 md:gap-8' }}
        />
      </h1>

      <section class={card.content({ class: 'col gap-6' })}>
        <InfoItem label={<T id="memberNumber" />} value={props.member.number} />

        <InfoItem label={<T id="status" />} value={<MemberStatus status={props.member.status} />} />

        <InfoItem label={<T id="email" />} value={props.member.email} />

        <InfoItem
          label={<T id="phoneNumbers" />}
          value={
            <Show when={props.member.phoneNumbers.length > 0} fallback={<span class="text-dim">-</span>}>
              <List each={props.member.phoneNumbers}>
                {({ number }) => (
                  <li>
                    <FormattedPhoneNumber phoneNumber={number} />
                  </li>
                )}
              </List>
            </Show>
          }
        />

        <InfoItem
          label={<div class="capitalize">{config()?.currencyPlural}</div>}
          value={props.member.balance}
        />
      </section>
    </div>
  );
}

function InfoItem(props: { label: JSX.Element; value: JSX.Element }) {
  return (
    <div class="col gap-2">
      <div class="font-medium text-dim">{props.label}</div>
      <div>{props.value}</div>
    </div>
  );
}
