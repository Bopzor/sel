import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { createAddress } from '@sel/shared';
import { assert } from '@sel/utils';

import { container } from './container';
import { createMember } from './members/entities/member';
import { InMemoryMembersRepository } from './members/in-memory-members-repository';
import { createRequest } from './requests/entities/request';
import { InMemoryRequestsRepository } from './requests/in-memory-requests.repository';
import { TOKENS } from './tokens';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const membersData = fs
  .readFileSync(path.resolve(__dirname, '..', '..', '..', 'data', 'members.json'))
  .toString();

const membersRepository = container.get(TOKENS.membersRepository);
assert(membersRepository instanceof InMemoryMembersRepository);

const members = JSON.parse(membersData).map((data: any) => ({
  ...createMember(data),
  address: createAddress(data.address),
}));

for (const member of members) {
  membersRepository.add(member);
}

const requestsData = fs
  .readFileSync(path.resolve(__dirname, '..', '..', '..', 'data', 'requests.json'))
  .toString();

const requestsRepository = container.get(TOKENS.requestsRepository);
assert(requestsRepository instanceof InMemoryRequestsRepository);

const requests = JSON.parse(requestsData).map(createRequest);

for (const request of requests) {
  requestsRepository.add(request);
}
