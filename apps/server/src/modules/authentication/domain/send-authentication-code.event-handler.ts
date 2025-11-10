import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import { findMemberById } from '../../member';
import { AuthenticationCodeRequestedEvent } from '../authentication.entities';

export async function sendAuthenticationCode(event: AuthenticationCodeRequestedEvent) {
  const config = container.resolve(TOKENS.config);
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const emailSender = container.resolve(TOKENS.emailSender);

  const member = defined(await findMemberById(event.entityId));
  const { code } = event.payload;

  const url = new URL('/authentication', config.app.baseUrl);

  url.searchParams.set('code', code);

  await emailSender.send({
    to: member.email,
    ...emailRenderer.render({
      subject: 'Code de connexion',
      html: [
        `Bonjour ${member.firstName},`,
        "Voici votre code pour vous connecter à l'app du SEL :",
        `<mj-spacer height="50px" />`,
        `<a href="${url.toString()}" class="code">${code}</a>`,
        `<mj-spacer height="50px" />`,
        `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
      ],
      style: `
        .code {
          color: #111111;
          font-weight: bold;
          font-size: 24px;
          text-decoration: none;
          letter-spacing: 4px;
          padding: 8px 16px;
          border: 1px solid #CCC;
          border-radius: 4px;
          background: #fafafc;
        }`,
      text: [
        `Bonjour ${member.firstName},`,
        `Voici votre code pour vous connecter à l'app du SEL : ${code}`,
        `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
      ],
    }),
  });
}
