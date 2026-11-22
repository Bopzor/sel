import type { ValueOf } from '@sel/utils';
import z from 'zod';

export const PaymentMethod = {
  card: 'card',
  cash: 'cash',
  transfer: 'transfer',
  check: 'check',
} as const;

export type PaymentMethod = ValueOf<typeof PaymentMethod>;

export const createMembershipPaymentBodySchema = z.object({
  amount: z.number().positive().gte(0),
  paidAt: z.string().datetime(),
  method: z.nativeEnum(PaymentMethod),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  comment: z.string().optional(),
});
