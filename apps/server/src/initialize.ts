import { container } from './infrastructure/container';
import { DomainEvent } from './infrastructure/events';
import { AuthenticationLinkRequestedEvent } from './modules/authentication/authentication.entities';
import { sendAuthenticationEmail } from './modules/authentication/domain/send-authentication-link.event-handler';
import { CommentCreatedEvent } from './modules/comment/comment.entities';
import { notifyEventCommentCreated } from './modules/event/domain/notify-event-comment-created.handler';
import { notifyEventCreated } from './modules/event/domain/notify-event-created.event-handler';
import { notifyEventParticipationSet } from './modules/event/domain/notify-event-participant-set.event-handler';
import { EventCreatedEvent, EventParticipationSetEvent } from './modules/event/event.entities';
import { notifyInformationCommentCreated } from './modules/information/domain/notify-information-comment-create.event-handler';
import { notifyInformationPublished } from './modules/information/domain/notify-information-published.event-handler';
import { InformationPublished as InformationPublishedEvent } from './modules/information/information.entities';
import { reportOnboardingCompleted } from './modules/member/domain/report-onboarding-completed.event-handler';
import { OnboardingCompletedEvent } from './modules/member/member.entities';
import { notifyRequestCommentCreated } from './modules/request/domain/notify-request-comment-create.event-handler';
import { notifyRequestCreated } from './modules/request/domain/notify-request-created.event-handler';
import { notifyRequestStatusChanged } from './modules/request/domain/notify-request-status-changed.event-handler';
import {
  RequestCanceledEvent,
  RequestCreatedEvent,
  RequestFulfilledEvent,
} from './modules/request/request.entities';
import { notifyTransactionCanceled } from './modules/transaction/domain/notify-transaction-canceled.event-handler';
import { notifyTransactionCompleted } from './modules/transaction/domain/notify-transaction-completed.event-handler';
import { notifyTransactionPending } from './modules/transaction/domain/notify-transaction-pending.event-handler';
import {
  TransactionCanceledEvent,
  TransactionCompletedEvent,
  TransactionPendingEvent,
} from './modules/transaction/transaction.entities';
import { db } from './persistence/database';
import { domainEvents } from './persistence/schema/domain-events';
import { TOKENS } from './tokens';

export function initialize() {
  const pushNotification = container.resolve(TOKENS.pushNotification);

  pushNotification.init?.();
  bindEventListeners();
}

function bindEventListeners() {
  const logger = container.resolve(TOKENS.logger);
  const events = container.resolve(TOKENS.events);

  logger.log('Binding event listeners');

  events.addGlobalListener(logDomainEvent);
  events.addGlobalListener(storeDomainEvent);

  events.addListener(OnboardingCompletedEvent, reportOnboardingCompleted);

  events.addListener(AuthenticationLinkRequestedEvent, sendAuthenticationEmail);

  events.addListener(RequestCreatedEvent, notifyRequestCreated);
  events.addListener(CommentCreatedEvent, notifyRequestCommentCreated);
  events.addListener(RequestFulfilledEvent, notifyRequestStatusChanged);
  events.addListener(RequestCanceledEvent, notifyRequestStatusChanged);

  events.addListener(EventCreatedEvent, notifyEventCreated);
  events.addListener(EventParticipationSetEvent, notifyEventParticipationSet);
  events.addListener(CommentCreatedEvent, notifyEventCommentCreated);

  events.addListener(TransactionPendingEvent, notifyTransactionPending);
  events.addListener(TransactionCompletedEvent, notifyTransactionCompleted);
  events.addListener(TransactionCanceledEvent, notifyTransactionCanceled);

  events.addListener(InformationPublishedEvent, notifyInformationPublished);
  events.addListener(CommentCreatedEvent, notifyInformationCommentCreated);
}

async function logDomainEvent(event: DomainEvent<unknown>) {
  container.resolve(TOKENS.logger).log('Event published', event);
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
