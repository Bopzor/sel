import { Container, token } from 'brandi';

import { AuthenticationService } from '../modules/authentication/authentication.service';
import { MembersService } from '../modules/members/members.service';
import { RequestsService } from '../modules/requests/requests.service';

import { HttpClient } from './http-client';

/* eslint-disable no-var */
declare global {
  var __FRONT_TOKENS: ReturnType<typeof createTokens>;
  var __container: Container;
}

const createTokens = () => ({
  httpClient: token<HttpClient>('httpClient'),
  authenticationService: token<AuthenticationService>('authenticationService'),
  membersService: token<MembersService>('membersService'),
  requestsService: token<RequestsService>('requestsService'),
});

export const FRONT_TOKENS = globalThis.__FRONT_TOKENS ?? createTokens();
globalThis.__FRONT_TOKENS ??= FRONT_TOKENS;
