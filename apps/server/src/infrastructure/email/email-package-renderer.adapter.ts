import emails from '@sel/emails';
import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { EmailRendererPort } from './email-renderer.port';
import { EmailKind, EmailVariables } from './email.types';

export class EmailPackageRendererAdapter implements EmailRendererPort {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: ConfigPort) {}

  render<Kind extends EmailKind>(
    kind: EmailKind,
    variables: EmailVariables[Kind],
  ): { subject: string; text: string; html: string } {
    const renderer = emails[kind] as (variables: object) => {
      subject: string;
      text: string;
      html: string;
    };

    return renderer({
      appBaseUrl: this.config.app.baseUrl,
      ...variables,
    });
  }
}
