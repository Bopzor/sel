import { Container, token } from 'ditox';

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
import { GeneratorPort } from './infrastructure/generator/generator.port';
import { HtmlParserPort } from './infrastructure/html-parser/html-parser.port';
import { LoggerPort } from './infrastructure/logger/logger.port';
import { PushNotificationPort } from './infrastructure/push-notification/push-notification.port';
import { SlackClientPort } from './infrastructure/slack/slack-client.port';
import { TranslationPort } from './infrastructure/translation/translation.port';
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
import { CommentRepository } from './persistence/repositories/comment/comment.repository';
import { EventRepository } from './persistence/repositories/event/event.repository';
import { MemberRepository } from './persistence/repositories/member/member.repository';
import { MemberDeviceRepository } from './persistence/repositories/member-device/member-device.repository';
import { RequestRepository } from './persistence/repositories/request/request.repository';
import { RequestAnswerRepository } from './persistence/repositories/request-answer/request-answer.repository';
import { TokenRepository } from './persistence/repositories/token/token.repository';
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
import { AcceptTransaction } from './transactions/commands/accept-transaction';
import { CancelTransaction } from './transactions/commands/cancel-transaction';
import { CreateTransaction } from './transactions/commands/create-transaction';
import { NotifyTransactionCanceled } from './transactions/event-handlers/notify-transaction-canceled';
import { NotifyTransactionCompleted } from './transactions/event-handlers/notify-transaction-completed';
import { NotifyTransactionPending } from './transactions/event-handlers/notify-transaction-pending';
import { TransactionController } from './transactions/transaction.controller';
import { TransactionService } from './transactions/transaction.service';

export const TOKENS = {
  container: token<Container>('container'),
  application: token<Application>('application'),
  config: token<ConfigPort>('config'),
  date: token<DatePort>('date'),
  generator: token<GeneratorPort>('generator'),
  logger: token<LoggerPort>('logger'),
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
  membersController: token<MembersController>('membersController'),
  memberRepository: token<MemberRepository>('memberRepository'),
  sessionProvider: token<SessionProvider>('authenticatedMemberProvider'),
  authenticationController: token<AuthenticationController>('authenticationController'),
  authenticationService: token<AuthenticationService>('authenticationService'),
  tokenRepository: token<TokenRepository>('tokenRepository'),
  sessionController: token<SessionController>('sessionController'),
  requestController: token<RequestController>('requestController'),
  requestRepository: token<RequestRepository>('requestRepository'),
  requestAnswerRepository: token<RequestAnswerRepository>('requestAnswerRepository'),
  eventController: token<EventController>('eventController'),
  eventRepository: token<EventRepository>('eventRepository'),
  interestController: token<InterestController>('interestController'),
  transactionController: token<TransactionController>('transactionController'),
  transactionService: token<TransactionService>('transactionService'),
  commentService: token<CommentService>('commentService'),
  commentRepository: token<CommentRepository>('commentRepository'),
  notificationController: token<NotificationController>('notificationController'),
  notificationService: token<NotificationService>('notificationService'),
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
  changeRequestStatus: token<ChangeRequestStatus>('changeRequestStatus'),
  setRequestAnswer: token<SetRequestAnswer>('setRequestAnswer'),
  createEvent: token<CreateEvent>('createEvent'),
  updateEvent: token<UpdateEvent>('updateEvent'),
  setEventParticipation: token<SetEventParticipation>('setEventParticipation'),
  createInterest: token<CreateInterest>('createInterest'),
  addInterestMember: token<AddInterestMember>('addInterestMember'),
  editInterestMember: token<EditInterestMember>('editInterestMember'),
  removeInterestMember: token<RemoveInterestMember>('removeInterestMember'),
  createTransaction: token<CreateTransaction>('createTransaction'),
  acceptTransaction: token<AcceptTransaction>('acceptTransaction'),
  cancelTransaction: token<CancelTransaction>('cancelTransaction'),
  createMember: token<CreateMember>('createMember'),
  updateMemberProfile: token<UpdateMemberProfile>('updateMemberProfile'),
  changeNotificationDeliveryType: token<ChangeNotificationDeliveryType>('changeNotificationDeliveryType'),
  registerDevice: token<RegisterDevice>('registerDevice'),
  createEventComment: token<CreateEventComment>('createEventComment'),
};

export const QUERIES = {
  getToken: token<GetToken>('getToken'),
  getAuthenticatedMember: token<GetAuthenticatedMember>('getAuthenticatedMember'),
  listRequests: token<ListRequests>('listRequests'),
  getRequest: token<GetRequest>('getRequest'),
  listEvents: token<ListEvents>('listEvents'),
  getEvent: token<GetEvent>('getEvent'),
  listInterests: token<ListInterests>('listInterests'),
  listMembers: token<ListMembers>('listMembers'),
  getMember: token<GetMember>('getMember'),
  getMemberNotifications: token<GetMemberNotifications>('getMemberNotifications'),
};

export const EVENT_HANDLERS = {
  eventsLogger: token<EventsLogger>('eventsLogger'),
  eventsPersistor: token<EventsPersistor>('eventsPersistor'),
  eventsSlackPublisher: token<EventsSlackPublisher>('eventsSlackPublisher'),
  sendAuthenticationEmail: token<SendAuthenticationEmail>('sendAuthenticationEmail'),
  notifyRequestCreated: token<NotifyRequestCreated>('notifyRequestCreated'),
  notifyRequestCommentCreated: token<NotifyRequestCommentCreated>('notifyRequestCommentCreated'),
  notifyRequestStatusChanged: token<NotifyRequestStatusChanged>('notifyRequestStatusChanged'),
  notifyEventCreated: token<NotifyEventCreated>('notifyEventCreated'),
  notifyEventParticipationSet: token<NotifyEventParticipationSet>('notifyEventParticipationSet'),
  notifyEventCommentCreated: token<NotifyEventCommentCreated>('notifyEventCommentCreated'),
  notifyTransactionPending: token<NotifyTransactionPending>('notifyTransactionPending'),
  notifyTransactionCompleted: token<NotifyTransactionCompleted>('notifyTransactionCompleted'),
  notifyTransactionCanceled: token<NotifyTransactionCanceled>('notifyTransactionCanceled'),
};
