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
          description={<Trans>Something doesn't work as expected</Trans>}
          href={routes.help('feedback')}
        />
        <FeedbackItem
          icon="idea"
          title={<Trans>Suggest an idea</Trans>}
          description={<Trans>An improvement, a clearer wording…</Trans>}
          href={routes.help('feedback')}
        />
        <FeedbackItem
          icon="help"
          title={<Trans>Get help</Trans>}
          description={<Trans>A question about the application</Trans>}
          href={routes.help('contact')}
        />
      </ul>
    </Card.Root>
  );
}

type FeedbackItemProps = {
  icon: IconName;
  title: React.ReactNode;
  description: React.ReactNode;
  href: string;
};

function FeedbackItem({ icon, title, description, href }: FeedbackItemProps) {
  return (
    <ListItem.Root>
      <Icon name={icon} className="text-muted" />

      <ListItem.Content>
        <ListItem.Title className="text-body-strong">
          <ListItem.Link Link={Link} href={href}>
            {title}
          </ListItem.Link>
        </ListItem.Title>
        <ListItem.Description>{description}</ListItem.Description>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
  );
}
