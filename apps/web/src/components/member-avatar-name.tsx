import { Member } from '@sel/shared';
import clsx from 'clsx';
import { Component } from 'solid-js';

import { MemberAvatar } from './member-avatar';

type MemberAvatarNameProps = {
  member: Member;
  classes?: Partial<{
    avatar: string;
    name: string;
  }>;
};

export const MemberAvatarName: Component<MemberAvatarNameProps> = (props) => {
  return (
    <>
      <MemberAvatar member={props.member} class={clsx(props.classes?.avatar, 'h-8 w-8 rounded-full')} />

      <span class={clsx(props.classes?.name, 'font-medium')}>
        {props.member.firstName} {props.member.lastName}
      </span>
    </>
  );
};
