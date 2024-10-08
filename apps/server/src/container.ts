import { createContainer } from 'ditox';
import nodemailer from 'nodemailer';

import { Application } from './application';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { RequestAuthenticationLink } from './authentication/commands/request-authentication-link.command';
import { RevokeSessionToken } from './authentication/commands/revoke-session-token.command';
import { VerifyAuthenticationToken } from './authentication/commands/verify-authentication-token.command';
import { SendAuthenticationEmail } from './authentication/event-handlers/send-authentication-email.event-handler';
import { GetAuthenticatedMember } from './authentication/queries/get-authenticated-member.query';
import { GetToken } from './authentication/queries/get-session-token.query';
import { SessionController } from './authentication/session.controller';
import { SessionProvider } from './authentication/session.provider';
import { CommentService } from './comments/comment.service';
import { CreateEventComment } from './events/commands/create-event-comment.command';
import { CreateEvent } from './events/commands/create-event.command';
import { SetEventParticipation } from './events/commands/set-event-participation.command';
import { UpdateEvent } from './events/commands/update-event.command';
import { NotifyEventCommentCreated } from './events/event-handlers/notify-event-comment-created.handler';
import { NotifyEventCreated } from './events/event-handlers/notify-event-created.event-handler';
import { NotifyEventParticipationSet } from './events/event-handlers/notify-event-participant-set.event-handler';
import { EventController } from './events/event.controller';
import { GetEvent } from './events/queries/get-event.query';
import { ListEvents } from './events/queries/list-events.query';
import { EnvConfigAdapter } from './infrastructure/config/env-config.adapter';
import { CommandBus } from './infrastructure/cqs/command-bus';
import { EventBus } from './infrastructure/cqs/event-bus';
import { QueryBus } from './infrastructure/cqs/query-bus';
import { NativeDateAdapter } from './infrastructure/date/native-date.adapter';
import { MjmlEmailRendererAdapter } from './infrastructure/email/mjml-email-renderer.adapter';
import { NodemailerEmailSenderAdapter } from './infrastructure/email/nodemailer-email-sender.adapter';
import { SlackErrorReporterAdapter } from './infrastructure/error-reporter/slack-error-reporter.adapter';
import { EventPublisher } from './infrastructure/events/event-publisher';
import { EventsLogger } from './infrastructure/events/events-logger';
import { EventsPersistor } from './infrastructure/events/events-persistor';
import { EventsSlackPublisher } from './infrastructure/events/events-slack-publisher';
import { NanoIdGenerator } from './infrastructure/generator/nanoid-generator.adapter';
import { CheerioHtmlParserAdapter } from './infrastructure/html-parser/cheerio-html-parser.adapter';
import { ConsoleLogger } from './infrastructure/logger/console-logger.adapter';
import { WebPushNotificationAdapter } from './infrastructure/push-notification/web-push-notification.adapter';
import { WebSlackClientAdapter } from './infrastructure/slack/web-slack-client.adapter';
import { FormatJsTranslationAdapter } from './infrastructure/translation/formatjs-translation.adapter';
import { AddInterestMember } from './interests/commands/add-interest-member/add-interest-member';
import { CreateInterest } from './interests/commands/create-interest/create-interest';
import { EditInterestMember } from './interests/commands/edit-interest-member/edit-interest-member';
import { RemoveInterestMember } from './interests/commands/remove-interest-member/remove-interest-member';
import { InterestController } from './interests/interest.controller';
import { ListInterests } from './interests/queries/list-interests.query';
import { ChangeNotificationDeliveryType } from './members/commands/change-notification-delivery-type.command';
import { CreateMember } from './members/commands/create-member.command';
import { UpdateMemberProfile } from './members/commands/update-member-profile.command';
import { MembersController } from './members/members.controller';
import { GetMember } from './members/queries/get-member.query';
import { ListMembers } from './members/queries/list-members.query';
import { RegisterDevice } from './notifications/commands/register-device.command';
import { NotificationController } from './notifications/notification.controller';
import { NotificationService } from './notifications/notification.service';
import { GetMemberNotifications } from './notifications/queries/get-member-notifications.query';
import { Database } from './persistence/database';
import { SqlCommentRepository } from './persistence/repositories/comment/sql-comment.repository';
import { SqlEventRepository } from './persistence/repositories/event/sql-memory-event.repository';
import { SqlMemberRepository } from './persistence/repositories/member/sql-member.repository';
import { SqlMemberDeviceRepository } from './persistence/repositories/member-device/sql-member-device.repository';
import { SqlRequestRepository } from './persistence/repositories/request/sql-request.repository';
import { SqlRequestAnswerRepository } from './persistence/repositories/request-answer/sql-memory-request-answer.repository';
import { SqlTokenRepository } from './persistence/repositories/token/sql-token.repository';
import { ChangeRequestStatus } from './requests/commands/change-request-status.command';
import { CreateRequestComment } from './requests/commands/create-request-comment.command';
import { CreateRequest } from './requests/commands/create-request.command';
import { EditRequest } from './requests/commands/edit-request.command';
import { SetRequestAnswer } from './requests/commands/set-request-answer.command';
import { NotifyRequestCommentCreated } from './requests/event-handlers/notify-request-comment-created.event-handler';
import { NotifyRequestCreated } from './requests/event-handlers/notify-request-created.event-handler';
import { NotifyRequestStatusChanged } from './requests/event-handlers/notify-request-status-changed.event-handler';
import { GetRequest } from './requests/queries/get-request.query';
import { ListRequests } from './requests/queries/list-requests.query';
import { RequestController } from './requests/request.controller';
import { Server } from './server';
import { COMMANDS, EVENT_HANDLERS, QUERIES, TOKENS } from './tokens';
import { AcceptTransaction } from './transactions/commands/accept-transaction';
import { CancelTransaction } from './transactions/commands/cancel-transaction';
import { CreateTransaction } from './transactions/commands/create-transaction';
import { NotifyTransactionCanceled } from './transactions/event-handlers/notify-transaction-canceled';
import { NotifyTransactionCompleted } from './transactions/event-handlers/notify-transaction-completed';
import { NotifyTransactionPending } from './transactions/event-handlers/notify-transaction-pending';
import { TransactionController } from './transactions/transaction.controller';
import { TransactionService } from './transactions/transaction.service';

export const container = createContainer();

// tokens

container.bindValue(TOKENS.container, container);

container.bindFactory(TOKENS.application, Application.inject);
container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.date, NativeDateAdapter.inject);
container.bindFactory(TOKENS.generator, NanoIdGenerator.inject);
container.bindFactory(TOKENS.logger, ConsoleLogger.inject);
container.bindFactory(TOKENS.slackClient, WebSlackClientAdapter.inject);
container.bindFactory(TOKENS.errorReporter, SlackErrorReporterAdapter.inject);
container.bindFactory(TOKENS.htmlParser, CheerioHtmlParserAdapter.inject);
container.bindFactory(TOKENS.translation, FormatJsTranslationAdapter.inject);
container.bindFactory(TOKENS.pushNotification, WebPushNotificationAdapter.inject);

container.bindFactory(TOKENS.server, Server.inject);
container.bindFactory(TOKENS.database, Database.inject);
container.bindFactory(TOKENS.emailRenderer, MjmlEmailRendererAdapter.inject);
container.bindValue(TOKENS.nodemailer, nodemailer);
container.bindFactory(TOKENS.emailSender, NodemailerEmailSenderAdapter.inject);

container.bindFactory(TOKENS.membersController, MembersController.inject);
container.bindFactory(TOKENS.memberRepository, SqlMemberRepository.inject);

container.bindFactory(TOKENS.requestController, RequestController.inject);
container.bindFactory(TOKENS.requestRepository, SqlRequestRepository.inject);
container.bindFactory(TOKENS.requestAnswerRepository, SqlRequestAnswerRepository.inject);

container.bindFactory(TOKENS.eventController, EventController.inject);
container.bindFactory(TOKENS.eventRepository, SqlEventRepository.inject);

container.bindFactory(TOKENS.interestController, InterestController.inject);
container.bindFactory(TOKENS.interestController, InterestController.inject);

container.bindFactory(TOKENS.transactionController, TransactionController.inject);
container.bindFactory(TOKENS.transactionService, TransactionService.inject);

container.bindFactory(TOKENS.authenticationController, AuthenticationController.inject);
container.bindFactory(TOKENS.sessionController, SessionController.inject);
container.bindFactory(TOKENS.sessionProvider, SessionProvider.inject);
container.bindFactory(TOKENS.authenticationService, AuthenticationService.inject);
container.bindFactory(TOKENS.tokenRepository, SqlTokenRepository.inject);

container.bindFactory(TOKENS.commentService, CommentService.inject);
container.bindFactory(TOKENS.commentRepository, SqlCommentRepository.inject);

container.bindFactory(TOKENS.notificationController, NotificationController.inject);
container.bindFactory(TOKENS.notificationService, NotificationService.inject);

container.bindFactory(TOKENS.memberDeviceRepository, SqlMemberDeviceRepository.inject);

container.bindFactory(TOKENS.commandBus, CommandBus.inject);
container.bindFactory(TOKENS.queryBus, QueryBus.inject);
container.bindFactory(TOKENS.eventBus, EventBus.inject);
container.bindFactory(TOKENS.eventPublisher, EventPublisher.inject);

// commands

container.bindFactory(COMMANDS.requestAuthenticationLink, RequestAuthenticationLink.inject);
container.bindFactory(COMMANDS.verifyAuthenticationToken, VerifyAuthenticationToken.inject);
container.bindFactory(COMMANDS.revokeSessionToken, RevokeSessionToken.inject);

container.bindFactory(COMMANDS.createRequest, CreateRequest.inject);
container.bindFactory(COMMANDS.editRequest, EditRequest.inject);
container.bindFactory(COMMANDS.createRequestComment, CreateRequestComment.inject);
container.bindFactory(COMMANDS.changeRequestStatus, ChangeRequestStatus.inject);
container.bindFactory(COMMANDS.setRequestAnswer, SetRequestAnswer.inject);

container.bindFactory(COMMANDS.createEvent, CreateEvent.inject);
container.bindFactory(COMMANDS.updateEvent, UpdateEvent.inject);
container.bindFactory(COMMANDS.setEventParticipation, SetEventParticipation.inject);
container.bindFactory(COMMANDS.createEventComment, CreateEventComment.inject);

container.bindFactory(COMMANDS.createInterest, CreateInterest.inject);
container.bindFactory(COMMANDS.addInterestMember, AddInterestMember.inject);
container.bindFactory(COMMANDS.editInterestMember, EditInterestMember.inject);
container.bindFactory(COMMANDS.removeInterestMember, RemoveInterestMember.inject);

container.bindFactory(COMMANDS.createTransaction, CreateTransaction.inject);
container.bindFactory(COMMANDS.acceptTransaction, AcceptTransaction.inject);
container.bindFactory(COMMANDS.cancelTransaction, CancelTransaction.inject);

container.bindFactory(COMMANDS.createMember, CreateMember.inject);
container.bindFactory(COMMANDS.updateMemberProfile, UpdateMemberProfile.inject);
container.bindFactory(COMMANDS.changeNotificationDeliveryType, ChangeNotificationDeliveryType.inject);

container.bindFactory(COMMANDS.registerDevice, RegisterDevice.inject);

// queries

container.bindFactory(QUERIES.getToken, GetToken.inject);
container.bindFactory(QUERIES.getAuthenticatedMember, GetAuthenticatedMember.inject);
container.bindFactory(QUERIES.listRequests, ListRequests.inject);
container.bindFactory(QUERIES.getRequest, GetRequest.inject);
container.bindFactory(QUERIES.listEvents, ListEvents.inject);
container.bindFactory(QUERIES.getEvent, GetEvent.inject);
container.bindFactory(QUERIES.listMembers, ListMembers.inject);
container.bindFactory(QUERIES.getMember, GetMember.inject);
container.bindFactory(QUERIES.getMemberNotifications, GetMemberNotifications.inject);
container.bindFactory(QUERIES.listInterests, ListInterests.inject);

// event handlers

container.bindFactory(EVENT_HANDLERS.eventsLogger, EventsLogger.inject);
container.bindFactory(EVENT_HANDLERS.eventsPersistor, EventsPersistor.inject);
container.bindFactory(EVENT_HANDLERS.eventsSlackPublisher, EventsSlackPublisher.inject);
container.bindFactory(EVENT_HANDLERS.sendAuthenticationEmail, SendAuthenticationEmail.inject);
container.bindFactory(EVENT_HANDLERS.notifyRequestCreated, NotifyRequestCreated.inject);
container.bindFactory(EVENT_HANDLERS.notifyRequestCommentCreated, NotifyRequestCommentCreated.inject);
container.bindFactory(EVENT_HANDLERS.notifyRequestStatusChanged, NotifyRequestStatusChanged.inject);
container.bindFactory(EVENT_HANDLERS.notifyEventCreated, NotifyEventCreated.inject);
container.bindFactory(EVENT_HANDLERS.notifyEventParticipationSet, NotifyEventParticipationSet.inject);
container.bindFactory(EVENT_HANDLERS.notifyEventCommentCreated, NotifyEventCommentCreated.inject);
container.bindFactory(EVENT_HANDLERS.notifyTransactionPending, NotifyTransactionPending.inject);
container.bindFactory(EVENT_HANDLERS.notifyTransactionCompleted, NotifyTransactionCompleted.inject);
container.bindFactory(EVENT_HANDLERS.notifyTransactionCanceled, NotifyTransactionCanceled.inject);
