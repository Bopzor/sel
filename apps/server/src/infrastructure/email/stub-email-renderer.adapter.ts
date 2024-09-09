import { EmailRendererPort } from './email-renderer.port';
import { Email } from './email.types';

export class StubEmailRendererAdapter implements EmailRendererPort {
  render(props: { subject: string; html: string[]; text: string[] }): Omit<Email, 'to'> {
    return {
      subject: props.subject,
      html: props.html.join('\n'),
      text: props.text.join('\n'),
    };
  }

  renderHtml(): string {
    throw new Error('Method not implemented.');
  }

  renderText(): string {
    throw new Error('Method not implemented.');
  }

  userContent(children: string): string {
    return children;
  }
}
