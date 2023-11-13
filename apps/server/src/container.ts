import { createContainer } from 'ditox';
import nodemailer from 'nodemailer';

import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationFacadeImpl } from './authentication/authentication.facade';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationService } from './authentication/authentication.service';
import { SqlTokenRepository } from './authentication/sql-token.repository';
import { EnvConfigAdapter } from './infrastructure/config/env-config.adapter';
import { NativeDateAdapter } from './infrastructure/date/native-date.adapter';
import { MjmlEmailRendererAdapter } from './infrastructure/email/mjml-email-renderer.adapter';
import { NodemailerEmailSenderAdapter } from './infrastructure/email/nodemailer-email-sender.adapter';
import { SlackErrorReporterAdapter } from './infrastructure/error-reporter/slack-error-reporter.adapter';
import { EmitterEventsAdapter } from './infrastructure/events/emitter-events.adapter';
import { EventsLogger } from './infrastructure/events/events-logger';
import { EventsPersistor } from './infrastructure/events/events-persistor';
import { EventsSlackPublisher } from './infrastructure/events/events-slack-publisher';
import { NanoIdGenerator } from './infrastructure/generator/nanoid-generator.adapter';
import { ConsoleLogger } from './infrastructure/logger/console-logger.adapter';
import { Database } from './infrastructure/persistence/database';
import { WebSlackClientAdapter } from './infrastructure/slack/web-slack-client.adapter';
import { MembersController } from './members/members.controller';
import { MembersFacadeImpl } from './members/members.facade';
import { MembersService } from './members/members.service';
import { SqlMembersRepository } from './members/sql-members.repository';
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
container.bindFactory(TOKENS.logger, ConsoleLogger.inject);
container.bindFactory(TOKENS.slackClient, WebSlackClientAdapter.inject);
container.bindFactory(TOKENS.errorReporter, SlackErrorReporterAdapter.inject);

container.bindFactory(TOKENS.events, EmitterEventsAdapter.inject);
container.bindFactory(TOKENS.eventsLogger, EventsLogger.inject);
container.bindFactory(TOKENS.eventsPersistor, EventsPersistor.inject);
container.bindFactory(TOKENS.eventsSlackPublisher, EventsSlackPublisher.inject);

container.bindFactory(TOKENS.server, Server.inject);
container.bindFactory(TOKENS.database, Database.inject);
container.bindFactory(TOKENS.emailRenderer, MjmlEmailRendererAdapter.inject);
container.bindValue(TOKENS.nodemailer, nodemailer);
container.bindFactory(TOKENS.emailSender, NodemailerEmailSenderAdapter.inject);

container.bindFactory(TOKENS.membersFacade, MembersFacadeImpl.inject);
container.bindFactory(TOKENS.membersController, MembersController.inject);
container.bindFactory(TOKENS.membersService, MembersService.inject);
container.bindFactory(TOKENS.membersRepository, SqlMembersRepository.inject);

container.bindFactory(TOKENS.authenticationModule, AuthenticationModule.inject);
container.bindFactory(TOKENS.authenticationFacade, AuthenticationFacadeImpl.inject);
container.bindFactory(TOKENS.authenticationController, AuthenticationController.inject);
container.bindFactory(TOKENS.authenticationService, AuthenticationService.inject);
container.bindFactory(TOKENS.tokenRepository, SqlTokenRepository.inject);

container.bindFactory(TOKENS.sessionProvider, SessionProvider.inject);
container.bindFactory(TOKENS.sessionController, SessionController.inject);
container.bindFactory(TOKENS.sessionService, SessionService.inject);
