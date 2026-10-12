import {
  createEventBodySchema,
  EventKind,
  listEventsQuerySchema,
  sendEventNotificationBodySchema,
  setEventParticipationBodySchema,
  updateEventBodySchema,
  type Event,
  type EventOrganizer,
  type EventsListItem,
} from '@sel/shared';
import { createId } from '@sel/utils';

import { demo } from '../demo';

export const demoEventRoutes = [
  demo.route('GET', '/events', ({ state, query, member }) => {
    const {
      search,
      timing,
      organizerId,
      participantId,
      includeUndated,
      committeeMeeting,
      after,
      before,
      year,
      ...page
    } = listEventsQuerySchema.parse(query);
    const now = new Date().toISOString();

    const participates = (event: demo.Event, memberId: string) => {
      return state.eventParticipations.some(
        (participation) =>
          participation.eventId === event.id &&
          participation.memberId === memberId &&
          participation.participation === 'yes',
      );
    };

    const events = state.events
      .filter(({ title, message }) => search === undefined || demo.matchesSearch(search, title, message))
      .filter(({ date }) => timing !== 'upcoming' || (date === undefined ? includeUndated : date >= now))
      .filter(({ date }) => timing !== 'past' || (date !== undefined && date < now))
      .filter((event) => committeeMeeting === undefined || event.committeeMeeting === committeeMeeting)
      .filter(({ date }) => after === undefined || (date !== undefined && date >= after.toISOString()))
      .filter(({ date }) => before === undefined || (date !== undefined && date < before.toISOString()))
      .filter((event) => organizerId === undefined || event.organizerId === organizerId)
      .filter((event) => participantId === undefined || participates(event, participantId))
      .filter(
        ({ date }) => year === undefined || (date !== undefined && new Date(date).getFullYear() === year),
      )
      .toSorted(
        (a, b) => compareDates(a, b, timing === 'upcoming') || b.createdAt.localeCompare(a.createdAt),
      );

    return demo.paginated(
      events.map((event) => serializeEventListItem(state, event, member().id)),
      page,
    );
  }),

  demo.route('GET', '/events/:eventId', ({ state, params }) => {
    return demo.json(serializeEvent(state, findEvent(state, params.eventId)));
  }),

  demo.route('POST', '/events', ({ state, body, member }) => {
    const {
      title,
      body: text,
      fileIds,
      date,
      location,
      kind,
      committeeMeeting = false,
    } = createEventBodySchema.parse(body);
    const id = createId();

    if (committeeMeeting && !member().committeeMember) {
      throw new demo.Error(403, 'Member must be a committee member');
    }

    if (committeeMeeting && kind !== EventKind.internal) {
      throw new demo.Error(400, 'A committee meeting must be an internal event');
    }

    state.events.push({
      id,
      title,
      message: demo.createMessage(state, text, fileIds),
      kind,
      committeeMeeting,
      date: date ?? undefined,
      location: location ?? undefined,
      organizerId: member().id,
      createdAt: new Date().toISOString(),
    });

    return demo.created(id);
  }),

  demo.route('PUT', '/events/:eventId', (context) => {
    const event = findOrganizerEvent(context);
    const { title, body, fileIds, date, location, kind, committeeMeeting } = updateEventBodySchema.parse(
      context.body,
    );

    if (committeeMeeting && !context.member().committeeMember) {
      throw new demo.Error(403, 'Member must be a committee member');
    }

    if ((committeeMeeting ?? event.committeeMeeting) && (kind ?? event.kind) !== EventKind.internal) {
      throw new demo.Error(400, 'A committee meeting must be an internal event');
    }

    event.title = title;
    event.message = demo.createMessage(context.state, body, fileIds);
    event.kind = kind ?? event.kind;
    event.committeeMeeting = committeeMeeting ?? event.committeeMeeting;

    if (date !== undefined) {
      event.date = date ?? undefined;
    }

    if (location !== undefined) {
      event.location = location ?? undefined;
    }

    return demo.noContent();
  }),

  // The demo sends no notification.
  demo.route('POST', '/events/:eventId/notify', (context) => {
    findOrganizerEvent(context);
    sendEventNotificationBodySchema.parse(context.body);

    return demo.noContent();
  }),

  demo.route('PUT', '/events/:eventId/participation', ({ state, params, body, member }) => {
    const event = findEvent(state, params.eventId);
    const { participation } = setEventParticipationBodySchema.parse(body);
    const memberId = member().id;

    state.eventParticipations = state.eventParticipations.filter(
      (participation) => participation.eventId !== event.id || participation.memberId !== memberId,
    );

    if (participation !== null) {
      state.eventParticipations.push({
        id: createId(),
        eventId: event.id,
        memberId,
        participation,
        date: new Date().toISOString(),
      });
    }

    return demo.noContent();
  }),
];

function findEvent(state: demo.State, eventId = '') {
  return state.events.find(({ id }) => id === eventId) ?? demo.notFound('Event');
}

function findOrganizerEvent({ state, params, member }: demo.Context) {
  const event = findEvent(state, params.eventId);

  if (event.organizerId !== member().id) {
    throw new demo.Error(403, 'Member must be the organizer of the event');
  }

  return event;
}

// The upcoming events come soonest first, the others latest first; the events without a date come at the end of
// the upcoming events, at the start of the others.
function compareDates(a: demo.Event, b: demo.Event, upcoming: boolean) {
  if (a.date === undefined || b.date === undefined) {
    return (Number(a.date === undefined) - Number(b.date === undefined)) * (upcoming ? 1 : -1);
  }

  return upcoming ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
}

function serializeOrganizer(state: demo.State, event: demo.Event): EventOrganizer {
  const organizer = demo.findMember(state, event.organizerId);

  return { ...demo.serializeLightMember(organizer), ...demo.serializeMemberContact(organizer) };
}

function participations(state: demo.State, event: demo.Event) {
  return state.eventParticipations.filter(({ eventId }) => eventId === event.id);
}

function serializeEventListItem(state: demo.State, event: demo.Event, memberId: string): EventsListItem {
  return {
    id: event.id,
    title: event.title,
    kind: event.kind,
    committeeMeeting: event.committeeMeeting,
    organizer: serializeOrganizer(state, event),
    date: event.date,
    location: event.location,
    message: event.message,
    participantsCount: participations(state, event).filter(({ participation }) => participation === 'yes')
      .length,
    participation: participations(state, event).find((participation) => participation.memberId === memberId)
      ?.participation,
  };
}

function serializeEvent(state: demo.State, event: demo.Event): Event {
  return {
    id: event.id,
    title: event.title,
    message: event.message,
    kind: event.kind,
    committeeMeeting: event.committeeMeeting,
    date: event.date,
    location: event.location,
    organizer: serializeOrganizer(state, event),
    participants: participations(state, event).map(({ memberId, participation }) => ({
      ...demo.serializeLightMember(demo.findMember(state, memberId)),
      participation,
    })),
  };
}
