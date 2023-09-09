import { Member } from '@sel/shared';
import clsx from 'clsx';
import { Component } from 'solid-js';

import { MemberAvatar } from './member-avatar';

type MemberAvatarNameProps = {
  member: Member;
  size?: 'large';
  class?: string;
};

export const MemberAvatarName: Component<MemberAvatarNameProps> = (props) => {
  return (
    <>
      <MemberAvatar
        member={props.member}
        class={clsx('h-8 w-8 rounded-full border', props.size === 'large' && 'h-12 w-12')}
      />
      <span class="font-medium">
        {props.member.firstName} {props.member.lastName}
      </span>
    </>
  );
};
