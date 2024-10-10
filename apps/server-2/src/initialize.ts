import { container } from './infrastructure/container';
import { DomainEvent } from './infrastructure/events';
import { AuthenticationLinkRequestedEvent } from './modules/authentication/authentication.entities';
import { sendAuthenticationEmail } from './modules/authentication/send-authentication-link.event-handler';
import { notifyRequestCommentCreated } from './modules/request/notify-request-comment-create.event-handler';
import { notifyRequestCreated } from './modules/request/notify-request-created.event-handler';
import { notifyRequestStatusChanged } from './modules/request/notify-request-status-changed.event-handler';
import {
  RequestCanceledEvent,
  RequestCommentCreatedEvent,
  RequestCreatedEvent,
  RequestFulfilledEvent,
} from './modules/request/request.entities';
import { db } from './persistence/database';
import { domainEvents } from './persistence/schema/domain-events';
import { TOKENS } from './tokens';

export function initialize() {
  const pushNotification = container.resolve(TOKENS.pushNotification);
  const events = container.resolve(TOKENS.events);

  pushNotification.init?.();

  events.addGlobalListener(storeDomainEvent);

  events.addListener(AuthenticationLinkRequestedEvent, sendAuthenticationEmail);

  events.addListener(RequestCreatedEvent, notifyRequestCreated);
  events.addListener(RequestCommentCreatedEvent, notifyRequestCommentCreated);
  events.addListener(RequestFulfilledEvent, notifyRequestStatusChanged);
  events.addListener(RequestCanceledEvent, notifyRequestStatusChanged);
}

async function storeDomainEvent(event: DomainEvent<unknown>) {
  const generator = container.resolve(TOKENS.generator);
  const logger = container.resolve(TOKENS.logger);

  try {
    await db.insert(domainEvents).values({
      id: generator.id(),
      ...event,
    });
  } catch (error) {
    logger.error(error);
  }
}
