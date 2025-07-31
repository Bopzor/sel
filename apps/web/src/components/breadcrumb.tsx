import { useParams } from '@solidjs/router';
import { useQuery, UseQueryResult } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';
import { JSX, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { createTranslate } from 'src/intl/translate';

import { Link } from './link';
import { TextSkeleton } from './skeleton';

export function Breadcrumb(props: { children: JSX.Element }) {
  return <nav class="mb-6 row items-center gap-2">{props.children}</nav>;
}

function Crumb(props: { first?: boolean; truncate?: boolean; label: JSX.Element; link: string }): JSX.Element;

function Crumb<T>(props: {
  first?: boolean;
  truncate?: boolean;
  query: UseQueryResult<T>;
  label: JSX.Element | ((data: T) => JSX.Element);
  link: string | ((data: T) => string);
}): JSX.Element;

function Crumb<T>(props: {
  first?: boolean;
  truncate?: boolean;
  query?: UseQueryResult<T>;
  label: JSX.Element | ((data: T) => JSX.Element);
  link: string | ((data: T) => string);
}) {
  const link = (data?: T) => {
    return typeof props.link === 'function' ? props.link(data as T) : props.link;
  };

  const label = (data?: T) => {
    return typeof props.label === 'function' ? props.label(data as T) : props.label;
  };

  const chevron = (
    <Show when={!props.first}>
      <div>
        <Icon path={chevronRight} class="size-4 stroke-2 text-dim" />
      </div>
    </Show>
  );

  return (
    <Show
      when={props.query}
      fallback={
        <>
          {chevron}
          <Link href={link()}>{label()}</Link>
        </>
      }
    >
      {chevron}

      <Show when={props.query?.isSuccess ? props.query.data : false} fallback={<TextSkeleton width={12} />}>
        {(data) => (
          <Link href={link(data())} classList={{ truncate: props.truncate }}>
            {label(data())}
          </Link>
        )}
      </Show>
    </Show>
  );
}

const T = createTranslate('layout.breadcrumb');

export const breadcrumbs = {
  home: () => <Crumb first label={<T id="home" />} link={routes.home} />,

  information: () => {
    const { informationId } = useParams<{ informationId: string }>();
    const query = useQuery(() => apiQuery('getInformation', { path: { informationId } }));

    return (
      <Crumb
        query={query}
        label={(information) => information.title}
        link={(information) => routes.information.details(information.id)}
      />
    );
  },

  members: () => {
    return <Crumb label={<T id="members" />} link={routes.members.list} />;
  },

  member: () => {
    const { memberId } = useParams<{ memberId: string }>();
    const query = useQuery(() => apiQuery('getMember', { path: { memberId } }));

    return (
      <Crumb
        truncate
        query={query}
        label={(member) => [member.firstName, member.lastName].join(' ')}
        link={routes.members.details(memberId)}
      />
    );
  },

  requests: () => {
    return <Crumb label={<T id="requests" />} link={routes.requests.list} />;
  },

  request: () => {
    const { requestId } = useParams<{ requestId: string }>();
    const query = useQuery(() => apiQuery('getRequest', { path: { requestId } }));

    return (
      <Crumb
        truncate
        query={query}
        label={(request) => request.title}
        link={routes.requests.details(requestId)}
      />
    );
  },

  createRequest: () => {
    return <Crumb label={<T id="createRequest" />} link={routes.requests.create} />;
  },

  editRequest: () => {
    const { requestId } = useParams<{ requestId: string }>();

    return <Crumb label={<T id="editRequest" />} link={routes.requests.edit(requestId)} />;
  },

  events: () => {
    return <Crumb label={<T id="events" />} link={routes.events.list} />;
  },

  event: () => {
    const { eventId } = useParams<{ eventId: string }>();
    const query = useQuery(() => apiQuery('getEvent', { path: { eventId } }));

    return (
      <Crumb truncate query={query} label={(event) => event.title} link={routes.events.details(eventId)} />
    );
  },

  createEvent: () => {
    return <Crumb label={<T id="createEvent" />} link={routes.events.create} />;
  },

  editEvent: () => {
    const { eventId } = useParams<{ eventId: string }>();

    return <Crumb label={<T id="editEvent" />} link={routes.events.edit(eventId)} />;
  },

  interests: () => {
    return <Crumb label={<T id="interests" />} link={routes.interests} />;
  },

  profile: () => {
    return <Crumb label={<T id="profile" />} link={routes.profile.edition} />;
  },

  profileAddress: () => {
    return <Crumb label={<T id="profileAddress" />} link={routes.profile.address} />;
  },

  profileTransactions: () => {
    return <Crumb label={<T id="profileTransactions" />} link={routes.profile.transactions} />;
  },

  profileSettings: () => {
    return <Crumb label={<T id="profileSettings" />} link={routes.profile.settings} />;
  },

  profileSignOut: () => {
    return <Crumb label={<T id="profileSignOut" />} link={routes.profile.signOut} />;
  },

  admin: () => {
    return <Crumb label={<T id="admin" />} link={routes.admin.index} />;
  },

  adminMembers: () => {
    return <Crumb label={<T id="adminMembers" />} link={routes.admin.memberList} />;
  },
};
