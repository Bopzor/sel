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
import { ComponentProps, createSignal, JSX, Show } from 'solid-js';

import { Button } from '../../components/button';
import { Collapse } from '../../components/collapse';
import { Link } from '../../components/link';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { InformationForm } from '../information/information-form';

import { CreateMessageTypeSelector } from './create-message-type-selector';
import { Information } from './information';

const T = Translate.prefix('home');

export default function HomePage() {
  const [resourceCreationState, setResourceCreationState] = createSignal<
    'type-selector' | 'information' | 'news'
  >();

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

        <div class="grow">
          <div class="col gap-6">
            <div class="row items-center justify-between gap-4">
              <h2 class="typo-h1">
                <T id="information.title" />
              </h2>

              <Button
                variant={resourceCreationState() === undefined ? 'primary' : 'secondary'}
                onClick={() => {
                  setResourceCreationState(
                    resourceCreationState() === undefined ? 'type-selector' : undefined,
                  );
                }}
              >
                <Show
                  when={resourceCreationState() === undefined}
                  fallback={<Translate id="common.cancel" />}
                >
                  <T id="createMessage.cta" />
                </Show>
              </Button>
            </div>

            <div>
              <Collapse open={resourceCreationState() === 'type-selector'}>
                <CreateMessageTypeSelector
                  onCreateInformation={() => setResourceCreationState('information')}
                  onCreateNews={() => setResourceCreationState('news')}
                />
              </Collapse>

              <Show when={resourceCreationState() === 'information' || resourceCreationState() === 'news'}>
                <InformationForm
                  isPin={resourceCreationState() === 'news'}
                  onSubmitted={() => setResourceCreationState(undefined)}
                  class="ms-10"
                />
              </Show>
            </div>

            <Information />
          </div>
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
