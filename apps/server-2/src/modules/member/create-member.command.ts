import { pick } from '@sel/utils';

import { db } from '../../persistence/database';
import { members } from '../../persistence/schema';

type CreateMemberCommand = {
  memberId: string;
  firstName: string;
  lastName: string;
};

export async function createMember(command: CreateMemberCommand): Promise<void> {
  await db.insert(members).values({
    id: command.memberId,
    ...pick(command, ['firstName', 'lastName']),
  });
}
