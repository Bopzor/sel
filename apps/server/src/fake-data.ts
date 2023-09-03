import { assert } from '@sel/utils';

import { container } from './container';
import { createAddress } from './members/entities/address';
import { createMember } from './members/entities/member';
import { InMemoryMembersRepository } from './members/in-memory-members-repository';
import { TOKENS } from './tokens';

const repo = container.get(TOKENS.membersRepository);
assert(repo instanceof InMemoryMembersRepository);

const members = [
  createMember({
    firstName: 'Anna',
    lastName: 'Nasse',
    email: 'anna@nas.se',
    phoneNumber: '0628822806',
    address: createAddress({
      line1: '28 Chem. du Grand Grès',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.85484887560791, 5.025985312340134],
    }),
  }),
  createMember({
    firstName: 'Nils',
    lastName: 'Cox',
    email: 'nils@cox',
    phoneNumber: '0721436587',
    address: createAddress({
      line1: '62 Cours Gambetta',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.83737771901375, 5.040110010587979],
    }),
  }),
  createMember({
    firstName: 'Vio',
    lastName: 'Bopzor',
    email: 'vio@bopzor',
    phoneNumber: '0789674523',
    address: createAddress({
      line1: '73 Avenue Gabriel Peri',
      city: 'Cavaillon',
      postalCode: '84300',
      country: 'France',
      position: [43.83475320008764, 5.040883248476549],
    }),
  }),
];

for (const member of members) {
  repo.add(member);
}
