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
import { CommentService } from './comments/comment.service';
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
import { CreateMember } from './members/commands/create-member.command';
import { UpdateMemberProfile } from './members/commands/update-member-profile.command';
import { CreateMemberSubscription } from './members/event-handlers/create-member-subscription.event-handler';
import { MembersController } from './members/members.controller';
import { MembersFacade } from './members/members.facade';
import { GetMember } from './members/queries/get-member.query';
import { ListMembers } from './members/queries/list-members.query';
import { MarkNotificationAsRead } from './notifications/commands/mark-notification-as-read.command';
import { RegisterDevice } from './notifications/commands/register-device.command';
import { SendPushNotification } from './notifications/commands/send-push-notification.command';
import { NotificationController } from './notifications/notification.controller';
import { GetMemberNotifications } from './notifications/queries/get-member-notifications.query';
import { SubscriptionService } from './notifications/subscription.service';
import { Database } from './persistence/database';
import { CommentRepository } from './persistence/repositories/comment/comment.repository';
import { MemberRepository } from './persistence/repositories/member/member.repository';
import { MemberDeviceRepository } from './persistence/repositories/member-device/member-device.repository';
import { NotificationRepository } from './persistence/repositories/notification/notification.repository';
import { RequestRepository } from './persistence/repositories/request/request.repository';
import { SubscriptionRepository } from './persistence/repositories/subscription/subscription.repository';
import { TokenRepository } from './persistence/repositories/token/token.repository';
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
  membersFacade: token<MembersFacade>('membersFacade'),
  membersController: token<MembersController>('membersController'),
  memberRepository: token<MemberRepository>('memberRepository'),
  sessionProvider: token<SessionProvider>('authenticatedMemberProvider'),
  authenticationController: token<AuthenticationController>('authenticationController'),
  authenticationService: token<AuthenticationService>('authenticationService'),
  tokenRepository: token<TokenRepository>('tokenRepository'),
  sessionController: token<SessionController>('sessionController'),
  requestController: token<RequestController>('requestController'),
  requestRepository: token<RequestRepository>('requestRepository'),
  commentService: token<CommentService>('commentService'),
  commentRepository: token<CommentRepository>('commentRepository'),
  subscriptionService: token<SubscriptionService>('subscriptionService'),
  subscriptionRepository: token<SubscriptionRepository>('subscriptionRepository'),
  notificationController: token<NotificationController>('notificationController'),
  notificationRepository: token<NotificationRepository>('notificationRepository'),
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
  createRequest: token<CreateRequest>('createRequest'),
  editRequest: token<EditRequest>('editRequest'),
  createRequestComment: token<CreateRequestComment>('createRequestComment'),
  createMember: token<CreateMember>('createMember'),
  updateMemberProfile: token<UpdateMemberProfile>('updateMemberProfile'),
  markNotificationAsRead: token<MarkNotificationAsRead>('markNotificationAsRead'),
  registerDevice: token<RegisterDevice>('registerDevice'),
  sendPushNotification: token<SendPushNotification>('sendPushNotification'),
};

export const QUERIES = {
  getToken: token<GetToken>('getToken'),
  getAuthenticatedMember: token<GetAuthenticatedMember>('getAuthenticatedMember'),
  listRequests: token<ListRequests>('listRequests'),
  getRequest: token<GetRequest>('getRequest'),
  listMembers: token<ListMembers>('listMembers'),
  getMember: token<GetMember>('getMember'),
  getMemberNotifications: token<GetMemberNotifications>('getMemberNotifications'),
};

export const EVENT_HANDLERS = {
  sendAuthenticationEmail: token<SendAuthenticationEmail>('sendAuthenticationEmail'),
  createRequestSubscription: token<CreateRequestSubscription>('createRequestSubscription'),
  notifyRequestCreated: token<NotifyRequestCreated>('notifyRequestCreated'),
  notifyRequestCommentCreated: token<NotifyRequestCommentCreated>('notifyRequestCommentCreated'),
  createMemberSubscription: token<CreateMemberSubscription>('createMemberSubscription'),
};
