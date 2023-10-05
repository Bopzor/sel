import { Container, token } from 'ditox';

import { ConfigPort } from './infrastructure/config/config.port.js';
import { MembersRepository } from './members/members-repository.js';
import { MembersController } from './members/members.controller.js';
import { RequestsController } from './requests/requests.controller.js';
import { RequestsRepository } from './requests/requests.repository.js';
import { Server } from './server.js';

export const TOKENS = {
  container: token<Container>('container'),
  config: token<ConfigPort>('config'),
  server: token<Server>('server'),
  membersController: token<MembersController>('membersController'),
  membersRepository: token<MembersRepository>('membersRepository'),
  requestsController: token<RequestsController>('requestsController'),
  requestsRepository: token<RequestsRepository>('requestsRepository'),
};
