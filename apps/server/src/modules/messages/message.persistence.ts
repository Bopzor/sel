import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

export async function insertMessage(html: string, fileIds: string[]) {
  const generator = container.resolve(TOKENS.generator);
  const htmlParser = container.resolve(TOKENS.htmlParser);

  const [{ id: messageId }] = await db
    .insert(schema.messages)
    .values({
      id: generator.id(),
      html,
      text: htmlParser.getTextContent(html),
    })
    .returning({ id: schema.messages.id });

  await insertAttachments(messageId, fileIds);

  return messageId;
}

export async function updateMessage(messageId: string, html: string, fileIds: string[]) {
  const htmlParser = container.resolve(TOKENS.htmlParser);

  await db
    .update(schema.messages)
    .set({
      html,
      text: htmlParser.getTextContent(html),
    })
    .where(eq(schema.messages.id, messageId));

  await db.delete(schema.attachments).where(eq(schema.attachments.messageId, messageId));
  await insertAttachments(messageId, fileIds);
}

async function insertAttachments(messageId: string, fileIds: string[]) {
  const generator = container.resolve(TOKENS.generator);

  if (fileIds.length === 0) {
    return;
  }

  await db.insert(schema.attachments).values(
    fileIds.map((fileId) => ({
      id: generator.id(),
      messageId,
      fileId,
    })),
  );
}
