import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { TransactionCanceled } from '../transaction.entities';

export async function notifyTransactionCanceled(event: TransactionCanceled): Promise<void> {
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

  await notify([transaction.recipient.id], 'TransactionCanceled', (member) => ({
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
  }));
}
