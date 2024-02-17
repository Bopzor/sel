import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { MemberNotFound } from '../member-errors';
import { OnboardingCompleted } from '../member-events';
import { MemberStatus } from '../member.entity';

export type UpdateMemberProfileCommand = {
  memberId: string;
  data: shared.UpdateMemberProfileData;
  onboardingCompleted?: boolean;
};

export class UpdateMemberProfile implements CommandHandler<UpdateMemberProfileCommand> {
  static inject = injectableClass(this, TOKENS.memberRepository, TOKENS.eventPublisher);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async handle({ memberId, data, onboardingCompleted }: UpdateMemberProfileCommand): Promise<void> {
    const member = await this.memberRepository.getMember(memberId);

    if (!member) {
      throw new MemberNotFound(memberId);
    }

    await this.memberRepository.update(member.id, data);

    if (onboardingCompleted !== undefined) {
      await this.setOnboardingCompleted(member.id, onboardingCompleted);
    }
  }

  private async setOnboardingCompleted(memberId: string, completed: boolean): Promise<void> {
    await this.memberRepository.setStatus(
      memberId,
      completed ? MemberStatus.active : MemberStatus.onboarding,
    );

    if (completed) {
      this.eventPublisher.publish(new OnboardingCompleted(memberId));
    }
  }
}
