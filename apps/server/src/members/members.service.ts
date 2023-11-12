import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { EventsPort } from '../infrastructure/events/events.port';
import { TOKENS } from '../tokens';

import { MemberStatus } from './entities';
import { OnboardingCompleted } from './events';
import { MembersRepository } from './members.repository';

export class MembersService {
  static inject = injectableClass(this, TOKENS.events, TOKENS.membersRepository);

  constructor(private readonly events: EventsPort, private readonly membersRepository: MembersRepository) {}

  async updateMemberProfile(memberId: string, data: shared.UpdateMemberProfileData): Promise<void> {
    await this.membersRepository.update(memberId, data);

    if (data.onboardingCompleted !== undefined) {
      await this.setOnboardingCompleted(memberId, data.onboardingCompleted);
    }
  }

  private async setOnboardingCompleted(memberId: string, completed: boolean): Promise<void> {
    await this.membersRepository.setStatus(
      memberId,
      completed ? MemberStatus.active : MemberStatus.onboarding
    );

    if (completed) {
      this.events.emit(new OnboardingCompleted(memberId));
    }
  }
}
