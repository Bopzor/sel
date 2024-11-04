import clsx from 'clsx';
import { Show } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';
import { getLetsConfig } from '../utils/lets-config';

const params = new URLSearchParams({
  default: 'mp',
  size: '80',
});

const defaultAvatarUrl = `https://gravatar.com/avatar?${params.toString()}`;

type MemberAvatarProps = {
  genericLetsMember?: boolean;
  member?: { avatar?: string };
  class?: string;
};

export function MemberAvatar(props: MemberAvatarProps) {
  const { api } = container.resolve(TOKENS.config);
  const config = getLetsConfig();

  const url = () => {
    if (props.genericLetsMember) {
      return config()?.logoUrl;
    }

    if (props.member?.avatar) {
      return `${api.url}/files/${props.member.avatar}`;
    }

    return defaultAvatarUrl;
  };

  return <Show when={url()}>{(url) => <img src={url()} class={clsx(props.class, 'shadow')} />}</Show>;
}
