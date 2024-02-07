import { MemberAvatarPort } from './member-avatar.port';

export class StubMemberAvatarAdapter implements MemberAvatarPort {
  private params = new URLSearchParams({
    default: 'mp',
    size: '80',
  });

  getAvatarUrl(): string {
    return `https://gravatar.com/avatar?${this.params}`;
  }
}
