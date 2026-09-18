import * as shared from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { db } from 'src/persistence';
import { membershipPayment } from 'src/persistence/schema';
import { TOKENS } from 'src/tokens';

import { MembershipPaymentCreated } from '../member.entities';

type CreateMembershipPaymentCommand = {
  paymentId: string;
  memberId: string;
  amount: number;
  paidAt: string;
  method: shared.PaymentMethod;
  periodStart: string;
  periodEnd: string;
  comment?: string;
};

export async function createMembershipPayment(command: CreateMembershipPaymentCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  await db.insert(membershipPayment).values({
    id: command.paymentId,
    memberId: command.memberId,
    amount: command.amount,
    paidAt: new Date(command.paidAt),
    method: command.method,
    periodStart: new Date(command.periodStart),
    periodEnd: new Date(command.periodEnd),
    comment: command.comment,
  });

  events.publish(new MembershipPaymentCreated(command.paymentId));
}
