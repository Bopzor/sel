import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { MembersRepository } from './members.repository';

export class MembersService {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {}

  async updateMemberProfile(memberId: string, data: shared.UpdateMemberProfileData): Promise<void> {
    await this.membersRepository.update(memberId, data);

    if (data.onboardingCompleted !== undefined) {
      await this.membersRepository.setOnboardingCompleted(memberId, data.onboardingCompleted);
    }
  }
}
