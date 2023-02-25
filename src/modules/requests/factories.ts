import { EntityFactory } from '../../common/factory';

import { Request } from './entities/request.entity';

type Factories = {
  request: EntityFactory<Request>;
};

export const create: Factories = {
  request(overrides = {}) {
    return new Request({
      id: '',
      title: '',
      description: '',
      ...overrides,
    });
  },
};
