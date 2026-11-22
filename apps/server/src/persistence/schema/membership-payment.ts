import * as shared from '@sel/shared';
import { numeric, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, date, enumValues, id, primaryKey, updatedAt } from '../schema-utils';

import { members } from './members';

export const paymentMethod = pgEnum('payment_method', enumValues(shared.PaymentMethod));

export const membershipPayment = pgTable('membership_payment', {
  id: primaryKey(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  amount: numeric('amount', { mode: 'number' }).notNull(),
  paidAt: date('paid_at').notNull(),
  method: paymentMethod('payment_method').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  comment: text('comment'),
  createdAt,
  updatedAt,
});
