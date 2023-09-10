import { token } from 'ditox';

import { ConfigPort } from './infrastructure/config/config.port.js';
import { MembersRepository } from './members/members-repository.js';
import { MembersController } from './members/members.controller.js';
import { RequestsController } from './requests/requests.controller.js';
import { RequestsRepository } from './requests/requests.repository.js';

export const TOKENS = {
  config: token<ConfigPort>('config'),
  membersController: token<MembersController>('membersController'),
  membersRepository: token<MembersRepository>('membersRepository'),
  requestsController: token<RequestsController>('requestsController'),
  requestsRepository: token<RequestsRepository>('requestsRepository'),
};
