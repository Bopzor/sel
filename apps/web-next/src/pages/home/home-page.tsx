import { Trans } from '@lingui/react/macro';
import { Button } from '@sel/ui';
import { useState } from 'react';

import { TransactionDialog } from 'src/components/transaction-dialog';

export function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="stack items-start gap-6">
      <h1 className="text-title-1">
        <Trans>Home</Trans>
      </h1>

      <Button icon="exchange" onClick={() => setOpen(true)}>
        <Trans>Create exchange</Trans>
      </Button>

      <TransactionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
