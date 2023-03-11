import { Container, token } from 'brandi';
import { ContainerProvider as BrandiContainerProvider } from 'brandi-react';

import { MembersService } from '../modules/members/members.service';
import { RequestsService } from '../modules/requests/requests.service';

export const FRONT_TOKENS = {
  membersService: token<MembersService>('membersService'),
  requestsService: token<RequestsService>('requestsService'),
};

export const frontContainer = () => {
  const container = new Container();

  container.bind(FRONT_TOKENS.membersService).toInstance(MembersService).inSingletonScope();
  container.bind(FRONT_TOKENS.requestsService).toInstance(RequestsService).inSingletonScope();

  return [container, FRONT_TOKENS] as const;
};

export const [container] = frontContainer();

type ContainerProviderProps = {
  children: React.ReactNode;
};

export const ContainerProvider = ({ children }: ContainerProviderProps) => (
  <BrandiContainerProvider container={container}>{children}</BrandiContainerProvider>
);
