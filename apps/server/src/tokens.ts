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
import { SlackClientPort } from './infrastructure/slack/slack-client.port';
import { MembersController } from './members/members.controller';
import { MembersFacade } from './members/members.facade';
import { MembersRepository } from './members/members.repository';
import { MembersService } from './members/members.service';
import { Persistor } from './persistor';
import { RequestController } from './requests/request.controller';
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
  persistor: token<Persistor>('persistor'),
  events: token<EventsPort>('events'),
  eventsLogger: token<EventsLogger>('eventsLogger'),
  eventsPersistor: token<EventsPersistor>('eventsPersistor'),
  eventsSlackPublisher: token<EventsSlackPublisher>('eventsSlackPublisher'),
  slackClient: token<SlackClientPort>('slackClientPort'),
  errorReporter: token<ErrorReporterPort>('errorReporter'),
  htmlParser: token<HtmlParserPort>('htmlParser'),
  server: token<Server>('server'),
  database: token<Database>('database'),
  nodemailer: token<Nodemailer>('nodemailer'),
  emailRenderer: token<EmailRendererPort>('emailRenderer'),
  emailSender: token<EmailSenderPort>('emailSender'),
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
  requestController: token<RequestController>('requestController'),
  requestService: token<RequestService>('requestService'),
  requestRepository: token<RequestRepository>('requestRepository'),
  commentsFacade: token<CommentsFacade>('commentsFacade'),
  commentsService: token<CommentsService>('commentsService'),
  commentsRepository: token<CommentsRepository>('commentsRepository'),
};
