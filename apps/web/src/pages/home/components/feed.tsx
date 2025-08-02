import { FeedItem as FeedItemType, LightMember, Message as MessageType } from '@sel/shared';
import { useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { calendar, chatBubbleBottomCenterText, handRaised } from 'solid-heroicons/solid';
import { ComponentProps, For, JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { Link } from 'src/components/link';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { Message } from 'src/components/message';
import { FormattedRelativeDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.home.feed');

export function Feed() {
  const feedQuery = useQuery(() => apiQuery('getFeed', {}));

  const feedProps = ([type, entity]: FeedItemType): ComponentProps<typeof FeedItem> => {
    if (type === 'request') {
      return {
        type,
        member: entity.requester,
        date: entity.publishedAt,
        title: entity.title,
        message: entity.message,
        link: routes.requests.details(entity.id),
      };
    }

    if (type === 'event') {
      return {
        type,
        member: entity.organizer,
        date: entity.publishedAt,
        title: entity.title,
        message: entity.message,
        link: routes.events.details(entity.id),
      };
    }

    if (type === 'information') {
      return {
        type,
        member: entity.author,
        date: entity.publishedAt,
        title: entity.title,
        message: entity.message,
        link: routes.information.details(entity.id),
      };
    }

    return type;
  };

  return (
    <div class="col flex-1">
      <h1 class="mb-4 row items-center justify-between gap-4">
        <T id="title" />
      </h1>

      <For each={feedQuery.data}>{(data) => <FeedItem {...feedProps(data)} />}</For>
    </div>
  );
}

function FeedItem(props: {
  type: FeedItemType[0];
  member?: LightMember;
  date: string;
  title: JSX.Element;
  message: MessageType;
  link: string;
}) {
  const iconMap = {
    request: handRaised,
    event: calendar,
    information: chatBubbleBottomCenterText,
  };

  return (
    <div class="group row">
      <div class="mr-2 col items-center sm:mr-4">
        <div class="rounded-full border-2 border-primary/50 bg-neutral p-1.5 sm:p-2">
          <Dynamic component={Icon} path={iconMap[props.type]} class="size-6 text-primary" />
        </div>
        <div class="flex-1 border-l-2 border-primary/50" />
      </div>

      <Link href={props.link} class="mt-2 mb-6 flex-1 group-last-of-type:mb-0">
        <section>
          <header class={card.header({ class: 'col justify-between gap-1 sm:row sm:gap-4' })}>
            <h2 class={card.title()}>
              <T id="itemTitle" values={{ type: <T id={`types.${props.type}`} />, title: props.title }} />
            </h2>

            <div class="text-xs text-nowrap text-dim sm:self-end">
              <FormattedRelativeDate date={props.date} />
            </div>
          </header>

          <div class={card.content()}>
            <MemberAvatarName
              member={props.member}
              classes={{ root: 'mb-4', name: 'text-lg' }}
              link={false}
            />
            <Message class="line-clamp-6" message={props.message} />
          </div>
        </section>
      </Link>
    </div>
  );
}
