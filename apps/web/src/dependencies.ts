import { MembersGateway } from './members/members.gateway';
import { RequestsGateway } from './requests/requests.gateway';

export type Dependencies = {
  requestsGateway: RequestsGateway;
  membersGateway: MembersGateway;
};
