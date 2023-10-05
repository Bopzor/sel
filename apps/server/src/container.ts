import { createContainer } from 'ditox';

import { EnvConfigAdapter } from './infrastructure/config/env-config.adapter';
import { Database } from './infrastructure/persistence/database';
import { MembersController } from './members/members.controller';
import { SqlMembersRepository } from './members/sql-members-repository';
import { InMemoryRequestsRepository } from './requests/in-memory-requests.repository';
import { RequestsController } from './requests/requests.controller';
import { Server } from './server';
import { TOKENS } from './tokens';

export const container = createContainer();

container.bindValue(TOKENS.container, container);

container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.server, Server.inject);
container.bindFactory(TOKENS.database, Database.inject);

container.bindFactory(TOKENS.requestsRepository, InMemoryRequestsRepository.inject);
container.bindFactory(TOKENS.requestsController, RequestsController.inject);

container.bindFactory(TOKENS.membersRepository, SqlMembersRepository.inject);
container.bindFactory(TOKENS.membersController, MembersController.inject);
