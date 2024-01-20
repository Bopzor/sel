import { injectableClass } from 'ditox';

import { EventsPort } from '../infrastructure/events/events.port';
import { TOKENS } from '../tokens';

import { RequestCommentCreated, RequestCreated } from './events';
import { RequestNotificationsService } from './request-notifications.service';
import { RequestService } from './request.service';

export class RequestModule {
  static inject = injectableClass(
    this,
    TOKENS.events,
    TOKENS.requestService,
    TOKENS.requestNotificationsService
  );

  constructor(
    private readonly events: EventsPort,
    private readonly requestService: RequestService,
    private readonly requestNotificationsService: RequestNotificationsService
  ) {}

  init() {
    this.events.addEventListener(
      RequestCreated,
      this.requestService.createRequestSubscription.bind(this.requestService)
    );

    this.events.addEventListener(
      RequestCommentCreated,
      this.requestService.createRequestSubscription.bind(this.requestService)
    );

    this.events.addEventListener(
      RequestCreated,
      this.requestNotificationsService.notifyRequestCreated.bind(this.requestNotificationsService)
    );

    this.events.addEventListener(
      RequestCommentCreated,
      this.requestNotificationsService.notifyCommentCreated.bind(this.requestNotificationsService)
    );
  }
}
