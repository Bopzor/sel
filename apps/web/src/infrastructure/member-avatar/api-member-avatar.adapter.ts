import { injectableClass } from 'ditox';

import { MemberAvatarPort } from './member-avatar.port';

export class ApiMemberAvatarAdapter implements MemberAvatarPort {
  static inject = injectableClass(this);

  private params = new URLSearchParams({
    default: 'mp',
    size: '80',
  });

  getAvatarUrl(member: { id: string }): string {
    return `/api/members/${member.id}/avatar?${this.params}`;
  }
}
