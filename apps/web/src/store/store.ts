import { ApiAuthenticationGateway } from '../authentication/api-authentication.gateway';
import { Fetcher } from '../fetcher';
import { ApiMembersGateway } from '../members/api-members.gateway';
import { ApiRequestsGateway } from '../requests/api-requests.gateway';

import { createStore } from './create-store';

const fetcher = new Fetcher();

export const store = createStore({
  authenticationGateway: new ApiAuthenticationGateway(fetcher),
  membersGateway: new ApiMembersGateway(fetcher),
  requestsGateway: new ApiRequestsGateway(fetcher),
});
