import { EmailRendererPort } from './email-renderer.port';
import { EmailKind, EmailVariables } from './email.types';

export class StubEmailRendererAdapter implements EmailRendererPort {
  render<Kind extends EmailKind>(
    kind: EmailKind,
    variables: EmailVariables[Kind]
  ): { subject: string; text: string; html: string } {
    return {
      subject: 'subject',
      text: JSON.stringify({ type: 'text', kind, variables }),
      html: JSON.stringify({ type: 'html', kind, variables }),
    };
  }
}
