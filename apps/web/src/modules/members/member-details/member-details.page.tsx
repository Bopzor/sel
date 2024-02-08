import { Member } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';

import { BackLink } from '../../../components/back-link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { container } from '../../../infrastructure/container';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';

import { MemberInformation } from './member-information';
import { MemberMap } from './member-map';
import { MemberNotFound } from './member-not-found';

export default function MemberDetailsPage() {
  const memberApi = container.resolve(TOKENS.memberApi);
  const { memberId } = useParams<{ memberId: string }>();

  const [member] = createResource(memberId, async (memberId) => {
    return memberApi.getMember(memberId);
  });

  return (
    <>
      <BackLink href={routes.members.list} />

      <Show when={member()}>{(member) => <MemberDetails member={member()} />}</Show>

      <Show when={!member()}>
        <MemberNotFound />
      </Show>
    </>
  );
}

function MemberDetails(props: { member: Member }) {
  return (
    <div class="card p-4 md:p-8">
      <div class="row items-center gap-6">
        <MemberAvatarName
          member={props.member}
          classes={{ avatar: '!size-16', name: 'text-xl font-semibold' }}
        />
      </div>

      <hr class="my-4 md:my-6" />

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <MemberInformation member={props.member} />
        <MemberMap member={props.member} />
      </div>
    </div>
  );
}
