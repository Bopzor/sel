import { Member } from '@sel/shared';

export interface AuthenticationGateway {
  requestAuthenticationLink(email: string): Promise<void>;
  verifyAuthenticationToken(token: string): Promise<Member>;
}
