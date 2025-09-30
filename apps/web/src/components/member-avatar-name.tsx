import { Member } from '@sel/shared';
import clsx from 'clsx';
import { Show } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { routes } from 'src/application/routes';

import { Link } from './link';

export function MemberAvatarName(props: {
  short?: boolean;
  link?: boolean;
  number?: boolean;
  member?: { id: string; firstName: string; lastName: string; number?: number; avatar?: string };
  classes?: Partial<Record<'root' | 'avatar' | 'name', string>>;
}) {
  const element = (): DynamicProps<'div' | typeof Link> => {
    if (props.link == false || !props.member) {
      return { component: 'div' };
    }

    return {
      component: Link,
      href: routes.members.details(props.member?.id),
    };
  };

  return (
    <Dynamic {...element()} class={clsx('row max-w-fit items-center gap-2', props.classes?.root)}>
      <MemberAvatar
        member={props.member}
        class={clsx('size-8 rounded-full shadow-sm', props.classes?.avatar)}
      />

      <div class={props.classes?.name}>{memberName(props.member, props.short)}</div>

      <Show when={props.number && props.member}>
        {(member) => <div class="text-sm text-dim">({member().number})</div>}
      </Show>
    </Dynamic>
  );
}

export function memberName(member?: Pick<Member, 'firstName' | 'lastName'>, short?: boolean) {
  if (!member) {
    return '';
  }

  return [member.firstName, short ? member.lastName[0] + '.' : member.lastName].join(' ');
}

const params = new URLSearchParams({
  default: 'mp',
  size: '80',
});

const defaultAvatarUrl = `https://gravatar.com/avatar?${params.toString()}`;

export function MemberAvatar(props: { member?: { avatar?: string }; class?: string }) {
  const url = () => {
    if (props.member?.avatar) {
      return `/api/files/${props.member.avatar}`;
    }

    return defaultAvatarUrl;
  };

  return <img src={url()} class={clsx('aspect-square bg-neutral object-cover', props.class)} />;
}
