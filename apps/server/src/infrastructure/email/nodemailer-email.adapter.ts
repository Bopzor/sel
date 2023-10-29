import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { Email, EmailPort } from './email.port';

export type TransportOptions = {
  port: number;
  host: string;
  secure: boolean;
  auth: {
    type: 'login';
    user: string;
    pass: string;
  };
};

export type MessageConfiguration = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type Transporter = {
  sendMail(message: MessageConfiguration, cb: (err: Error | undefined) => void): void;
};

export interface Nodemailer {
  createTransport(transport: TransportOptions): Transporter;
}

export class NodemailerEmailAdapter implements EmailPort {
  static inject = injectableClass(this, TOKENS.config, TOKENS.nodemailer);

  private transporter: Transporter;
  private from: string;

  constructor(config: ConfigPort, nodemailer: Nodemailer) {
    this.from = config.email.sender;

    this.transporter = nodemailer.createTransport({
      port: config.email.port,
      host: config.email.host,
      secure: config.email.secure,
      auth: {
        type: 'login',
        user: config.email.sender,
        pass: config.email.password,
      },
    });
  }

  async send(email: Email): Promise<void> {
    const message: MessageConfiguration = {
      from: this.from,
      to: email.to,
      subject: email.subject,
      text: email.body.text,
      html: email.body.html,
    };

    return new Promise<void>((resolve, reject) => {
      this.transporter.sendMail(message, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
