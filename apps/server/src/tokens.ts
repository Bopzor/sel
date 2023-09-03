import { token } from 'ditox';

import { MembersController } from './members/controller.js';

export const TOKENS = {
  membersController: token<MembersController>('membersController'),
};
