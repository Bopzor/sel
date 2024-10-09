import { LightMember } from '@sel/shared';
import clsx from 'clsx';
import { Show } from 'solid-js';

import { fullName } from '../modules/members/full-name';
import { getLetsConfig } from '../utils/lets-config';

import { MemberAvatar } from './member-avatar';

type MemberAvatarNameProps = {
  genericLetsMember?: boolean;
  member?: LightMember;
  classes?: Partial<{
    avatar: string;
    name: string;
  }>;
};

export function MemberAvatarName(props: MemberAvatarNameProps) {
  const config = getLetsConfig();

  return (
    <>
      <MemberAvatar
        genericLetsMember={props.genericLetsMember}
        member={props.member}
        class={clsx(props.classes?.avatar, 'size-8 rounded-full')}
      />

      <span class={clsx(props.classes?.name, 'truncate font-medium')}>
        <Show when={props.genericLetsMember} fallback={props.member ? fullName(props.member) : ''}>
          {config.latest?.letsName}
        </Show>
      </span>
    </>
  );
}
