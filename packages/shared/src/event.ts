import { z } from 'zod';

import { Address, addressSchema } from './address';
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
  message: Message;
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
};

export type EventOrganizer = LightMember & {
  email?: string;
  phoneNumbers: PhoneNumber[];
};

type EventParticipant = LightMember & {
  participation: EventParticipation;
};

export const listEventsQuerySchema = z.object({
  search: z.string().optional(),
  timing: z.union([z.literal('past'), z.literal('upcoming')]).optional(),
  organizerId: z.string().optional(),
  year: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

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

export const sendEventNotificationBodySchema = z.object({
  recipients: z.union([z.literal('participants'), z.literal('non-participants'), z.literal('all')]),
  title: z.string().min(5).max(65),
  content: z.string().min(5).max(225),
});

export type SendEventNotificationBody = z.infer<typeof sendEventNotificationBodySchema>;

const eventParticipationSchema = z.enum(['yes', 'no']);
export type EventParticipation = z.infer<typeof eventParticipationSchema>;

export const setEventParticipationBodySchema = z.object({
  participation: eventParticipationSchema.nullable(),
});

export type SetEventParticipationBody = z.infer<typeof setEventParticipationBodySchema>;
