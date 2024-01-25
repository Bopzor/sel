import { ClassType } from '@sel/utils';
import { Token } from 'ditox';

import { container } from './container';
import { AuthenticationLinkRequested } from './members/events';
import { EVENT_HANDLERS, TOKENS } from './tokens';

export function initEventHandlers() {
  bind(AuthenticationLinkRequested, EVENT_HANDLERS.sendAuthenticationEmail);
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
