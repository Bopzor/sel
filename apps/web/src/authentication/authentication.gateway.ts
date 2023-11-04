import { Member } from '@sel/shared';

export interface AuthenticationGateway {
  getAuthenticatedMember(): Promise<Member | undefined>;
  requestAuthenticationLink(email: string): Promise<void>;
  verifyAuthenticationToken(token: string): Promise<void>;
}
