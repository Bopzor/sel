import { assert } from '@sel/utils';
import { CliCommand } from '../types';
import { createMember } from 'src/modules/member/create-member.command';
import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

export const createMemberCommand: CliCommand = async (args) => {
  const [email, firstName, lastName] = args;
  const memberId = container.resolve(TOKENS.generator).id();

  assert(email, 'Missing email');

  await createMember({
    memberId,
    email,
    firstName,
    lastName,
  });
};
