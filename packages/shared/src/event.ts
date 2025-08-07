import { z } from 'zod';

import { Address, addressSchema } from './address';
import { Comment } from './comment';
import { LightMember } from './member';
import { Message } from './message';
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
  message: Message;
  kind: EventKind;
  date?: string;
  location?: Address;
  organizer: EventOrganizer;
  participants: EventParticipant[];
  comments: Comment[];
};

export type EventOrganizer = LightMember & {
  email?: string;
  phoneNumbers: PhoneNumber[];
};

type EventParticipant = LightMember & {
  participation: EventParticipation;
};

export const createEventBodySchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(10),
  fileIds: z.array(z.string()).default([]),
  date: z.string().datetime().optional(),
  location: addressSchema.optional(),
  kind: z.nativeEnum(EventKind),
});

export type CreateEventBody = z.infer<typeof createEventBodySchema>;

export const updateEventBodySchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(10),
  fileIds: z.array(z.string()).default([]),
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
