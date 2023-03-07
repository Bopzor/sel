import { createId } from '../../common/create-id';
import { EntityFactory, ValueObjectFactory } from '../../common/factory';

import { Address } from './entities/address.value-object';
import { Member } from './entities/member.entity';

type Factories = {
  address: ValueObjectFactory<Address>;
  member: EntityFactory<Member>;
};

export const create: Factories = {
  address(overrides = {}) {
    return new Address({
      line1: '',
      postalCode: '',
      city: '',
      country: '',
      position: [0, 0],
      ...overrides,
    });
  },
  member(overrides = {}) {
    return new Member({
      id: createId(),
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: this.address(),
      ...overrides,
    });
  },
};
