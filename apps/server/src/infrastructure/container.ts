import { createContainer } from 'ditox';
import nodemailer from 'nodemailer';

import { TransactionService } from 'src/modules/transaction/domain/transaction.service';
import { TOKENS } from 'src/tokens';

import { createEnvConfig } from './config';
import { RuntimeDateAdapter } from './date';
import { MjmlEmailRenderer, NodemailerEmailSender } from './email';
import { SlackErrorReporter } from './error-reporter';
import { EmitterEvents } from './events';
import { NanoIdGenerator } from './generator';
import { CheerioHtmlParser } from './html-parser';
import { ConsoleLogger } from './logger';
import { WebPushNotification } from './push-notification';
import { WebSlackClientAdapter } from './slack';
import { MinioStorage } from './storage';

export const container = createContainer();

container.bindFactory(TOKENS.config, createEnvConfig);
container.bindFactory(TOKENS.date, RuntimeDateAdapter.inject);
container.bindFactory(TOKENS.emailRenderer, MjmlEmailRenderer.inject);
container.bindFactory(TOKENS.emailSender, NodemailerEmailSender.inject);
container.bindFactory(TOKENS.errorReporter, SlackErrorReporter.inject);
container.bindFactory(TOKENS.events, EmitterEvents.inject);
container.bindFactory(TOKENS.generator, NanoIdGenerator.inject);
container.bindFactory(TOKENS.htmlParser, CheerioHtmlParser.inject);
container.bindFactory(TOKENS.logger, ConsoleLogger.inject);
container.bindValue(TOKENS.nodemailer, nodemailer);
container.bindFactory(TOKENS.pushNotification, WebPushNotification.inject);
container.bindFactory(TOKENS.slackClient, WebSlackClientAdapter.inject);
container.bindFactory(TOKENS.transactionService, TransactionService.inject);
container.bindFactory(TOKENS.storage, MinioStorage.inject);
