import { Event, Member, Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/outline';
import { JSX, For, Show } from 'solid-js';

import { Translate } from '../intl/translate';
import { routes } from '../routes';

import { Link } from './link';

type BreadcrumbItem = { label: JSX.Element; href: string; truncate?: true };

export function Breadcrumb(props: { items: Array<BreadcrumbItem | undefined> }) {
  const home = breadcrumb.home();

  return (
    <nav class="row my-5 items-center gap-2">
      <For each={[home, ...props.items]}>
        {(item) => (
          <>
            <Show when={item !== home}>
              <div>
                <Icon path={chevronRight} class="size-4 stroke-2 text-icon" />
              </div>
            </Show>

            <Show when={item} fallback={<Skeleton width={6} />}>
              {(item) => (
                <Link
                  unstyled
                  href={item().href}
                  class="font-medium text-dim"
                  classList={{ truncate: item().truncate }}
                >
                  {item().label}
                </Link>
              )}
            </Show>
          </>
        )}
      </For>
    </nav>
  );
}

function Skeleton(props: { width: number }) {
  return <span class="h-em animate-pulse rounded bg-inverted/10" style={{ width: `${props.width}rem` }} />;
}

const T = Translate.prefix('layout.breadcrumb');

export const breadcrumb = {
  home: (): BreadcrumbItem => ({
    label: <T id="home" />,
    href: routes.home,
  }),

  members: (): BreadcrumbItem => ({
    label: <T id="members" />,
    href: routes.members.list,
  }),

  member: (member: Member): BreadcrumbItem => ({
    label: [member.firstName, member.lastName].join(' '),
    href: routes.members.member(member.id),
    truncate: true,
  }),

  requests: (): BreadcrumbItem => ({
    label: <T id="requests" />,
    href: routes.requests.list,
  }),

  request: (request: Request): BreadcrumbItem => ({
    label: request.title,
    href: routes.requests.request(request.id),
    truncate: true,
  }),

  createRequest: (): BreadcrumbItem => ({
    label: <T id="createRequest" />,
    href: routes.requests.create,
  }),

  editRequest: (request: Request): BreadcrumbItem => ({
    label: <T id="editRequest" />,
    href: routes.requests.edit(request.id),
  }),

  events: (): BreadcrumbItem => ({
    label: <T id="events" />,
    href: routes.events.list,
  }),

  event: (event: Event): BreadcrumbItem => ({
    label: event.title,
    href: routes.events.details(event.id),
    truncate: true,
  }),
};
