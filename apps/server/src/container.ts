import { createContainer } from 'ditox';
import nodemailer from 'nodemailer';

import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationFacadeImpl } from './authentication/authentication.facade';
import { AuthenticationService } from './authentication/authentication.service';
import { SqlTokenRepository } from './authentication/sql-token.repository';
import { EnvConfigAdapter } from './infrastructure/config/env-config.adapter';
import { NativeDateAdapter } from './infrastructure/date/native-date.adapter';
import { NodemailerEmailAdapter } from './infrastructure/email/nodemailer-email.adapter';
import { NanoIdGenerator } from './infrastructure/generator/nanoid-generator.adapter';
import { Database } from './infrastructure/persistence/database';
import { MembersController } from './members/members.controller';
import { MembersFacadeImpl } from './members/members.facade';
import { SqlMembersRepository } from './members/sql-members.repository';
import { InMemoryRequestsRepository } from './requests/in-memory-requests.repository';
import { RequestsController } from './requests/requests.controller';
import { Server } from './server';
import { SessionController } from './session/session.controller';
import { SessionProvider } from './session/session.provider';
import { SessionService } from './session/session.service';
import { TOKENS } from './tokens';

export const container = createContainer();

container.bindValue(TOKENS.container, container);

container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.date, NativeDateAdapter.inject);
container.bindFactory(TOKENS.generator, NanoIdGenerator.inject);

container.bindFactory(TOKENS.server, Server.inject);
container.bindFactory(TOKENS.database, Database.inject);
container.bindValue(TOKENS.nodemailer, nodemailer);
container.bindFactory(TOKENS.email, NodemailerEmailAdapter.inject);

container.bindFactory(TOKENS.requestsRepository, InMemoryRequestsRepository.inject);
container.bindFactory(TOKENS.requestsController, RequestsController.inject);

container.bindFactory(TOKENS.membersFacade, MembersFacadeImpl.inject);
container.bindFactory(TOKENS.membersRepository, SqlMembersRepository.inject);
container.bindFactory(TOKENS.membersController, MembersController.inject);

container.bindFactory(TOKENS.authenticationFacade, AuthenticationFacadeImpl.inject);
container.bindFactory(TOKENS.authenticationController, AuthenticationController.inject);
container.bindFactory(TOKENS.authenticationService, AuthenticationService.inject);
container.bindFactory(TOKENS.tokenRepository, SqlTokenRepository.inject);

container.bindFactory(TOKENS.sessionProvider, SessionProvider.inject);
container.bindFactory(TOKENS.sessionController, SessionController.inject);
container.bindFactory(TOKENS.sessionService, SessionService.inject);
