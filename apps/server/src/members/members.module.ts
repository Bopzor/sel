import { injectableClass } from 'ditox';

import { EventsPort } from '../infrastructure/events/events.port';
import { TOKENS } from '../tokens';

import { MemberCreated } from './events';
import { MembersService } from './members.service';

export class MembersModule {
  static inject = injectableClass(this, TOKENS.events, TOKENS.membersService);

  constructor(private readonly events: EventsPort, private readonly membersService: MembersService) {}

  init() {
    this.events.addEventListener(
      MemberCreated,
      this.membersService.createMemberSubscription.bind(this.membersService)
    );
  }
}
