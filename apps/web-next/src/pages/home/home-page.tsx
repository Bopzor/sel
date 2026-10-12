import { Trans } from '@lingui/react/macro';
import { Button, LinkButton } from '@sel/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Amount } from 'src/components/amount';
import { Link } from 'src/components/link';
import { TransactionDialog } from 'src/components/transaction-dialog';

import { CommitteeMeetingCard } from './committee-meeting-card';
import { Feed } from './feed';
import { FeedbackCard } from './feedback-card';
import { OpenRequestsCard } from './open-requests-card';
import { PendingTransactionsCard } from './pending-transactions-card';
import { ProfileCompletionCard } from './profile-completion-card';
import { PushNotificationsPrompt } from './push-notifications-prompt';
import { UpcomingEventsCard } from './upcoming-events-card';

export function HomePage() {
  return (
    <div className="stack gap-8">
      <PushNotificationsPrompt />

      <Header />

      <div className="stack gap-8 xl:flex-row-reverse xl:items-start xl:justify-between xl:gap-10">
        <SideInfo />
        <Feed className="max-w-content min-w-0 flex-1" />
      </div>
    </div>
  );
}

function Header() {
  const { data: me } = useSuspenseQuery(queries.session());
  const firstName = me.firstName;

  const [open, setOpen] = useState(false);

  const balance = (
    <Link href={routes.member(me.id, 'exchanges')} className="text-body-strong text-default hover:underline">
      <Amount value={me.balance} />
    </Link>
  );

  return (
    <header className="row flex-wrap items-start justify-between gap-4">
      <div className="stack gap-1">
        <h1 className="text-title-1">
          <Trans>Hello {firstName}</Trans>
        </h1>

        <p className="text-muted">
          <Trans>Your balance: {balance}</Trans>
        </p>
      </div>

      <div className="row flex-wrap gap-2 max-xs:w-full">
        <Button icon="exchange" onClick={() => setOpen(true)} className="max-xs:w-full">
          <Trans>Create exchange</Trans>
        </Button>

        <LinkButton
          Link={Link}
          href={routes.createRequest()}
          icon="add"
          variant="secondary"
          className="max-xs:hidden"
        >
          <Trans>New request</Trans>
        </LinkButton>
      </div>

      <TransactionDialog open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function SideInfo() {
  return (
    <div className="stack max-w-content gap-4 xl:w-aside xl:shrink-0">
      <PendingTransactionsCard />
      {/* todo */}
      <ProfileCompletionCard className="hidden" />
      <OpenRequestsCard className="max-xl:hidden" />
      <CommitteeMeetingCard className="max-xl:hidden" />
      <UpcomingEventsCard className="max-xl:hidden" />
      <FeedbackCard className="max-xl:hidden" />
    </div>
  );
}
