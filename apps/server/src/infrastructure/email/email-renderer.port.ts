import { Email } from './email.types';

export interface EmailRendererPort {
  render(props: { subject: string; html: string[]; text: string[] }): Omit<Email, 'to'>;
  render2(props: { subject: string; html: string; text: string }): Omit<Email, 'to'>;
  userContent(children: string): string;
}
