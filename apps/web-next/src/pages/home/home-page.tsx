import { Trans } from '@lingui/react/macro';
import { Button } from '@sel/ui';
import { useState } from 'react';

import { TransactionDialog } from 'src/components/transaction-dialog';

import { AttentionSection } from './attention-section';
import { PushNotificationsPrompt } from './push-notifications-prompt';

export function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="stack gap-6">
      <PushNotificationsPrompt />

      <h1 className="text-title-1">
        <Trans>Home</Trans>
      </h1>

      <Button icon="exchange" className="self-start" onClick={() => setOpen(true)}>
        <Trans>Create exchange</Trans>
      </Button>

      <AttentionSection />

      <TransactionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
