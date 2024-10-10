import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { MemberAvatarPort } from './member-avatar.port';

export class ApiMemberAvatarAdapter implements MemberAvatarPort {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: ConfigPort) {}

  private params = new URLSearchParams({
    default: 'mp',
    size: '80',
  });

  getAvatarUrl(member: { id: string }): string {
    return `${this.config.api.url}/members/${member.id}/avatar?${this.params}`;
  }
}
