import { assert } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { AuthenticationLinkRequestedEvent } from './authentication.entities';

export async function sendAuthenticationEmail(event: AuthenticationLinkRequestedEvent) {
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const emailSender = container.resolve(TOKENS.emailSender);

  const member = await db.query.members.findFirst({
    where: eq(schema.members.id, event.entityId),
  });

  assert(member !== undefined);

  await emailSender.send({
    to: member.email,
    ...emailRenderer.render({
      subject: 'Lien de connexion',
      html: [
        `Bonjour ${member.firstName},`,
        `Pour vous connecter à l'app du SEL, cliquez sur le lien suivant : <a href="${event.link}">${event.link}</a>`,
        `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
      ],
      text: [
        `Bonjour ${member.firstName},`,
        `Pour vous connecter à l'app du SEL, ouvrez le lien suivant depuis un navigateur : ${event.link}`,
        `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`,
      ],
    }),
  });
}
