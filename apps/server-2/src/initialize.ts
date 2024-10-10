import { container } from './infrastructure/container';
import { DomainEvent } from './infrastructure/events';
import { AuthenticationLinkRequestedEvent } from './modules/authentication/authentication.entities';
import { sendAuthenticationEmail } from './modules/authentication/domain/send-authentication-link.event-handler';
import { notifyEventCommentCreated } from './modules/event/domain/notify-event-comment-created.handler';
import { notifyEventCreated } from './modules/event/domain/notify-event-created.event-handler';
import { notifyEventParticipationSet } from './modules/event/domain/notify-event-participant-set.event-handler';
import {
  EventCommentCreatedEvent,
  EventCreatedEvent,
  EventParticipationSetEvent,
} from './modules/event/event.entities';
import { notifyRequestCommentCreated } from './modules/request/domain/notify-request-comment-create.event-handler';
import { notifyRequestCreated } from './modules/request/domain/notify-request-created.event-handler';
import { notifyRequestStatusChanged } from './modules/request/domain/notify-request-status-changed.event-handler';
import {
  RequestCanceledEvent,
  RequestCommentCreatedEvent,
  RequestCreatedEvent,
  RequestFulfilledEvent,
} from './modules/request/request.entities';
import { notifyTransactionCanceled } from './modules/transaction/domain/notify-transaction-canceled.event-handler';
import { notifyTransactionCompleted } from './modules/transaction/domain/notify-transaction-completed.event-handler';
import { notifyTransactionPending } from './modules/transaction/domain/notify-transaction-pending.event-handler';
import {
  TransactionPending,
  TransactionCompleted,
  TransactionCanceled,
} from './modules/transaction/transaction.entities';
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

  events.addListener(EventCreatedEvent, notifyEventCreated);
  events.addListener(EventParticipationSetEvent, notifyEventParticipationSet);
  events.addListener(EventCommentCreatedEvent, notifyEventCommentCreated);

  events.addListener(TransactionPending, notifyTransactionPending);
  events.addListener(TransactionCompleted, notifyTransactionCompleted);
  events.addListener(TransactionCanceled, notifyTransactionCanceled);
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
