import { EntityFactory } from '../../common/factory';
import { Timestamp } from '../../common/timestamp.value-object';

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
      creationDate: new Timestamp(0),
      lastEditionDate: new Timestamp(0),
      ...overrides,
    });
  },
};
