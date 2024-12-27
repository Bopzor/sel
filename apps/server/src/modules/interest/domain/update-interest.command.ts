import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestUpdatedEvent } from '../interest.entities';
import { updateInterest as updateInterestFn } from '../interest.persistence';

export type UpdateInterestCommand = {
  interestId: string;
  label?: string;
  description?: string;
  imageId?: string;
};

export async function updateInterest(command: UpdateInterestCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { interestId, label, description, imageId } = command;

  const image = imageId ? await db.query.files.findFirst({ where: eq(schema.files.id, imageId) }) : undefined;

  await updateInterestFn(interestId, {
    label,
    description,
    imageId: image?.id,
  });

  events.publish(new InterestUpdatedEvent(interestId));
}
