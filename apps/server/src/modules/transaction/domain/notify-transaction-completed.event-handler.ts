import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { currencyAmount, memberName } from 'src/infrastructure/format';
import { notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { TransactionCompletedEvent } from '../transaction.entities';

export async function notifyTransactionCompleted(event: TransactionCompletedEvent): Promise<void> {
  const transaction = defined(
    await db.query.transactions.findFirst({
      where: eq(schema.transactions.id, event.entityId),
      with: {
        payer: true,
        recipient: true,
      },
    }),
  );

  const config = defined(await db.query.config.findFirst());

  await notify({
    memberIds: [transaction.recipient.id],
    type: 'TransactionCompleted',
    getContext: (member) => ({
      member: {
        firstName: member.firstName,
      },
      transaction: {
        id: transaction.id,
        description: transaction.description,
        payer: {
          id: transaction.payer.id,
          name: memberName(transaction.payer),
        },
        creatorId: transaction.creatorId,
      },
      currency: config.currencyPlural,
      currencyAmount: currencyAmount(transaction.amount, config),
    }),
  });
}
