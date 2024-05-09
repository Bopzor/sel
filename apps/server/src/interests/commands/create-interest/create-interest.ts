import { injectableClass } from 'ditox';

import { CommandHandler } from '../../../infrastructure/cqs/command-handler';
import { DatePort } from '../../../infrastructure/date/date.port';
import { EventPublisher } from '../../../infrastructure/events/event-publisher';
import { Database } from '../../../persistence/database';
import * as schema from '../../../persistence/schema';
import { TOKENS } from '../../../tokens';
import { InterestCreated } from '../../interest-events';

export type CreateInterestCommand = {
  interestId: string;
  label: string;
  description: string;
};

export class CreateInterest implements CommandHandler<CreateInterestCommand> {
  static inject = injectableClass(this, TOKENS.date, TOKENS.database, TOKENS.eventPublisher);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: CreateInterestCommand): Promise<void> {
    const { interestId, label, description } = command;
    const now = this.dateAdapter.now();

    await this.database.db.insert(schema.interests).values({
      id: interestId,
      label,
      description,
      createdAt: now,
      updatedAt: now,
    });

    this.eventPublisher.publish(new InterestCreated(interestId));
  }
}
