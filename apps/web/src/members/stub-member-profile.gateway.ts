import { MemberProfileGateway } from './member-profile.gateway';

export class StubMemberProfileGateway implements MemberProfileGateway {
  async updateMemberProfile(): Promise<void> {}
}
