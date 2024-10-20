import { type Information } from '@sel/shared';
import { createQuery } from '@tanstack/solid-query';
import { For, Show } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichText } from '../../components/rich-text';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';

const T = Translate.prefix('home.information');

export function Information() {
  const api = container.resolve(TOKENS.api);

  const query = createQuery(() => ({
    queryKey: ['listInformation'],
    queryFn: () => api.listInformation({}),
  }));

  const pinMessages = () => {
    return query.data?.pin ?? [];
  };

  const notPinMessages = () => {
    return query.data?.notPin ?? [];
  };

  return (
    <>
      <For each={pinMessages()}>{(message) => <InformationItem message={message} />}</For>

      <Show when={pinMessages().length > 0 && notPinMessages().length > 0}>
        <hr class="my-4" />
      </Show>

      <For each={notPinMessages()} fallback={<T id="informationEmpty" />}>
        {(message) => <InformationItem message={message} />}
      </For>
    </>
  );
}

function InformationItem(props: { message: Information }) {
  const authorComponentProps = (): DynamicProps<'div' | typeof Link> => {
    const author = props.message.author;

    if (author === undefined) {
      return { component: 'div' };
    }

    return {
      component: Link,
      unstyled: true,
      href: routes.members.member(author.id),
    };
  };

  return (
    <div class="col gap-3">
      <div class="row items-end justify-between gap-4">
        <Dynamic class="row items-center gap-2" {...authorComponentProps()}>
          <MemberAvatarName
            genericLetsMember={props.message.author === undefined}
            member={props.message.author}
          />
        </Dynamic>

        <div class="text-sm text-dim">
          <T id="publishedAt" values={{ date: new Date(props.message.publishedAt) }} />
        </div>
      </div>

      <RichText class="col ms-10 flex-1 gap-2 rounded-lg bg-neutral p-6">{props.message.body}</RichText>
    </div>
  );
}
