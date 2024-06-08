import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';

import { CommandHandler } from '../../../infrastructure/cqs/command-handler';
import { EventPublisher } from '../../../infrastructure/events/event-publisher';
import { Database } from '../../../persistence/database';
import * as schema from '../../../persistence/schema';
import { TOKENS } from '../../../tokens';
import { InterestNotAdded } from '../../interest-errors';
import { InterestMemberRemoved } from '../../interest-events';

export type RemoveInterestMemberCommand = {
  interestId: string;
  memberId: string;
  description?: string;
};

export class RemoveInterestMember implements CommandHandler<RemoveInterestMemberCommand> {
  static inject = injectableClass(this, TOKENS.database, TOKENS.eventPublisher);

  constructor(
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: RemoveInterestMemberCommand): Promise<void> {
    const { interestId, memberId } = command;

    const where = and(
      eq(schema.membersInterests.interestId, interestId),
      eq(schema.membersInterests.memberId, memberId),
    );

    const existing = await this.database.db.query.membersInterests.findFirst({ where });

    if (!existing) {
      throw new InterestNotAdded(interestId);
    }

    await this.database.db.delete(schema.membersInterests).where(where);

    this.eventPublisher.publish(new InterestMemberRemoved(interestId, memberId));
  }
}
