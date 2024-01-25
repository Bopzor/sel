import { ClassType } from '@sel/utils';
import { Token } from 'ditox';

import { container } from './container';
import { AuthenticationLinkRequested, MemberCreated } from './members/member-events';
import { RequestCommentCreated, RequestCreated } from './requests/request-events';
import { EVENT_HANDLERS, TOKENS } from './tokens';

export function initEventHandlers() {
  bind(AuthenticationLinkRequested, EVENT_HANDLERS.sendAuthenticationEmail);

  bind(RequestCreated, EVENT_HANDLERS.createRequestSubscription);
  bind(RequestCreated, EVENT_HANDLERS.notifyRequestCreated);
  bind(RequestCommentCreated, EVENT_HANDLERS.createRequestSubscription);
  bind(RequestCommentCreated, EVENT_HANDLERS.notifyRequestCommentCreated);

  bind(MemberCreated, EVENT_HANDLERS.createMemberSubscription);
}

type EventHandler<Event> = {
  handle(event: Event): Promise<void>;
};

function bind<Event extends object>(EventClass: ClassType<Event>, token: Token<EventHandler<Event>>) {
  const eventBus = container.resolve(TOKENS.eventBus);
  const handlerClass = container.resolve(token);
  const handler = handlerClass.handle.bind(handlerClass);

  eventBus.addListener(EventClass, handler);
}
