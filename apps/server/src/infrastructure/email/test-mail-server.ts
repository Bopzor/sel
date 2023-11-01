import { promisify } from 'node:util';

import MailDev, { Email } from 'maildev';

import { ConfigPort } from '../config/config.port';

// cspell:word maildev

export class TestMailSever {
  emails = new Array<Email>();

  private maildev: MailDev;

  constructor(config: ConfigPort) {
    this.maildev = new MailDev({
      smtp: config.email.port,
      web: 1080,
      silent: true,
    });

    this.maildev.on('new', (email) => {
      this.emails.push(email);
    });
  }

  async listen() {
    await promisify(this.maildev.listen.bind(this.maildev))();
  }

  async close() {
    await promisify(this.maildev.close.bind(this.maildev))();
  }
}
