import { Email } from './email.types';

export interface EmailSenderPort {
  send(email: Email): Promise<void>;
}
