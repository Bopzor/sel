import { Member } from '@sel/shared';
import { Component } from 'solid-js';

import { MemberAvatar } from './member-avatar';

type MemberAvatarNameProps = {
  member: Member;
  class?: string;
};

export const MemberAvatarName: Component<MemberAvatarNameProps> = (props) => {
  return (
    <>
      <MemberAvatar class="mr-2 inline-block h-8 w-8 rounded-full border" member={props.member} />
      <span class="align-middle">
        {props.member.firstName} {props.member.lastName}
      </span>
    </>
  );
};
