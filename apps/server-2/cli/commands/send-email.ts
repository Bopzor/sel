import { assert } from '@sel/utils';
import { container } from 'src/infrastructure/container';
import { findMemberById } from 'src/modules/member/member.persistence';
import { TOKENS } from 'src/tokens';
import { CliCommand } from '../types';

export const sendEmail: CliCommand = async (args) => {
  const emailSender = container.resolve(TOKENS.emailSender);
  const [memberId, subject, body] = args;

  assert(memberId, 'Missing memberId');
  assert(subject, 'Missing subject');
  assert(body, 'Missing body');

  const member = await findMemberById(memberId);

  if (!member) {
    throw new Error(`Member with id ${memberId} not found`);
  }

  await emailSender.send({
    to: member.email,
    subject,
    text: body,
    html: body,
  });
};
