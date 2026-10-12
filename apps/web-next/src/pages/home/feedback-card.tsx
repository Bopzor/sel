import { Trans } from '@lingui/react/macro';
import { Card, Icon, ListItem, type IconName } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function FeedbackCard({ className }: { className?: string }) {
  return (
    <Card.Root className={className}>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>A problem, an idea?</Trans>
        </Card.Title>
      </Card.Header>

      <ul className="border-t">
        <FeedbackItem
          icon="bug"
          title={<Trans>Report a bug</Trans>}
          description={<Trans>Something does not work as expected</Trans>}
        />
        <FeedbackItem
          icon="idea"
          title={<Trans>Suggest a change</Trans>}
          description={<Trans>A new feature, a clearer wording…</Trans>}
        />
        <FeedbackItem
          icon="help"
          title={<Trans>Get help</Trans>}
          description={<Trans>A question about the application</Trans>}
        />
      </ul>
    </Card.Root>
  );
}

type FeedbackItemProps = {
  icon: IconName;
  title: React.ReactNode;
  description: React.ReactNode;
};

function FeedbackItem({ icon, title, description }: FeedbackItemProps) {
  return (
    <ListItem.Root>
      <Icon name={icon} className="text-muted" />

      <ListItem.Content>
        <ListItem.Title className="text-body-strong">
          <ListItem.Link Link={Link} href={routes.feedback()}>
            {title}
          </ListItem.Link>
        </ListItem.Title>
        <ListItem.Description>{description}</ListItem.Description>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
  );
}
