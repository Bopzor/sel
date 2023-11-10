import { AuthenticationGateway } from './authentication/authentication.gateway';
import { MembersGateway } from './members/members.gateway';

export type Dependencies = {
  authenticationGateway: AuthenticationGateway;
  membersGateway: MembersGateway;
};
