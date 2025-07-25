import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Member } from 'src/modules/member';
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
      },
    }),
  );

  const author = information.author;

  if (author) {
    await notify(null, 'InformationPublished', (member) =>
      getInformationContext(member, information, author),
    );
  } else {
    const config = defined(await db.query.config.findFirst());
    await notify(null, 'NewsPublished', (member) => getNewsContext(member, information, config.letsName));
  }
}

function getNewsContext(
  member: Member,
  information: Information,
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
        html: information.html,
        text: information.text,
      },
    },
  };
}

function getInformationContext(
  member: Member,
  information: Information,
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
        html: information.html,
        text: information.text,
      },
    },
  };
}
