import { Plural, Trans } from '@lingui/react/macro';
import { RequestStatus, type RequestListItem } from '@sel/shared';
import { Card, Icon, ListItem } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Bullet } from 'src/components/bullet';
import { Link } from 'src/components/link';
import { RelativeDate } from 'src/components/relative-date';

const maxItems = 2;

export function OpenRequestsCard({ className }: { className?: string }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const { data } = useInfiniteQuery(
    queries.listRequests({ requesterId: me.id, status: RequestStatus.pending }),
  );

  if (!data?.total) {
    return null;
  }

  return (
    <Card.Root className={className}>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>Your open requests</Trans>
        </Card.Title>
      </Card.Header>

      <ul className="border-t last-of-type:border-b">
        {data.items.slice(0, maxItems).map((request) => (
          <OpenRequestItem key={request.id} request={request} />
        ))}
      </ul>

      {data.total > maxItems && (
        <Card.Footer compact>
          <Link
            href={routes.requests({ mine: true })}
            className="row items-center gap-2 text-body-sm font-medium text-muted underline"
          >
            <Plural value={data.total} other="See the # open requests" />
            <Icon name="next" size="sm" />
          </Link>
        </Card.Footer>
      )}
    </Card.Root>
  );
}

function OpenRequestItem({ request }: { request: RequestListItem }) {
  const { positiveAnswersCount } = request;

  return (
    <ListItem.Root>
      <Icon name="request" className="text-muted" />

      <ListItem.Content>
        <ListItem.Title className="text-body-strong">
          <ListItem.Link Link={Link} href={routes.request(request.id)}>
            {request.title}
          </ListItem.Link>
        </ListItem.Title>

        <ListItem.Description>
          <RelativeDate date={request.date} className="whitespace-nowrap" />
          <Bullet />
          {positiveAnswersCount > 0 ? (
            <Plural value={positiveAnswersCount} one="# member can help" other="# members can help" />
          ) : (
            <Trans>No answers yet</Trans>
          )}
        </ListItem.Description>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
  );
}
