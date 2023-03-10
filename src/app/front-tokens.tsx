import { Container, token } from 'brandi';
import { ContainerProvider as BrandiContainerProvider } from 'brandi-react';

import { Member } from '../modules/members';
import { Request } from '../modules/requests';

class MembersService {
  async listMembers(search?: string): Promise<Member[]> {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    const response = await fetch(`/api/members?${searchParams}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const members = await response.json();

    return members;
  }

  async getMember(memberId: string): Promise<Member> {
    const response = await fetch(`/api/members/${memberId}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const member = await response.json();

    return member;
  }
}

class RequestsService {
  async listRequests(search?: string): Promise<Request[]> {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    const response = await fetch(`/api/requests?${searchParams}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const requests = await response.json();

    return requests;
  }

  async getRequest(requestId: string): Promise<Request> {
    const response = await fetch(`/api/requests/${requestId}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const request = await response.json();

    return request;
  }
}

export const FRONT_TOKENS = {
  membersService: token<MembersService>('membersService'),
  requestsService: token<RequestsService>('requestsService'),
};

const container = new Container();

container.bind(FRONT_TOKENS.membersService).toInstance(MembersService).inSingletonScope();
container.bind(FRONT_TOKENS.requestsService).toInstance(RequestsService).inSingletonScope();

type ContainerProviderProps = {
  children: React.ReactNode;
};

export const ContainerProvider = ({ children }: ContainerProviderProps) => (
  <BrandiContainerProvider container={container}>{children}</BrandiContainerProvider>
);
