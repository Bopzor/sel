import { createContainer } from 'ditox';
import nodemailer from 'nodemailer';

import { TOKENS } from 'src/tokens';

import { createEnvConfig } from './config';
import { RuntimeDateAdapter } from './date';
import { MjmlEmailRenderer, NodemailerEmailSender } from './email';
import { NanoIdGenerator } from './generator';
import { WebPushNotification } from './push-notification';

export const container = createContainer();

container.bindFactory(TOKENS.date, RuntimeDateAdapter.inject);
container.bindFactory(TOKENS.emailRenderer, MjmlEmailRenderer.inject);
container.bindFactory(TOKENS.emailSender, NodemailerEmailSender.inject);
container.bindFactory(TOKENS.generator, NanoIdGenerator.inject);
container.bindFactory(TOKENS.config, createEnvConfig);
container.bindValue(TOKENS.logger, console);
container.bindValue(TOKENS.nodemailer, nodemailer);
container.bindFactory(TOKENS.pushNotification, WebPushNotification.inject);
