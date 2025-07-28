import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

export async function insertMessage(html: string) {
  const generator = container.resolve(TOKENS.generator);
  const htmlParser = container.resolve(TOKENS.htmlParser);

  const [{ id }] = await db
    .insert(schema.messages)
    .values({
      id: generator.id(),
      html,
      text: htmlParser.getTextContent(html),
    })
    .returning({ id: schema.messages.id });

  return id;
}

export async function updateMessage(messageId: string, html: string) {
  const htmlParser = container.resolve(TOKENS.htmlParser);

  await db
    .update(schema.messages)
    .set({
      html,
      text: htmlParser.getTextContent(html),
    })
    .where(eq(schema.messages.id, messageId));
}
