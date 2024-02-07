import { Member } from '@sel/shared';
import clsx from 'clsx';
import { Component, Show } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

type MemberAvatarProps = {
  member?: Pick<Member, 'id'>;
  class?: string;
};

export const MemberAvatar: Component<MemberAvatarProps> = (props) => {
  const avatarAdapter = container.resolve(TOKENS.memberAvatar);

  const url = () => {
    if (props.member) {
      return avatarAdapter.getAvatarUrl(props.member);
    }
  };

  return <Show when={url()}>{(url) => <img src={url()} class={clsx(props.class, 'shadow')} />}</Show>;
};
