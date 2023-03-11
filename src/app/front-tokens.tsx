import { Container, token } from 'brandi';
import { ContainerProvider as BrandiContainerProvider } from 'brandi-react';

import { MembersService } from '../modules/members/members.service';
import { RequestsService } from '../modules/requests/requests.service';

/* eslint-disable no-var */
declare global {
  var FRONT_TOKENS: ReturnType<typeof createTokens>;
  var container: Container;
}

const createTokens = () => ({
  membersService: token<MembersService>('membersService'),
  requestsService: token<RequestsService>('requestsService'),
});

export const FRONT_TOKENS = globalThis.FRONT_TOKENS ?? createTokens();
globalThis.FRONT_TOKENS ??= FRONT_TOKENS;

export const container = globalThis.container ?? new Container();
globalThis.container ??= container;

container.bind(FRONT_TOKENS.membersService).toInstance(MembersService).inSingletonScope();
container.bind(FRONT_TOKENS.requestsService).toInstance(RequestsService).inSingletonScope();

type ContainerProviderProps = {
  children: React.ReactNode;
};

export const ContainerProvider = ({ children }: ContainerProviderProps) => (
  <BrandiContainerProvider container={container}>{children}</BrandiContainerProvider>
);
