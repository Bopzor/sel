import { AuthenticationGateway } from './authentication/authentication.gateway';
import { MembersGateway } from './members/members.gateway';
import { RequestsGateway } from './requests/requests.gateway';

export type Dependencies = {
  authenticationGateway: AuthenticationGateway;
  requestsGateway: RequestsGateway;
  membersGateway: MembersGateway;
};
