import { Member } from '@sel/shared';
import clsx from 'clsx';
import { Component, Show } from 'solid-js';

const params = new URLSearchParams({
  default: 'mp',
  size: '80',
});

type MemberAvatarProps = {
  member?: Pick<Member, 'id'>;
  class?: string;
};

export const MemberAvatar: Component<MemberAvatarProps> = (props) => {
  const url = () => {
    const memberId = props.member?.id;

    if (memberId) {
      return `/api/members/${memberId}/avatar?${params}`;
    }
  };

  return <Show when={url()}>{(url) => <img src={url()} class={clsx(props.class, 'shadow')} />}</Show>;
};
