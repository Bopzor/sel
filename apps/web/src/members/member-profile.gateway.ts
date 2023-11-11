import { UpdateMemberProfileData } from '@sel/shared';

export interface MemberProfileGateway {
  updateMemberProfile(memberId: string, data: UpdateMemberProfileData): Promise<void>;
}
