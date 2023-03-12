import { Container } from 'brandi';
import { ContainerProvider as BrandiContainerProvider } from 'brandi-react';

import { AuthenticationService } from '../modules/authentication/authentication.service';
import { MembersService } from '../modules/members/members.service';
import { RequestsService } from '../modules/requests/requests.service';

import { FRONT_TOKENS } from './front-tokens';
import { FetchHttpClient } from './http-client';

export const container = globalThis.__container ?? new Container();
globalThis.__container ??= container;

container.bind(FRONT_TOKENS.httpClient).toInstance(FetchHttpClient).inSingletonScope();
container.bind(FRONT_TOKENS.authenticationService).toInstance(AuthenticationService).inSingletonScope();
container.bind(FRONT_TOKENS.membersService).toInstance(MembersService).inSingletonScope();
container.bind(FRONT_TOKENS.requestsService).toInstance(RequestsService).inSingletonScope();

type ContainerProviderProps = {
  children: React.ReactNode;
};

export const ContainerProvider = ({ children }: ContainerProviderProps) => (
  <BrandiContainerProvider container={container}>{children}</BrandiContainerProvider>
);
