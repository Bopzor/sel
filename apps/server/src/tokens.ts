import { token } from 'ditox';

import { ConfigPort } from './infrastructure/config/config.port.js';
import { MembersController } from './members/controller.js';
import { MembersRepository } from './members/members-repository.js';

export const TOKENS = {
  config: token<ConfigPort>('config'),
  membersController: token<MembersController>('membersController'),
  membersRepository: token<MembersRepository>('membersRepository'),
};
