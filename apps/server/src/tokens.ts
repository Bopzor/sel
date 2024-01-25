import { Container, token } from 'ditox';

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
import { CommentsFacade } from './comments/comments.facade';
import { CommentsService } from './comments/comments.service';
import { ConfigPort } from './infrastructure/config/config.port';
import { CommandBus } from './infrastructure/cqs/command-bus';
import { EventBus } from './infrastructure/cqs/event-bus';
import { QueryBus } from './infrastructure/cqs/query-bus';
import { DatePort } from './infrastructure/date/date.port';
import { EmailRendererPort } from './infrastructure/email/email-renderer.port';
import { EmailSenderPort } from './infrastructure/email/email-sender.port';
import { Nodemailer } from './infrastructure/email/nodemailer-email-sender.adapter';
import { ErrorReporterPort } from './infrastructure/error-reporter/error-reporter.port';
import { EventPublisherPort } from './infrastructure/events/event-publisher.port';
import { EventsLogger } from './infrastructure/events/events-logger';
import { EventsPersistor } from './infrastructure/events/events-persistor';
import { EventsSlackPublisher } from './infrastructure/events/events-slack-publisher';
import { EventsPort } from './infrastructure/events/events.port';
import { GeneratorPort } from './infrastructure/generator/generator.port';
import { HtmlParserPort } from './infrastructure/html-parser/html-parser.port';
import { LoggerPort } from './infrastructure/logger/logger.port';
import { PushNotificationPort } from './infrastructure/push-notification/push-notification.port';
import { SlackClientPort } from './infrastructure/slack/slack-client.port';
import { TranslationPort } from './infrastructure/translation/translation.port';
import { MembersController } from './members/members.controller';
import { MembersFacade } from './members/members.facade';
import { MembersModule } from './members/members.module';
import { MembersService } from './members/members.service';
import { NotificationController } from './notifications/notification.controller';
import { NotificationModule } from './notifications/notification.module';
import { NotificationService } from './notifications/notification.service';
import { PushNotificationService } from './notifications/push-notification.service';
import { SubscriptionFacade } from './notifications/subscription.facade';
import { SubscriptionService } from './notifications/subscription.service';
import { Database } from './persistence/database';
import { CommentRepository } from './persistence/repositories/comment/comment.repository';
import { MemberRepository } from './persistence/repositories/member/member.repository';
import { MemberDeviceRepository } from './persistence/repositories/member-device/member-device.repository';
import { NotificationRepository } from './persistence/repositories/notification/notification.repository';
import { RequestRepository } from './persistence/repositories/request/request.repository';
import { SubscriptionRepository } from './persistence/repositories/subscription/subscription.repository';
import { TokenRepository } from './persistence/repositories/token/token.repository';
import { RequestNotificationsService } from './requests/request-notifications.service';
import { RequestController } from './requests/request.controller';
import { RequestModule } from './requests/request.module';
import { RequestService } from './requests/request.service';
import { Server } from './server';

export const TOKENS = {
  container: token<Container>('container'),
  config: token<ConfigPort>('config'),
  date: token<DatePort>('date'),
  generator: token<GeneratorPort>('generator'),
  logger: token<LoggerPort>('logger'),
  events: token<EventsPort>('events'),
  eventsLogger: token<EventsLogger>('eventsLogger'),
  eventsPersistor: token<EventsPersistor>('eventsPersistor'),
  eventsSlackPublisher: token<EventsSlackPublisher>('eventsSlackPublisher'),
  slackClient: token<SlackClientPort>('slackClientPort'),
  errorReporter: token<ErrorReporterPort>('errorReporter'),
  htmlParser: token<HtmlParserPort>('htmlParser'),
  translation: token<TranslationPort>('translation'),
  pushNotification: token<PushNotificationPort>('pushNotification'),
  server: token<Server>('server'),
  database: token<Database>('database'),
  nodemailer: token<Nodemailer>('nodemailer'),
  emailRenderer: token<EmailRendererPort>('emailRenderer'),
  emailSender: token<EmailSenderPort>('emailSender'),
  membersModule: token<MembersModule>('membersModule'),
  membersFacade: token<MembersFacade>('membersFacade'),
  membersController: token<MembersController>('membersController'),
  membersService: token<MembersService>('membersService'),
  memberRepository: token<MemberRepository>('memberRepository'),
  sessionProvider: token<SessionProvider>('authenticatedMemberProvider'),
  authenticationController: token<AuthenticationController>('authenticationController'),
  authenticationService: token<AuthenticationService>('authenticationService'),
  tokenRepository: token<TokenRepository>('tokenRepository'),
  sessionController: token<SessionController>('sessionController'),
  requestModule: token<RequestModule>('requestModule'),
  requestController: token<RequestController>('requestController'),
  requestService: token<RequestService>('requestService'),
  requestNotificationsService: token<RequestNotificationsService>('requestNotificationsService'),
  requestRepository: token<RequestRepository>('requestRepository'),
  commentsFacade: token<CommentsFacade>('commentsFacade'),
  commentsService: token<CommentsService>('commentsService'),
  commentRepository: token<CommentRepository>('commentRepository'),
  notificationModule: token<NotificationModule>('notificationModule'),
  subscriptionFacade: token<SubscriptionFacade>('subscriptionFacade'),
  subscriptionService: token<SubscriptionService>('subscriptionService'),
  subscriptionRepository: token<SubscriptionRepository>('subscriptionRepository'),
  notificationController: token<NotificationController>('notificationController'),
  notificationService: token<NotificationService>('notificationService'),
  notificationRepository: token<NotificationRepository>('notificationRepository'),
  pushNotificationService: token<PushNotificationService>('pushNotificationService'),
  memberDeviceRepository: token<MemberDeviceRepository>('memberDeviceRepository'),

  commandBus: token<CommandBus>('commandBus'),
  queryBus: token<QueryBus>('queryBus'),
  eventBus: token<EventBus>('eventBus'),
  eventPublisher: token<EventPublisherPort>('eventPublisher'),
};

export const COMMANDS = {
  requestAuthenticationLink: token<RequestAuthenticationLink>('requestAuthenticationLink'),
  verifyAuthenticationToken: token<VerifyAuthenticationToken>('verifyAuthenticationToken'),
  revokeSessionToken: token<RevokeSessionToken>('revokeSessionToken'),
};

export const QUERIES = {
  getToken: token<GetToken>('getToken'),
  getAuthenticatedMember: token<GetAuthenticatedMember>('getAuthenticatedMember'),
};

export const EVENT_HANDLERS = {
  sendAuthenticationEmail: token<SendAuthenticationEmail>('sendAuthenticationEmail'),
};
