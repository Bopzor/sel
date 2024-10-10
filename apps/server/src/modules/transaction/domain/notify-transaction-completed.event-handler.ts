import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { currencyAmount, memberName } from 'src/infrastructure/format';
import { notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { TransactionCompleted } from '../transaction.entities';

export async function notifyTransactionCompleted(event: TransactionCompleted): Promise<void> {
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

  await notify([transaction.recipient.id], 'TransactionCompleted', (member) => ({
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
    },
    currency: config.currencyPlural,
    currencyAmount: currencyAmount(transaction.amount, config),
  }));
}
