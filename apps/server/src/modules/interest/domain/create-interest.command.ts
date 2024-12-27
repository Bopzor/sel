import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestCreatedEvent } from '../interest.entities';

export type CreateInterestCommand = {
  interestId: string;
  label: string;
  description: string;
  imageId: string;
};

export async function createInterest(command: CreateInterestCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { interestId, label, description, imageId } = command;

  await db.insert(schema.interests).values({
    id: interestId,
    label,
    description,
    imageId,
  });

  events.publish(new InterestCreatedEvent(interestId));
}
