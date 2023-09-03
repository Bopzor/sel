import { token } from 'ditox';

import { MembersController } from './members/controller.js';
import { MembersRepository } from './members/members-repository.js';

export const TOKENS = {
  membersController: token<MembersController>('membersController'),
  membersRepository: token<MembersRepository>('membersRepository'),
};
