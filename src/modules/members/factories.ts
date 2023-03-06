import { createId } from '../../common/create-id';
import { EntityFactory } from '../../common/factory';

import { Member } from './entities/member.entity';

type Factories = {
  member: EntityFactory<Member>;
};

export const create: Factories = {
  member(overrides = {}) {
    return new Member({
      id: createId(),
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      ...overrides,
    });
  },
};
