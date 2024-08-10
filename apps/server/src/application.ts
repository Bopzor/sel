import { Token, injectableClass } from 'ditox';

import { EventCommentCreated, EventCreated, EventParticipationSet } from './events/event-events';
import { CommandBus } from './infrastructure/cqs/command-bus';
import { CommandHandler } from './infrastructure/cqs/command-handler';
import { EventBus } from './infrastructure/cqs/event-bus';
import { QueryBus } from './infrastructure/cqs/query-bus';
import { QueryHandler } from './infrastructure/cqs/query-handler';
import { PushNotificationPort } from './infrastructure/push-notification/push-notification.port';
import { AuthenticationLinkRequested, MemberCreated, OnboardingCompleted } from './members/member-events';
import { NotificationCreated } from './notifications/notification-events';
import { Database } from './persistence/database';
import {
  RequestAnswerCreated,
  RequestCanceled,
  RequestCommentCreated,
  RequestCreated,
  RequestFulfilled,
} from './requests/request-events';
import { COMMANDS, EVENT_HANDLERS, QUERIES, TOKENS } from './tokens';

export class Application {
  static inject = injectableClass(
    this,
    TOKENS.commandBus,
    TOKENS.queryBus,
    TOKENS.eventBus,
    TOKENS.database,
    TOKENS.pushNotification,
  );

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly database: Database,
    private readonly pushNotification: PushNotificationPort,
  ) {
    this.commandBus.init();
    this.pushNotification.init?.();
    this.initEventHandlers();
  }

  private initEventHandlers() {
    const eventBus = this.eventBus;

    eventBus.bind(null, EVENT_HANDLERS.eventsLogger);
    eventBus.bind(null, EVENT_HANDLERS.eventsPersistor);
    eventBus.bind(null, EVENT_HANDLERS.eventsSlackPublisher);

    eventBus.bind(AuthenticationLinkRequested, EVENT_HANDLERS.sendAuthenticationEmail);

    eventBus.bind(RequestCreated, EVENT_HANDLERS.createRequestSubscription);
    eventBus.bind(RequestCreated, EVENT_HANDLERS.notifyRequestCreated);
    eventBus.bind(RequestAnswerCreated, EVENT_HANDLERS.createRequestSubscription);
    eventBus.bind(RequestCommentCreated, EVENT_HANDLERS.createRequestSubscription);
    eventBus.bind(RequestCommentCreated, EVENT_HANDLERS.notifyRequestCommentCreated);
    eventBus.bind(RequestFulfilled, EVENT_HANDLERS.notifyRequestStatusChanged);
    eventBus.bind(RequestCanceled, EVENT_HANDLERS.notifyRequestStatusChanged);

    eventBus.bind(EventCreated, EVENT_HANDLERS.createEventSubscription);
    eventBus.bind(EventCreated, EVENT_HANDLERS.notifyEventCreated);
    eventBus.bind(EventParticipationSet, EVENT_HANDLERS.createEventSubscription);
    eventBus.bind(EventParticipationSet, EVENT_HANDLERS.notifyEventParticipationSet);
    eventBus.bind(EventCommentCreated, EVENT_HANDLERS.createEventSubscription);
    eventBus.bind(EventCommentCreated, EVENT_HANDLERS.notifyEventCommentCreated);

    eventBus.bind(MemberCreated, EVENT_HANDLERS.createMemberSubscription);
    eventBus.bind(OnboardingCompleted, EVENT_HANDLERS.enableSubscriptions);

    eventBus.bind(NotificationCreated, EVENT_HANDLERS.deliverNotification);
  }

  async close() {
    await this.eventBus.waitForPromises();
    await this.database.close();
  }

  private createCommandMethod<Command>(token: Token<CommandHandler<Command>>) {
    return (command: Command) => this.commandBus.executeCommand(token, command);
  }

  createMember = this.createCommandMethod(COMMANDS.createMember);
  updateMemberProfile = this.createCommandMethod(COMMANDS.updateMemberProfile);
  createSubscription = this.createCommandMethod(COMMANDS.createSubscription);
  sendPushNotification = this.createCommandMethod(COMMANDS.sendPushNotification);
  registerDevice = this.createCommandMethod(COMMANDS.registerDevice);
  changeNotificationDeliveryType = this.createCommandMethod(COMMANDS.changeNotificationDeliveryType);
  createRequestComment = this.createCommandMethod(COMMANDS.createRequestComment);
  createInterest = this.createCommandMethod(COMMANDS.createInterest);
  createTransaction = this.createCommandMethod(COMMANDS.createTransaction);

  private createQueryMethod<Query, Result>(token: Token<QueryHandler<Query, Result>>) {
    return (query: Query) => this.queryBus.executeQuery(token, query);
  }

  getMemberNotifications = this.createQueryMethod(QUERIES.getMemberNotifications);
}
