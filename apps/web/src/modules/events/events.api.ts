import {
  CreateEventBody,
  Event,
  EventParticipation,
  SetEventParticipationBody,
  UpdateEventBody,
} from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetchError, FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface EventApi {
  listEvents(): Promise<Event[]>;
  getEvent(eventId: string): Promise<Event | undefined>;
  createEvent(data: CreateEventBody): Promise<string>;
  updateEvent(eventId: string, body: UpdateEventBody): Promise<void>;
  setParticipation(eventId: string, participation: EventParticipation | null): Promise<void>;
}

export class FetchEventApi implements EventApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async listEvents(): Promise<Event[]> {
    return this.fetcher.get<Event[]>('/api/events').body();
  }

  async getEvent(eventId: string): Promise<Event | undefined> {
    return this.fetcher
      .get<Event>(`/api/events/${eventId}`)
      .body()
      .catch((error) => {
        if (FetchError.is(error) && error.status === 404) {
          return undefined;
        }

        throw error;
      });
  }

  async createEvent(data: CreateEventBody): Promise<string> {
    return this.fetcher.post<CreateEventBody, string>('/api/events', data).body();
  }

  async updateEvent(eventId: string, data: CreateEventBody): Promise<void> {
    await this.fetcher.put<CreateEventBody, void>(`/api/events/${eventId}`, data);
  }

  async setParticipation(eventId: string, participation: EventParticipation | null): Promise<void> {
    await this.fetcher
      .put<SetEventParticipationBody, undefined>(`/api/events/${eventId}/participation`, {
        participation,
      })
      .catch((error) => {
        if (FetchError.is(error) && error.status === 404) {
          return undefined;
        }

        throw error;
      });
  }
}

export class StubEventApi implements EventApi {
  events = new Array<Event>();
  event: Event | undefined;

  async listEvents(): Promise<Event[]> {
    return this.events;
  }

  async getEvent(): Promise<Event | undefined> {
    return this.event;
  }

  async createEvent(): Promise<string> {
    return '';
  }

  async updateEvent(): Promise<void> {}

  async setParticipation(): Promise<void> {}
}
