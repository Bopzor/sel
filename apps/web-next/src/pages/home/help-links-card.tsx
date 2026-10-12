import { Trans } from '@lingui/react/macro';
import { Card } from '@sel/ui';

export function HelpLinksCard({ className }: { className?: string }) {
  return (
    <Card.Root className={className}>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>Help</Trans>
        </Card.Title>
      </Card.Header>

      <Card.Body compact className="text-body-sm text-muted">
        WIP
      </Card.Body>
    </Card.Root>
  );
}
