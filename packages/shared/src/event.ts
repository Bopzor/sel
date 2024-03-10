import { z } from 'zod';

import { PhoneNumber } from './phone-number';

export enum EventKind {
  internal = 'internal',
  external = 'external',
}

export type EventsListItem = {
  id: string;
  title: string;
  kind: EventKind;
  date?: string;
};

export type Event = {
  id: string;
  title: string;
  body: string;
  kind: EventKind;
  date?: string;
  location?: string;
  organizer: EventOrganizer;
  participants: EventParticipant[];
};

type EventOrganizer = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumbers: PhoneNumber[];
};

type EventParticipant = {
  id: string;
  firstName: string;
  lastName: string;
  participation: EventParticipation;
};

export const createEventBodySchema = z.object({
  title: z.string().trim(),
  body: z.string().trim(),
  date: z.string().datetime().optional(),
  location: z.string().trim().optional(),
  kind: z.enum(['internal', 'external']),
});

export type CreateEventBody = z.infer<typeof createEventBodySchema>;

export const updateEventBodySchema = z.object({
  title: z.string().trim(),
  body: z.string().trim(),
  date: z.string().datetime().optional(),
  location: z.string().trim().optional(),
  kind: z.enum(['internal', 'external']),
});

export type UpdateEventBody = z.infer<typeof updateEventBodySchema>;

const eventParticipationSchema = z.enum(['yes', 'no']);
export type EventParticipation = z.infer<typeof eventParticipationSchema>;

export const setEventParticipationBodySchema = z.object({
  participation: eventParticipationSchema.nullable(),
});

export type SetEventParticipationBody = z.infer<typeof setEventParticipationBodySchema>;
