import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { SubscriptionFacade } from '../notifications/subscription.facade';
import { MemberRepository } from '../persistence/repositories/member/member.repository';
import { TOKENS } from '../tokens';

import { MemberStatus } from './entities';
import { MemberCreated, OnboardingCompleted } from './events';

export class MembersService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.events,
    TOKENS.subscriptionFacade,
    TOKENS.memberRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly events: EventsPort,
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly membersRepository: MemberRepository
  ) {}

  async createMember(firstName: string, lastName: string, email: string): Promise<string> {
    const memberId = this.generator.id();

    await this.membersRepository.insert({
      id: memberId,
      firstName,
      lastName,
      email,
    });

    this.events.emit(new MemberCreated(memberId));

    return memberId;
  }

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

  async createMemberSubscription(event: MemberCreated) {
    await this.subscriptionFacade.createSubscription('NewAppVersion', event.entityId);
    await this.subscriptionFacade.createSubscription('RequestCreated', event.entityId);
  }
}
