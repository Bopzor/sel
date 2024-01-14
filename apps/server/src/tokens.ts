import { Container, token } from 'ditox';

import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationFacade } from './authentication/authentication.facade';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationService } from './authentication/authentication.service';
import { TokenRepository } from './authentication/token.repository';
import { CommentsFacade } from './comments/comments.facade';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsService } from './comments/comments.service';
import { ConfigPort } from './infrastructure/config/config.port';
import { DatePort } from './infrastructure/date/date.port';
import { EmailRendererPort } from './infrastructure/email/email-renderer.port';
import { EmailSenderPort } from './infrastructure/email/email-sender.port';
import { Nodemailer } from './infrastructure/email/nodemailer-email-sender.adapter';
import { ErrorReporterPort } from './infrastructure/error-reporter/error-reporter.port';
import { EventsLogger } from './infrastructure/events/events-logger';
import { EventsPersistor } from './infrastructure/events/events-persistor';
import { EventsSlackPublisher } from './infrastructure/events/events-slack-publisher';
import { EventsPort } from './infrastructure/events/events.port';
import { GeneratorPort } from './infrastructure/generator/generator.port';
import { HtmlParserPort } from './infrastructure/html-parser/html-parser.port';
import { LoggerPort } from './infrastructure/logger/logger.port';
import { Database } from './infrastructure/persistence/database';
import { PushNotificationPort } from './infrastructure/push-notification/push-notification.port';
import { SlackClientPort } from './infrastructure/slack/slack-client.port';
import { TranslationPort } from './infrastructure/translation/translation.port';
import { MembersController } from './members/members.controller';
import { MembersFacade } from './members/members.facade';
import { MembersModule } from './members/members.module';
import { MembersRepository } from './members/members.repository';
import { MembersService } from './members/members.service';
import { MemberDeviceRepository } from './notifications/member-device.repository';
import { NotificationController } from './notifications/notification.controller';
import { NotificationRepository } from './notifications/notification.repository';
import { NotificationService } from './notifications/notification.service';
import { PushNotificationService } from './notifications/push-notification.service';
import { SubscriptionFacade } from './notifications/subscription.facade';
import { SubscriptionRepository } from './notifications/subscription.repository';
import { SubscriptionService } from './notifications/subscription.service';
import { RequestNotificationsService } from './requests/request-notifications.service';
import { RequestController } from './requests/request.controller';
import { RequestModule } from './requests/request.module';
import { RequestRepository } from './requests/request.repository';
import { RequestService } from './requests/request.service';
import { Server } from './server';
import { SessionController } from './session/session.controller';
import { SessionProvider } from './session/session.provider';
import { SessionService } from './session/session.service';

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
  membersRepository: token<MembersRepository>('membersRepository'),
  sessionProvider: token<SessionProvider>('authenticatedMemberProvider'),
  authenticationModule: token<AuthenticationModule>('authenticationModule'),
  authenticationFacade: token<AuthenticationFacade>('authenticationFacade'),
  authenticationController: token<AuthenticationController>('authenticationController'),
  authenticationService: token<AuthenticationService>('authenticationService'),
  tokenRepository: token<TokenRepository>('tokenRepository'),
  sessionController: token<SessionController>('sessionController'),
  sessionService: token<SessionService>('sessionService'),
  requestModule: token<RequestModule>('requestModule'),
  requestController: token<RequestController>('requestController'),
  requestService: token<RequestService>('requestService'),
  requestNotificationsService: token<RequestNotificationsService>('requestNotificationsService'),
  requestRepository: token<RequestRepository>('requestRepository'),
  commentsFacade: token<CommentsFacade>('commentsFacade'),
  commentsService: token<CommentsService>('commentsService'),
  commentsRepository: token<CommentsRepository>('commentsRepository'),
  subscriptionFacade: token<SubscriptionFacade>('subscriptionFacade'),
  subscriptionService: token<SubscriptionService>('subscriptionService'),
  subscriptionRepository: token<SubscriptionRepository>('subscriptionRepository'),
  notificationController: token<NotificationController>('notificationController'),
  notificationService: token<NotificationService>('notificationService'),
  notificationRepository: token<NotificationRepository>('notificationRepository'),
  pushNotificationService: token<PushNotificationService>('pushNotificationService'),
  memberDeviceRepository: token<MemberDeviceRepository>('memberDeviceRepository'),
};
