import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Member } from 'src/modules/member';
import { Message, withAttachments } from 'src/modules/messages/message.entities';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { Information, InformationPublished } from '../information.entities';

export async function notifyInformationPublished({
  entityId: informationId,
}: InformationPublished): Promise<void> {
  const information = defined(
    await db.query.information.findFirst({
      where: eq(schema.information.id, informationId),
      with: {
        author: true,
        message: withAttachments,
      },
    }),
  );

  const author = information.author;

  if (author) {
    await notify({
      type: 'InformationPublished',
      getContext: (member) => getInformationContext(member, information, author),
      attachments: information.message.attachments,
    });
  } else {
    const config = defined(await db.query.config.findFirst());

    await notify({
      type: 'NewsPublished',
      getContext: (member) => getNewsContext(member, information, config.letsName),
      attachments: information.message.attachments,
    });
  }
}

function getNewsContext(
  member: Member,
  information: Information & { message: Message },
  letsName: string,
): ReturnType<GetNotificationContext<'NewsPublished'>> {
  return {
    member: {
      firstName: member.firstName,
    },
    information: {
      id: information.id,
      letsName,
      body: {
        html: information.message.html,
        text: information.message.text,
      },
    },
  };
}

function getInformationContext(
  member: Member,
  information: Information & { message: Message },
  author: Member,
): ReturnType<GetNotificationContext<'InformationPublished'>> {
  if (member.id === author.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    information: {
      id: information.id,
      author: {
        id: author.id,
        name: memberName(author),
      },
      title: information.title,
      body: {
        html: information.message.html,
        text: information.message.text,
      },
    },
  };
}
