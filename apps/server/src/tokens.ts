import { token } from 'ditox';

import { Config } from './infrastructure/config';
import { DatePort } from './infrastructure/date';
import { EmailRenderer, EmailSender, Nodemailer } from './infrastructure/email';
import { ErrorReporter } from './infrastructure/error-reporter';
import { Events } from './infrastructure/events';
import { Generator } from './infrastructure/generator';
import { HtmlParser } from './infrastructure/html-parser';
import { Logger } from './infrastructure/logger';
import { PushNotification } from './infrastructure/push-notification';
import { SlackClient } from './infrastructure/slack';
import { TransactionService } from './modules/transaction/domain/transaction.service';

export const TOKENS = {
  config: token<Config>('config'),
  date: token<DatePort>('date'),
  emailRenderer: token<EmailRenderer>('emailRenderer'),
  emailSender: token<EmailSender>('emailSender'),
  errorReporter: token<ErrorReporter>('errorReporter'),
  events: token<Events>('events'),
  generator: token<Generator>('generator'),
  htmlParser: token<HtmlParser>('htmlParser'),
  logger: token<Logger>('logger'),
  nodemailer: token<Nodemailer>('nodemailer'),
  pushNotification: token<PushNotification>('pushNotification'),
  transactionService: token<TransactionService>('transactionService'),
  slackClient: token<SlackClient>('slackClient'),
};
