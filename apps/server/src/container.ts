import { createContainer } from 'ditox';

import { MembersController } from './members/controller';
import { TOKENS } from './tokens';

export const container = createContainer();

container.bindFactory(TOKENS.membersController, MembersController.inject);
