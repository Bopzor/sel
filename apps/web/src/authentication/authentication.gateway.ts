export interface AuthenticationGateway {
  requestAuthenticationLink(email: string): Promise<void>;
}
