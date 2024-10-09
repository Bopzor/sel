import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Member = typeof schema.members.$inferSelect;

export class MemberEvent<Payload = never> extends DomainEvent<Payload> {
  entity = 'member';
}

export class MemberCreatedEvent extends MemberEvent {
  constructor(memberId: string) {
    super(memberId);
  }
}
