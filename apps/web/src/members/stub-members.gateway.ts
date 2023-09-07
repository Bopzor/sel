import { Member } from '@sel/shared';
import { hasId } from '@sel/utils';

import { MembersGateway } from './members.gateway';

export class StubMembersGateway implements MembersGateway {
  members = new Array<Member>();

  async listMembers(): Promise<Member[]> {
    await new Promise((r) => setTimeout(r, 1000));
    return this.members;
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    return this.members.find(hasId(memberId));
  }
}
