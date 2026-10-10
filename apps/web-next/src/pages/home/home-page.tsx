import { Trans } from '@lingui/react/macro';
import { Button } from '@sel/ui';
import { useState } from 'react';

import { TransactionDialog } from 'src/components/transaction-dialog';

import { PendingTransactionsAlert } from './pending-transactions-alert';
import { PushNotificationsPrompt } from './push-notifications-prompt';

export function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="stack gap-6">
      <PushNotificationsPrompt />
      <PendingTransactionsAlert />

      <h1 className="text-title-1">
        <Trans>Home</Trans>
      </h1>

      <Button icon="exchange" className="self-start" onClick={() => setOpen(true)}>
        <Trans>Create exchange</Trans>
      </Button>

      <TransactionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
