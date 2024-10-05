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

import { authenticatedMember } from '../../app-context';
import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { RichText } from '../../components/rich-text';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';
import { fullName } from '../members/full-name';
import { PublicMessageForm } from '../public-messages/public-message-form';

const T = Translate.prefix('home');

export default function HomePage() {
  return (
    <div>
      <PreviewBanner />

      <div class="row items-start gap-8 py-16">
        <div class="grid max-w-sm grid-cols-1 gap-6">
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
        <Icon path={props.icon} class="size-8 text-gray-400 transition-colors group-hover:text-primary" />
      </div>
      <div>
        <div class="text-xl font-semibold">{props.label}</div>
        <div class="mt-1 text-dim group-hover:text-primary">{props.description}</div>
      </div>
    </Link>
  );
}

function News() {
  const [messageFormVisible, setMessageFormVisible] = createSignal(false);
  const publicMessageApi = container.resolve(TOKENS.publicMessageApi);
  const [messages, { refetch }] = createResource(() => publicMessageApi.listPublicMessages());

  return (
    <div class="col gap-6">
      <div class="row items-center justify-between gap-4">
        <h2 class="typo-h1">
          <T id="news.title" />
        </h2>

        <Button classList={{ hidden: messageFormVisible() }} onClick={() => setMessageFormVisible(true)}>
          <T id="news.createPublicMessage" />
        </Button>
      </div>

      <Show when={messageFormVisible()}>
        <div class="col gap-3">
          <div class="row items-center gap-2">
            <MemberAvatarName member={authenticatedMember()} />
          </div>

          <PublicMessageForm
            onCancel={() => setMessageFormVisible(false)}
            onSubmitted={() => {
              setMessageFormVisible(false);
              void refetch();
            }}
            class="ms-10"
          />
        </div>
      </Show>

      <For each={messages.latest?.pin}>
        {(message) => (
          <div class="rounded-lg">
            <Show when={message.author}>{(author) => <div>{fullName(author())}</div>}</Show>
            <RichText>{message.body}</RichText>
          </div>
        )}
      </For>

      <For each={messages.latest?.notPin}>
        {(message) => (
          <div class="col gap-3">
            <div class="row items-end justify-between gap-4">
              <Show when={message.author}>
                {(author) => (
                  <Link unstyled href={routes.members.member(author().id)} class="row items-center gap-2">
                    <MemberAvatarName member={author()} />
                  </Link>
                )}
              </Show>

              <div class="text-sm text-dim">
                <T id="news.publishedAt" values={{ date: new Date(message.publishedAt) }} />
              </div>
            </div>

            <RichText class="col ms-10 flex-1 gap-2 rounded-lg bg-white p-6">{message.body}</RichText>
          </div>
        )}
      </For>
    </div>
  );
}
