import * as shared from '@sel/shared';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { resetDatabase } from 'src/persistence';
import { clearDatabase, db } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { MembershipPayment, MembershipPaymentCreated } from '../member.entities';

import { createMembershipPayment } from './create-membership-payment.command';

describe('interest', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  let events: StubEvents;

  beforeEach(async () => {
    events = new StubEvents();
    container.bindValue(TOKENS.events, events);

    await persist.member({ id: 'memberId' });
    await persist.file({ id: 'imageId', uploadedBy: 'memberId' });
  });

  it('creates a membership payment', async () => {
    await createMembershipPayment({
      paymentId: 'paymentId',
      memberId: 'memberId',
      amount: 42,
      paidAt: '2026-01-05T00:00:00.000Z',
      method: shared.PaymentMethod.cash,
      periodStart: '2026-01-01T00:00:00.000Z',
      periodEnd: '2026-12-31T23:59:59.999Z',
    });

    const payment = await db.query.membershipPayment.findFirst();

    expect(payment).toEqual<MembershipPayment>({
      id: 'paymentId',
      memberId: 'memberId',
      amount: 42,
      paidAt: new Date('2026-01-05T00:00:00.000Z'),
      method: shared.PaymentMethod.cash,
      periodStart: new Date('2026-01-01T00:00:00.000Z'),
      periodEnd: new Date('2026-12-31T23:59:59.999Z'),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      comment: null,
    });

    expect(events.events).toContainEqual(new MembershipPaymentCreated('paymentId'));
  });
});
