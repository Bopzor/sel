import { createContainer, injectableClass } from 'ditox';
import nodemailer from 'nodemailer';

import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { RequestAuthenticationLink } from './authentication/commands/request-authentication-link.command';
import { VerifyAuthenticationToken } from './authentication/commands/verify-authentication-token.command';
import { SendAuthenticationEmail } from './authentication/event-handlers/send-authentication-email.event-handler';
import { GetAuthenticatedMember } from './authentication/queries/get-authenticated-member.query';
import { GetToken } from './authentication/queries/get-session-token.query';
import { SessionController } from './authentication/session.controller';
import { SessionProvider } from './authentication/session.provider';
import { CommentService } from './comments/comment.service';
import { EnvConfigAdapter } from './infrastructure/config/env-config.adapter';
import { CommandBus } from './infrastructure/cqs/command-bus';
import { EventBus } from './infrastructure/cqs/event-bus';
import { QueryBus } from './infrastructure/cqs/query-bus';
import { NativeDateAdapter } from './infrastructure/date/native-date.adapter';
import { MjmlEmailRendererAdapter } from './infrastructure/email/mjml-email-renderer.adapter';
import { NodemailerEmailSenderAdapter } from './infrastructure/email/nodemailer-email-sender.adapter';
import { SlackErrorReporterAdapter } from './infrastructure/error-reporter/slack-error-reporter.adapter';
import { EmitterEventsAdapter } from './infrastructure/events/emitter-events.adapter';
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
import { MembersController } from './members/members.controller';
import { MembersFacadeImpl } from './members/members.facade';
import { MembersModule } from './members/members.module';
import { MembersService } from './members/members.service';
import { NotificationController } from './notifications/notification.controller';
import { NotificationModule } from './notifications/notification.module';
import { NotificationService } from './notifications/notification.service';
import { PushNotificationService } from './notifications/push-notification.service';
import { SubscriptionFacadeImpl } from './notifications/subscription.facade';
import { SubscriptionService } from './notifications/subscription.service';
import { Database } from './persistence/database';
import { SqlCommentRepository } from './persistence/repositories/comment/sql-comment.repository';
import { SqlMemberRepository } from './persistence/repositories/member/sql-member.repository';
import { SqlMemberDeviceRepository } from './persistence/repositories/member-device/sql-member-device.repository';
import { SqlNotificationRepository } from './persistence/repositories/notification/sql-notification.repository';
import { SqlRequestRepository } from './persistence/repositories/request/sql-request.repository';
import { SqlSubscriptionRepository } from './persistence/repositories/subscription/sql-subscription.repository';
import { SqlTokenRepository } from './persistence/repositories/token/sql-token.repository';
import { CreateRequestComment } from './requests/commands/create-request-comment.command';
import { CreateRequest } from './requests/commands/create-request.command';
import { EditRequest } from './requests/commands/edit-request.command';
import { CreateRequestSubscription } from './requests/event-handlers/create-request-subscriptions.event-handler';
import { NotifyRequestCommentCreated } from './requests/event-handlers/notify-request-comment-created.event-handler';
import { NotifyRequestCreated } from './requests/event-handlers/notify-request-created.event-handler';
import { GetRequest } from './requests/queries/get-request.query';
import { ListRequests } from './requests/queries/list-requests.query';
import { RequestController } from './requests/request.controller';
import { Server } from './server';
import { COMMANDS, EVENT_HANDLERS, QUERIES, TOKENS } from './tokens';

export const container = createContainer();

container.bindValue(TOKENS.container, container);

container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.date, NativeDateAdapter.inject);
container.bindFactory(TOKENS.generator, NanoIdGenerator.inject);
container.bindFactory(TOKENS.logger, ConsoleLogger.inject);
container.bindFactory(TOKENS.slackClient, WebSlackClientAdapter.inject);
container.bindFactory(TOKENS.errorReporter, SlackErrorReporterAdapter.inject);
container.bindFactory(TOKENS.htmlParser, CheerioHtmlParserAdapter.inject);
container.bindFactory(TOKENS.translation, FormatJsTranslationAdapter.inject);
container.bindFactory(TOKENS.pushNotification, WebPushNotificationAdapter.inject);

container.bindFactory(TOKENS.events, EmitterEventsAdapter.inject);
container.bindFactory(TOKENS.eventsLogger, EventsLogger.inject);
container.bindFactory(TOKENS.eventsPersistor, EventsPersistor.inject);
container.bindFactory(TOKENS.eventsSlackPublisher, EventsSlackPublisher.inject);

container.bindFactory(TOKENS.server, Server.inject);
container.bindFactory(TOKENS.database, Database.inject);
container.bindFactory(TOKENS.emailRenderer, MjmlEmailRendererAdapter.inject);
container.bindValue(TOKENS.nodemailer, nodemailer);
container.bindFactory(TOKENS.emailSender, NodemailerEmailSenderAdapter.inject);

container.bindFactory(TOKENS.membersModule, MembersModule.inject);
container.bindFactory(TOKENS.membersFacade, MembersFacadeImpl.inject);
container.bindFactory(TOKENS.membersController, MembersController.inject);
container.bindFactory(TOKENS.membersService, MembersService.inject);
container.bindFactory(TOKENS.memberRepository, SqlMemberRepository.inject);

container.bindFactory(TOKENS.requestController, RequestController.inject);
container.bindFactory(TOKENS.requestRepository, SqlRequestRepository.inject);

container.bindFactory(TOKENS.authenticationController, AuthenticationController.inject);
container.bindFactory(TOKENS.sessionController, SessionController.inject);
container.bindFactory(TOKENS.sessionProvider, SessionProvider.inject);
container.bindFactory(TOKENS.authenticationService, AuthenticationService.inject);
container.bindFactory(TOKENS.tokenRepository, SqlTokenRepository.inject);

container.bindFactory(TOKENS.commentService, CommentService.inject);
container.bindFactory(TOKENS.commentRepository, SqlCommentRepository.inject);

container.bindFactory(TOKENS.notificationModule, NotificationModule.inject);
container.bindFactory(TOKENS.subscriptionFacade, SubscriptionFacadeImpl.inject);
container.bindFactory(TOKENS.subscriptionService, SubscriptionService.inject);
container.bindFactory(TOKENS.subscriptionRepository, SqlSubscriptionRepository.inject);

container.bindFactory(TOKENS.notificationController, NotificationController.inject);
container.bindFactory(TOKENS.notificationService, NotificationService.inject);
container.bindFactory(TOKENS.notificationRepository, SqlNotificationRepository.inject);

container.bindFactory(TOKENS.pushNotificationService, PushNotificationService.inject);
container.bindFactory(TOKENS.memberDeviceRepository, SqlMemberDeviceRepository.inject);

container.bindFactory(TOKENS.commandBus, CommandBus.inject);
container.bindFactory(TOKENS.queryBus, QueryBus.inject);
container.bindFactory(TOKENS.eventBus, injectableClass(EventBus));
container.bindFactory(TOKENS.eventPublisher, EventPublisher.inject);

container.bindFactory(COMMANDS.requestAuthenticationLink, RequestAuthenticationLink.inject);
container.bindFactory(COMMANDS.verifyAuthenticationToken, VerifyAuthenticationToken.inject);
container.bindFactory(COMMANDS.createRequest, CreateRequest.inject);
container.bindFactory(COMMANDS.editRequest, EditRequest.inject);
container.bindFactory(COMMANDS.createRequestComment, CreateRequestComment.inject);

container.bindFactory(QUERIES.getToken, GetToken.inject);
container.bindFactory(QUERIES.getAuthenticatedMember, GetAuthenticatedMember.inject);
container.bindFactory(QUERIES.listRequests, ListRequests.inject);
container.bindFactory(QUERIES.getRequest, GetRequest.inject);

container.bindFactory(EVENT_HANDLERS.sendAuthenticationEmail, SendAuthenticationEmail.inject);
container.bindFactory(EVENT_HANDLERS.createRequestSubscription, CreateRequestSubscription.inject);
container.bindFactory(EVENT_HANDLERS.notifyRequestCreated, NotifyRequestCreated.inject);
container.bindFactory(EVENT_HANDLERS.notifyRequestCommentCreated, NotifyRequestCommentCreated.inject);
