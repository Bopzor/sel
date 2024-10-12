import { Information } from '@sel/shared';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import {
  calendar,
  exclamationTriangle,
  handRaised,
  sparkles,
  star,
  users,
  wrench,
} from 'solid-heroicons/solid';
import { ComponentProps, createResource, createSignal, For, JSX, Show } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichText } from '../../components/rich-text';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';
import { InformationForm } from '../information/information-form';

const T = Translate.prefix('home');

export default function HomePage() {
  return (
    <div>
      <PreviewBanner />

      <div class="col lg:row gap-8 py-16 lg:items-start">
        <div class="grid grid-cols-1 gap-6 lg:max-w-sm">
          <LinkCard
            href={routes.members.list}
            label={<T id="members.label" />}
            description={<T id="members.description" />}
            icon={users}
          />

          <LinkCard
            href={routes.requests.list}
            label={<T id="requests.label" />}
            description={<T id="requests.description" />}
            icon={handRaised}
          />

          <LinkCard
            href={routes.events.list}
            label={<T id="events.label" />}
            description={<T id="events.description" />}
            icon={calendar}
          />

          <LinkCard
            href={routes.interests}
            label={<T id="interests.label" />}
            description={<T id="interests.description" />}
            icon={sparkles}
          />

          <LinkCard
            href={routes.assets.home}
            label={<T id="assets.label" />}
            description={<T id="assets.description" />}
            icon={wrench}
            class="!hidden"
          />

          <LinkCard
            href={routes.misc}
            label={<T id="misc.label" />}
            description={<T id="misc.description" />}
            icon={star}
          />
        </div>

        <div class="flex-1">
          <News />
        </div>
      </div>
    </div>
  );
}

function PreviewBanner() {
  return (
    <div class="mt-4 rounded border border-yellow-600 p-4">
      <h2 class="row items-center gap-2">
        <Icon path={exclamationTriangle} class="inline-block size-6 text-yellow-600" />
        Attention
      </h2>

      <p>
        Ce site est en cours de développement, les demandes, événements, et toutes autres informations sont
        des <strong>données de test</strong>. Vous pouvez bien sûr tester en créant des annonces et
        commentaires fictifs.
      </p>

      <p>
        Pour les annonces réelles du SEL, nous continuons à utiliser{' '}
        <a href="https://selonnous.communityforge.net">https://selonnous.communityforge.net</a>.
      </p>
    </div>
  );
}

type LinkCardProps = {
  href: string;
  label: JSX.Element;
  description: JSX.Element;
  icon: ComponentProps<typeof Icon>['path'];
  class?: string;
};

function LinkCard(props: LinkCardProps) {
  return (
    <Link
      unstyled
      href={props.href}
      class={clsx(
        'row group items-center gap-4 rounded-lg border border-primary bg-gradient-to-tl from-primary/0 to-primary/10 px-6 py-4 transition-all hover:bg-primary/10 hover:shadow-lg',
        props.class,
      )}
    >
      <div>
        <Icon
          path={props.icon}
          class="size-8 text-gray-400 transition-colors group-hover:text-primary dark:group-hover:text-text"
        />
      </div>
      <div>
        <div class="text-xl font-semibold">{props.label}</div>
        <div class="mt-1 text-dim group-hover:text-primary dark:group-hover:text-text">
          {props.description}
        </div>
      </div>
    </Link>
  );
}

function News() {
  const [messageFormVisible, setMessageFormVisible] = createSignal(false);
  const informationApi = container.resolve(TOKENS.informationApi);
  const [messages, { refetch }] = createResource(() => informationApi.listInformation());

  const pinMessages = () => {
    return messages.latest?.pin ?? [];
  };

  const notPinMessages = () => {
    return messages.latest?.notPin ?? [];
  };

  return (
    <div class="col gap-6">
      <div class="row items-center justify-between gap-4">
        <h2 class="typo-h1">
          <T id="news.title" />
        </h2>

        <Button classList={{ hidden: messageFormVisible() }} onClick={() => setMessageFormVisible(true)}>
          <T id="news.createInformation" />
        </Button>
      </div>

      <Show when={messageFormVisible()}>
        <InformationForm
          onCancel={() => setMessageFormVisible(false)}
          onSubmitted={() => {
            setMessageFormVisible(false);
            void refetch();
          }}
          class="ms-10"
        />
      </Show>

      <For each={pinMessages()}>{(message) => <InformationItem message={message} />}</For>

      <Show when={pinMessages().length > 0 && notPinMessages.length > 0}>
        <hr class="my-4" />
      </Show>

      <For each={notPinMessages()} fallback={<T id="news.informationEmpty" />}>
        {(message) => <InformationItem message={message} />}
      </For>
    </div>
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
          <T id="news.publishedAt" values={{ date: new Date(props.message.publishedAt) }} />
        </div>
      </div>

      <RichText class="col ms-10 flex-1 gap-2 rounded-lg bg-neutral p-6">{props.message.body}</RichText>
    </div>
  );
}
