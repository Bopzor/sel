import { Container, token } from 'ditox';

import { AuthenticationController } from './authentication/authentication.controller.js';
import { AuthenticationFacade } from './authentication/authentication.facade.js';
import { AuthenticationService } from './authentication/authentication.service.js';
import { TokenRepository } from './authentication/token.repository.js';
import { ConfigPort } from './infrastructure/config/config.port.js';
import { DatePort } from './infrastructure/date/date.port.js';
import { EmailPort } from './infrastructure/email/email.port.js';
import { Nodemailer } from './infrastructure/email/nodemailer-email.adapter.js';
import { GeneratorPort } from './infrastructure/generator/generator.port.js';
import { LoggerPort } from './infrastructure/logger/logger.port.js';
import { Database } from './infrastructure/persistence/database.js';
import { MembersController } from './members/members.controller.js';
import { MembersFacade } from './members/members.facade.js';
import { MembersRepository } from './members/members.repository.js';
import { MembersService } from './members/members.service.js';
import { Server } from './server.js';
import { SessionController } from './session/session.controller.js';
import { SessionProvider } from './session/session.provider.js';
import { SessionService } from './session/session.service.js';

export const TOKENS = {
  container: token<Container>('container'),
  config: token<ConfigPort>('config'),
  date: token<DatePort>('date'),
  generator: token<GeneratorPort>('generator'),
  logger: token<LoggerPort>('logger'),
  server: token<Server>('server'),
  database: token<Database>('database'),
  nodemailer: token<Nodemailer>('nodemailer'),
  email: token<EmailPort>('email'),
  membersFacade: token<MembersFacade>('membersFacade'),
  membersController: token<MembersController>('membersController'),
  membersService: token<MembersService>('membersService'),
  membersRepository: token<MembersRepository>('membersRepository'),
  sessionProvider: token<SessionProvider>('authenticatedMemberProvider'),
  authenticationFacade: token<AuthenticationFacade>('authenticationFacade'),
  authenticationController: token<AuthenticationController>('authenticationController'),
  authenticationService: token<AuthenticationService>('authenticationService'),
  tokenRepository: token<TokenRepository>('tokenRepository'),
  sessionController: token<SessionController>('sessionController'),
  sessionService: token<SessionService>('sessionService'),
};
