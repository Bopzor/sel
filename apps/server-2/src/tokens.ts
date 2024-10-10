import { token } from 'ditox';

import { Config } from './infrastructure/config';
import { DatePort } from './infrastructure/date';
import { EmailRenderer, EmailSender, Nodemailer } from './infrastructure/email';
import { Generator } from './infrastructure/generator';
import { HtmlParser } from './infrastructure/html-parser';
import { Logger } from './infrastructure/logger';
import { PushNotification } from './infrastructure/push-notification';

export const TOKENS = {
  config: token<Config>('config'),
  date: token<DatePort>('date'),
  emailRenderer: token<EmailRenderer>('emailRenderer'),
  emailSender: token<EmailSender>('emailSender'),
  generator: token<Generator>('generator'),
  htmlParser: token<HtmlParser>('htmlParser'),
  logger: token<Logger>('logger'),
  nodemailer: token<Nodemailer>('nodemailer'),
  pushNotification: token<PushNotification>('pushNotification'),
};
