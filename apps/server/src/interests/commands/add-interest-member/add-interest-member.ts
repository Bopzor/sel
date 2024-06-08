import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';

import { CommandHandler } from '../../../infrastructure/cqs/command-handler';
import { DatePort } from '../../../infrastructure/date/date.port';
import { EventPublisher } from '../../../infrastructure/events/event-publisher';
import { GeneratorPort } from '../../../infrastructure/generator/generator.port';
import { Database } from '../../../persistence/database';
import * as schema from '../../../persistence/schema';
import { TOKENS } from '../../../tokens';
import { InterestAlreadyAdded } from '../../interest-errors';
import { InterestMemberAdded } from '../../interest-events';

export type AddInterestMemberCommand = {
  interestId: string;
  memberId: string;
  description?: string;
};

export class AddInterestMember implements CommandHandler<AddInterestMemberCommand> {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.database,
    TOKENS.eventPublisher,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: AddInterestMemberCommand): Promise<void> {
    const { interestId, memberId, description } = command;
    const now = this.dateAdapter.now();

    const existing = await this.database.db.query.membersInterests.findFirst({
      where: and(
        eq(schema.membersInterests.interestId, interestId),
        eq(schema.membersInterests.memberId, memberId),
      ),
    });

    if (existing) {
      throw new InterestAlreadyAdded(interestId);
    }

    await this.database.db.insert(schema.membersInterests).values({
      id: this.generator.id(),
      interestId,
      memberId,
      description,
      createdAt: now,
      updatedAt: now,
    });

    this.eventPublisher.publish(new InterestMemberAdded(interestId, memberId));
  }
}
