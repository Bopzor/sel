import { Member } from '@sel/shared';
import md5 from 'crypto-js/md5';
import { Component } from 'solid-js';

const params = new URLSearchParams({
  default: 'mp',
  size: '64',
});

export const gravatarUrl = (email: string) => {
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?${params}`;
};

export const MemberAvatar: Component<{ member: Member; class?: string }> = (props) => {
  return <img class={props.class} src={gravatarUrl(props.member.email)} />;
};
