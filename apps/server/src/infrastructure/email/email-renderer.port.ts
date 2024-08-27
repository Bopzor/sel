import { Email } from './email.types';

export interface EmailRendererPort {
  render(props: { subject: string; html: string[]; text: string[] }): Omit<Email, 'to'>;
  renderHtml(preview: string, html: string): string;
  renderText(text: string): string;
  userContent(children: string): string;
}
