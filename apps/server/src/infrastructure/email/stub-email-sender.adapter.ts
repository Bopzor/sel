import { EmailSenderPort } from './email-sender.port';
import { Email } from './email.types';

export class StubEmailSenderAdapter implements EmailSenderPort {
  emails = new Array<Email>();

  async send(email: Email): Promise<void> {
    this.emails.push(email);
  }
}
