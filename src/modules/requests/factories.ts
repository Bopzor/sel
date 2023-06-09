import { createId } from '../../common/create-id';
import { EntityFactory } from '../../common/factory';
import { Timestamp } from '../../common/timestamp.value-object';

import { Request } from './entities/request.entity';

type Factories = {
  request: EntityFactory<Request>;
};

export const create: Factories = {
  request(overrides = {}) {
    return new Request({
      id: createId(),
      requesterId: '',
      title: '',
      description: '',
      creationDate: new Timestamp(0),
      lastEditionDate: new Timestamp(0),
      ...overrides,
    });
  },
};
