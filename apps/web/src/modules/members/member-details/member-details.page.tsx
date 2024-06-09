import { Member } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';

import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';

import { ContactInformation } from './contact-information';
import { MemberBio } from './member-bio';
import { MemberInterests } from './member-interests';
import { MemberMap } from './member-map';
import { MemberNotFound } from './member-not-found';

const T = Translate.prefix('members');

export default function MemberDetailsPage() {
  const memberApi = container.resolve(TOKENS.memberApi);
  const { memberId } = useParams<{ memberId: string }>();

  const [member] = createResource(memberId, async (memberId) => {
    return memberApi.getMember(memberId);
  });

  return (
    <>
      <Breadcrumb items={[breadcrumb.members(), member.latest && breadcrumb.member(member.latest)]} />

      <Show when={member()}>{(member) => <MemberDetails member={member()} />}</Show>

      <Show when={!member()}>
        <MemberNotFound />
      </Show>
    </>
  );
}

function MemberDetails(props: { member: Member }) {
  return (
    <div class="col gap-8">
      <div class="card p-4 md:p-8">
        <div class="row items-center gap-6">
          <MemberAvatarName
            member={props.member}
            classes={{ avatar: '!size-16', name: 'text-xl font-semibold' }}
          />
        </div>

        <hr class="my-4 md:my-6" />

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ContactInformation member={props.member} />
          <MemberMap member={props.member} />
        </div>
      </div>

      <Show when={props.member.bio !== undefined}>
        <div class="max-w-4xl">
          <h2 class="mb-4">
            <T id="bio" />
          </h2>
          <MemberBio member={props.member} />
        </div>
      </Show>

      <Show when={props.member.interests.length > 0}>
        <div class="max-w-4xl">
          <h2 class="mb-4">
            <T id="interests.title" />
          </h2>
          <MemberInterests member={props.member} />
        </div>
      </Show>
    </div>
  );
}
