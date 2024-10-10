import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import { findMemberById } from '../../member';
import { AuthenticationLinkRequestedEvent } from '../authentication.entities';

export async function sendAuthenticationEmail(event: AuthenticationLinkRequestedEvent) {
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const emailSender = container.resolve(TOKENS.emailSender);

  const member = defined(await findMemberById(event.entityId));
  const { link } = event.payload;

  await emailSender.send({
    to: member.email,
    ...emailRenderer.render({
      subject: 'Lien de connexion',
      html: [
        `Bonjour ${member.firstName},`,
        `Pour vous connecter à l'app du SEL, cliquez sur le lien suivant : <a href="${link}">${link}</a>`,
        `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
      ],
      text: [
        `Bonjour ${member.firstName},`,
        `Pour vous connecter à l'app du SEL, ouvrez le lien suivant depuis un navigateur : ${link}`,
        `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
      ],
    }),
  });
}
