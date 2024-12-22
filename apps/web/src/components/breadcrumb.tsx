import { Event, Member, Request } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/outline';
import { For, JSX, Show } from 'solid-js';

import { routes } from 'src/application/routes';
import { createTranslate } from 'src/intl/translate';

import { Link } from './link';
import { TextSkeleton } from './skeleton';

type BreadcrumbItem = { label: JSX.Element; href: string; truncate?: true };

export function Breadcrumb(props: { items: Array<BreadcrumbItem | undefined> }) {
  const home = breadcrumb.home();

  return (
    <nav class="row mb-6 items-center gap-2">
      <For each={[home, ...props.items]}>
        {(item) => (
          <>
            <Show when={item !== home}>
              <div>
                <Icon path={chevronRight} class="size-4 stroke-2 text-dim" />
              </div>
            </Show>

            <Show when={item} fallback={<TextSkeleton width={10} />}>
              {(item) => (
                <Link
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

const T = createTranslate('layout.breadcrumb');

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
    href: routes.members.details(member.id),
    truncate: true,
  }),

  requests: (): BreadcrumbItem => ({
    label: <T id="requests" />,
    href: routes.requests.list,
  }),

  request: (request: Request): BreadcrumbItem => ({
    label: request.title,
    href: routes.requests.details(request.id),
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

  createEvent: (): BreadcrumbItem => ({
    label: <T id="createEvent" />,
    href: routes.events.create,
  }),

  editEvent: (event: Event): BreadcrumbItem => ({
    label: <T id="editEvent" />,
    href: routes.events.edit(event.id),
  }),

  interests: (): BreadcrumbItem => ({
    label: <T id="interests" />,
    href: routes.interests,
  }),

  profile: (): BreadcrumbItem => ({
    label: <T id="profile" />,
    href: routes.profile.edition,
  }),

  admin: (): BreadcrumbItem => ({
    label: <T id="admin" />,
    href: routes.admin.index,
  }),

  adminMembers: (): BreadcrumbItem => ({
    label: <T id="adminMembers" />,
    href: routes.admin.memberList,
  }),
};
