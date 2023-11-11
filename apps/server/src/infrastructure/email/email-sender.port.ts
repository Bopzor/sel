import { Email, EmailKind } from './email.types';

export interface EmailSenderPort {
  send<Kind extends EmailKind>(email: Email<Kind>): Promise<void>;
}
