import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { OnboardingCompleted } from '../member-events';
import { MemberStatus } from '../member.entity';

export type UpdateMemberProfileCommand = {
  memberId: string;
  data: shared.UpdateMemberProfileData;
};

export class UpdateMemberProfile implements CommandHandler<UpdateMemberProfileCommand> {
  static inject = injectableClass(this, TOKENS.memberRepository, TOKENS.eventPublisher);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly eventPublisher: EventPublisherPort
  ) {}

  async handle({ memberId, data }: UpdateMemberProfileCommand): Promise<void> {
    await this.memberRepository.update(memberId, data);

    if (data.onboardingCompleted !== undefined) {
      await this.setOnboardingCompleted(memberId, data.onboardingCompleted);
    }
  }

  private async setOnboardingCompleted(memberId: string, completed: boolean): Promise<void> {
    await this.memberRepository.setStatus(
      memberId,
      completed ? MemberStatus.active : MemberStatus.onboarding
    );

    if (completed) {
      this.eventPublisher.publish(new OnboardingCompleted(memberId));
    }
  }
}
