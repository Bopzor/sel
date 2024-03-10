import { Event, EventParticipation } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetchError, FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface EventApi {
  listEvents(): Promise<Event[]>;
  getEvent(eventId: string): Promise<Event | undefined>;
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

  async setParticipation(eventId: string, participation: EventParticipation | null): Promise<void> {
    await this.fetcher
      .put<{ participation: EventParticipation | null }, undefined>(`/api/events/${eventId}/participation`, {
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

  async setParticipation(): Promise<void> {}
}
