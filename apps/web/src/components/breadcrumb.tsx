import { useParams } from '@solidjs/router';
import { useQuery, UseQueryResult } from '@tanstack/solid-query';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';
import { Index, JSX } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { createTranslate } from 'src/intl/translate';

import { Link } from './link';
import { Query } from './query';
import { TextSkeleton } from './skeleton';

export function Breadcrumb(props: { crumbs: Array<JSX.Element>; class?: string }) {
  return (
    <nav class={clsx('row items-center gap-2', props.class)}>
      <Index each={props.crumbs}>
        {(crumb, index) => (
          <>
            {index > 0 && <Chevron />}
            {crumb()}
          </>
        )}
      </Index>
    </nav>
  );
}

function Chevron() {
  return (
    <div>
      <Icon path={chevronRight} class="size-4 stroke-2 text-dim" />
    </div>
  );
}

function Crumb(props: { truncate?: boolean; label: JSX.Element; link: string }): JSX.Element {
  return (
    <Link href={props.link} classList={{ truncate: props.truncate }}>
      {props.label}
    </Link>
  );
}

function QueryCrumb<T>(props: {
  truncate?: boolean;
  query: UseQueryResult<T>;
  label: (data: T) => JSX.Element;
  link: (data: T) => string;
}): JSX.Element {
  return (
    <Query query={props.query} error={() => '-'} pending={<TextSkeleton width={12} />}>
      {(data) => <Crumb truncate={props.truncate} label={props.label(data())} link={props.link(data())} />}
    </Query>
  );
}

const T = createTranslate('layout.breadcrumb');

export const breadcrumbs = {
  home: () => <Crumb label={<T id="home" />} link={routes.home} />,

  information: () => {
    const params = useParams<{ informationId: string }>();
    const query = useQuery(() => apiQuery('getInformation', { path: params }));

    return (
      <QueryCrumb
        truncate
        query={query}
        label={(information) => information.title}
        link={(information) => routes.information.details(information.id)}
      />
    );
  },

  createInformation: () => {
    return <Crumb label={<T id="createInformation" />} link={routes.information.create} />;
  },

  editInformation: () => {
    const { informationId } = useParams<{ informationId: string }>();

    return <Crumb label={<T id="editInformation" />} link={routes.information.edit(informationId)} />;
  },

  members: () => {
    return <Crumb label={<T id="members" />} link={routes.members.list} />;
  },

  member: () => {
    const params = useParams<{ memberId: string }>();
    const query = useQuery(() => apiQuery('getMember', { path: params }));

    return (
      <QueryCrumb
        truncate
        query={query}
        label={(member) => [member.firstName, member.lastName].join(' ')}
        link={(member) => routes.members.details(member.id)}
      />
    );
  },

  requests: () => {
    return <Crumb label={<T id="requests" />} link={routes.requests.list} />;
  },

  request: () => {
    const params = useParams<{ requestId: string }>();
    const query = useQuery(() => apiQuery('getRequest', { path: params }));

    return (
      <QueryCrumb
        truncate
        query={query}
        label={(request) => request.title}
        link={(request) => routes.requests.details(request.id)}
      />
    );
  },

  createRequest: () => {
    return <Crumb label={<T id="createRequest" />} link={routes.requests.create} />;
  },

  editRequest: () => {
    const params = useParams<{ requestId: string }>();

    return <Crumb label={<T id="editRequest" />} link={routes.requests.edit(params.requestId)} />;
  },

  events: () => {
    return <Crumb label={<T id="events" />} link={routes.events.list} />;
  },

  event: () => {
    const params = useParams<{ eventId: string }>();
    const query = useQuery(() => apiQuery('getEvent', { path: params }));

    return (
      <QueryCrumb
        truncate
        query={query}
        label={(event) => event.title}
        link={(event) => routes.events.details(event.id)}
      />
    );
  },

  createEvent: () => {
    return <Crumb label={<T id="createEvent" />} link={routes.events.create} />;
  },

  editEvent: () => {
    const params = useParams<{ eventId: string }>();

    return <Crumb label={<T id="editEvent" />} link={routes.events.edit(params.eventId)} />;
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

  adminMember: () => {
    const params = useParams<{ memberId: string }>();
    const query = useQuery(() => apiQuery('getMemberAdmin', { path: params }));

    return (
      <QueryCrumb
        truncate
        query={query}
        label={(member) => [member.firstName, member.lastName].join(' ')}
        link={(member) => routes.admin.memberDetails(member.id)}
      />
    );
  },
};
