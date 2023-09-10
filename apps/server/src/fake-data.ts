import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { createAddress } from '@sel/shared';
import { assert } from '@sel/utils';

import { container } from './container';
import { createMember } from './members/entities/member';
import { InMemoryMembersRepository } from './members/in-memory-members-repository';
import { TOKENS } from './tokens';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const membersData = fs
  .readFileSync(path.resolve(__dirname, '..', '..', '..', 'data', 'members.json'))
  .toString();

const repo = container.get(TOKENS.membersRepository);
assert(repo instanceof InMemoryMembersRepository);

const members = JSON.parse(membersData).map((data: any) => ({
  ...createMember(data),
  address: createAddress(data.address),
}));

for (const member of members) {
  repo.add(member);
}
