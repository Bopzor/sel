import { EmailKind, EmailVariables } from './email.types';

export interface EmailRendererPort {
  render<Kind extends EmailKind>(
    kind: EmailKind,
    variables: EmailVariables[Kind]
  ): { subject: string; text: string; html: string };
}
