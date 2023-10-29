import { promisify } from 'node:util';

import MailDev, { Email } from 'maildev';

import { ConfigPort } from '../config/config.port';

export class TestMailSever {
  emails = new Array<Email>();

  private maildev: MailDev;

  constructor(config: ConfigPort) {
    this.maildev = new MailDev({
      web: 1080,
      smtp: config.email.port,
    });

    this.maildev.on('new', (email) => {
      this.emails.push(email);
    });
  }

  async listen() {
    await promisify(this.maildev.listen)();
  }

  async close() {
    await promisify(this.maildev.close)();
  }
}
