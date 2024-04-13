import { z } from 'zod';

import { Address, addressSchema } from './address';
import { Comment } from './comment';
import { PhoneNumber } from './phone-number';

export enum EventKind {
  internal = 'internal',
  external = 'external',
}

export type EventsListItem = {
  id: string;
  title: string;
  kind: EventKind;
  organizer: EventOrganizer;
  date?: string;
};

export type Event = {
  id: string;
  title: string;
  body: string;
  kind: EventKind;
  date?: string;
  location?: Address;
  organizer: EventOrganizer;
  participants: EventParticipant[];
  comments: Comment[];
};

export type EventOrganizer = {
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
  location: addressSchema.optional(),
  kind: z.nativeEnum(EventKind),
});

export type CreateEventBody = z.infer<typeof createEventBodySchema>;

export const updateEventBodySchema = z.object({
  title: z.string().trim(),
  body: z.string().trim(),
  date: z.string().datetime().optional(),
  location: addressSchema.optional(),
  kind: z.nativeEnum(EventKind).optional(),
});

export type UpdateEventBody = z.infer<typeof updateEventBodySchema>;

const eventParticipationSchema = z.enum(['yes', 'no']);
export type EventParticipation = z.infer<typeof eventParticipationSchema>;

export const setEventParticipationBodySchema = z.object({
  participation: eventParticipationSchema.nullable(),
});

export type SetEventParticipationBody = z.infer<typeof setEventParticipationBodySchema>;

export const createEventCommentBodySchema = z.object({
  body: z.string().trim(),
});

export type CreateEventCommentBody = z.infer<typeof createEventCommentBodySchema>;
