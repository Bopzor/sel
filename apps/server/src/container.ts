import { createContainer } from 'ditox';

import { MembersController } from './members/controller';
import { InMemoryMembersRepository } from './members/in-memory-members-repository';
import { TOKENS } from './tokens';

export const container = createContainer();

container.bindFactory(TOKENS.membersRepository, InMemoryMembersRepository.inject);
container.bindFactory(TOKENS.membersController, MembersController.inject);
