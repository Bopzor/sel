import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';

import { CommandHandler } from '../../../infrastructure/cqs/command-handler';
import { DatePort } from '../../../infrastructure/date/date.port';
import { EventPublisher } from '../../../infrastructure/events/event-publisher';
import { Database } from '../../../persistence/database';
import * as schema from '../../../persistence/schema';
import { TOKENS } from '../../../tokens';
import { InterestNotAdded } from '../../interest-errors';
import { InterestMemberEdited } from '../../interest-events';

export type EditInterestMemberCommand = {
  interestId: string;
  memberId: string;
  description?: string;
};

export class EditInterestMember implements CommandHandler<EditInterestMemberCommand> {
  static inject = injectableClass(this, TOKENS.date, TOKENS.database, TOKENS.eventPublisher);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: EditInterestMemberCommand): Promise<void> {
    const { interestId, memberId, description } = command;
    const now = this.dateAdapter.now();

    const memberInterest = await this.database.db.query.membersInterests.findFirst({
      where: and(
        eq(schema.membersInterests.interestId, interestId),
        eq(schema.membersInterests.memberId, memberId),
      ),
    });

    if (!memberInterest) {
      throw new InterestNotAdded(interestId);
    }

    await this.database.db
      .update(schema.membersInterests)
      .set({
        description: description ?? null,
        updatedAt: now,
      })
      .where(eq(schema.membersInterests.id, memberInterest.id));

    this.eventPublisher.publish(new InterestMemberEdited(interestId, memberId));
  }
}
