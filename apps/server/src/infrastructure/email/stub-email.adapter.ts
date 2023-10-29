import { Email, EmailPort } from './email.port';

export class StubEmailAdapter implements EmailPort {
  emails = new Array<Email>();

  async send(email: Email): Promise<void> {
    this.emails.push(email);
  }
}
