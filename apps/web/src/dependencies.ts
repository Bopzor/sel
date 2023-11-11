import { AuthenticationGateway } from './authentication/authentication.gateway';
import { MemberProfileGateway } from './members/member-profile.gateway';
import { MembersGateway } from './members/members.gateway';

export type Dependencies = {
  authenticationGateway: AuthenticationGateway;
  membersGateway: MembersGateway;
  memberProfileGateway: MemberProfileGateway;
};
