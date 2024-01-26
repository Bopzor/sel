import { container } from './container';
import { AuthenticationLinkRequested, MemberCreated } from './members/member-events';
import { RequestCommentCreated, RequestCreated } from './requests/request-events';
import { EVENT_HANDLERS, TOKENS } from './tokens';

export function initEventHandlers() {
  const eventBus = container.resolve(TOKENS.eventBus);

  eventBus.bind(null, EVENT_HANDLERS.eventsLogger);
  eventBus.bind(null, EVENT_HANDLERS.eventsPersistor);
  eventBus.bind(null, EVENT_HANDLERS.eventsSlackPublisher);

  eventBus.bind(AuthenticationLinkRequested, EVENT_HANDLERS.sendAuthenticationEmail);

  eventBus.bind(RequestCreated, EVENT_HANDLERS.createRequestSubscription);
  eventBus.bind(RequestCreated, EVENT_HANDLERS.notifyRequestCreated);
  eventBus.bind(RequestCommentCreated, EVENT_HANDLERS.createRequestSubscription);
  eventBus.bind(RequestCommentCreated, EVENT_HANDLERS.notifyRequestCommentCreated);

  eventBus.bind(MemberCreated, EVENT_HANDLERS.createMemberSubscription);
}
