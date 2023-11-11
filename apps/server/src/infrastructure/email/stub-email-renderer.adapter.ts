import { EmailRendererPort } from './email-renderer.port';
import { EmailKind, EmailVariables } from './email.types';

export class StubEmailRendererAdapter implements EmailRendererPort {
  render<Kind extends EmailKind>(
    kind: EmailKind,
    variables: EmailVariables[Kind]
  ): [text: string, html: string] {
    return [
      JSON.stringify({ type: 'text', kind, variables }),
      JSON.stringify({ type: 'html', kind, variables }),
    ];
  }
}
