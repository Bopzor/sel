import { injectableClass } from 'ditox';

import { EventsPort } from '../infrastructure/events/events.port';
import { TOKENS } from '../tokens';

import { RequestCreated } from './events';
import { RequestNotificationsService } from './request-notifications.service';

export class RequestModule {
  static inject = injectableClass(this, TOKENS.events, TOKENS.requestNotificationsService);

  constructor(
    private readonly events: EventsPort,
    private readonly requestNotificationsService: RequestNotificationsService
  ) {}

  init() {
    this.events.addEventListener(
      RequestCreated,
      this.requestNotificationsService.onRequestCreated.bind(this.requestNotificationsService)
    );
  }
}
