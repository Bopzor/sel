import { AuthenticatedMember } from '@sel/shared';

export interface AuthenticationGateway {
  getAuthenticatedMember(): Promise<AuthenticatedMember | undefined>;
  requestAuthenticationLink(email: string): Promise<void>;
  verifyAuthenticationToken(token: string): Promise<void>;
}
