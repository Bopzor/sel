import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { MemberStatus } from './entities';
import { MembersRepository, UpdateMemberModel } from './members.repository';

export class MembersService {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {}

  async updateMemberProfile(memberId: string, data: shared.UpdateMemberProfileData): Promise<void> {
    const model: UpdateMemberModel = { ...data };

    if (data.onboardingCompleted !== undefined) {
      model.status = data.onboardingCompleted ? MemberStatus.active : MemberStatus.inactive;
      await this.membersRepository.setOnboardingCompleted(memberId, data.onboardingCompleted);
    }

    await this.membersRepository.update(memberId, model);
  }
}
