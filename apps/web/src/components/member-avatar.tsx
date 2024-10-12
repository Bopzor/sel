import clsx from 'clsx';
import { Show } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';
import { getLetsConfig } from '../utils/lets-config';

type MemberAvatarProps = {
  genericLetsMember?: boolean;
  member?: { id: string };
  class?: string;
};

export function MemberAvatar(props: MemberAvatarProps) {
  const avatarAdapter = container.resolve(TOKENS.memberAvatar);
  const config = getLetsConfig();

  const url = () => {
    if (props.genericLetsMember) {
      return config()?.logoUrl;
    }

    if (props.member) {
      return avatarAdapter.getAvatarUrl(props.member);
    }
  };

  return <Show when={url()}>{(url) => <img src={url()} class={clsx(props.class, 'shadow')} />}</Show>;
}
