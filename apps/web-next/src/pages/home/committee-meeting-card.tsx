import { Trans, useLingui } from '@lingui/react/macro';
import { Card } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery } from '@tanstack/react-query';

import { formatAddressLines } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { DateIcon } from 'src/components/date-icon';
import { Link } from 'src/components/link';

export function CommitteeMeetingCard({ className }: { className?: string }) {
  const { i18n } = useLingui();
  const { data: meeting } = useQuery(queries.nextCommitteeMeeting());

  if (!meeting) {
    return null;
  }

  const date = new Date(defined(meeting.date));

  return (
    <Card.Root className={className}>
      <Card.Header compact>
        <Card.Title level={2}>
          <Card.Link Link={Link} href={routes.event(meeting.id)}>
            <Trans>Next committee meeting</Trans>
          </Card.Link>
        </Card.Title>
      </Card.Header>

      <Card.Body compact className="row items-start gap-3">
        <DateIcon date={date} />

        <div className="stack min-w-0 gap-1 text-body-sm">
          <time dateTime={meeting.date} className="text-body-strong first-letter:uppercase">
            {date.toLocaleString(i18n.locale, { dateStyle: 'full', timeStyle: 'short' })}
          </time>

          {meeting.location && (
            <address className="whitespace-pre-line text-muted not-italic">
              {formatAddressLines(meeting.location).join('\n')}
            </address>
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
