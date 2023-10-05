import { Member } from '@sel/shared';
import md5 from 'crypto-js/md5';
import { Component } from 'solid-js';

const params = new URLSearchParams({
  default: 'mp',
  size: '64',
});

export const gravatarUrl = (email = '') => {
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?${params}`;
};

type MemberAvatarProps = {
  member?: Member;
  class?: string;
};

export const MemberAvatar: Component<MemberAvatarProps> = (props) => {
  return <img src={gravatarUrl(props.member?.email)} class={props.class} />;
};
