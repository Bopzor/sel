import { Plural, Trans } from '@lingui/react/macro';
import type { Information } from '@sel/shared';
import { Avatar, Button, Card, EmptyState, LinkButton, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { formatExcerpt, formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { FetchNextPageError, Pagination } from 'src/components/pagination';
import { RelativeDate } from 'src/components/relative-date';

import type { InformationFilters } from './information-filters';

type InformationListProps = {
  filters: InformationFilters;
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function InformationList({ filters, hasFilters, onClearFilters }: InformationListProps) {
  const { data: me } = useSuspenseQuery(queries.session());

  const query = useInfiniteQuery(
    queries.listInformation({
      search: filters.search || undefined,
      authorId: filters.mine ? me.id : undefined,
    }),
  );

  // With data, a failed refetch keeps the list on screen.
  if (query.error && !query.data) {
    return (
      <ApiFailed
        title={<Trans context="information list">Unable to load the information</Trans>}
        retrying={query.isFetching}
        retry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <InformationListSkeleton />;
  }

  const { items, total } = query.data;

  if (items.length === 0) {
    return hasFilters ? <NoMatchingInformation onClearFilters={onClearFilters} /> : <NoInformation />;
  }

  return (
    <div className="stack gap-4">
      <ul
        aria-busy={query.isPlaceholderData}
        className={clsx('stack gap-4 transition', query.isPlaceholderData && 'opacity-60')}
      >
        {items.map((information) => (
          <li key={information.id}>
            <InformationCard information={information} />
          </li>
        ))}
      </ul>

      <FetchNextPageError query={query} />

      <Pagination query={query}>
        {query.hasNextPage ? (
          <Trans>
            Showing {items.length} of {total} pieces of information
          </Trans>
        ) : (
          <Plural value={total} one="# piece of information" other="# pieces of information" />
        )}
      </Pagination>
    </div>
  );
}

function InformationCard({ information }: { information: Information }) {
  const { data: config } = useSuspenseQuery(queries.config());

  return (
    <Card.Root>
      <Card.Body className="row items-start gap-2 p-3! md:gap-3 md:p-4!">
        {information.author ? (
          <MemberAvatar member={information.author} decorative />
        ) : (
          <Avatar src={config.logoUrl} name={config.letsName} decorative />
        )}

        <div className="stack min-w-0 flex-1 gap-1">
          <Card.Title level={2} className="line-clamp-2 text-body-strong!">
            <Card.Link Link={Link} href={routes.informationDetails(information.id)}>
              {information.title}
            </Card.Link>
          </Card.Title>

          <p className="line-clamp-2 text-body-sm text-muted">{formatExcerpt(information.message.body)}</p>

          <p className="mt-1 text-caption text-subtle">
            {information.author && (
              <>
                <span className="font-semibold">{formatMemberName(information.author)}</span>
                <Bullet />
              </>
            )}

            <RelativeDate date={information.publishedAt} className="relative whitespace-nowrap" />
          </p>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

function InformationListSkeleton() {
  return (
    <ul aria-busy className="stack gap-4">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index}>
          <Card.Root>
            <Card.Body className="row items-start gap-3">
              <Skeleton variant="circle" />
              <div className="stack min-w-0 flex-1 gap-2 py-0.5">
                <Skeleton className="w-2/3" />
                <Skeleton className="w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Card.Body>
          </Card.Root>
        </li>
      ))}
    </ul>
  );
}

function NoInformation() {
  return (
    <EmptyState.Root icon="information">
      <EmptyState.Title>
        <Trans>No information</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>When a member shares news with the others, it appears here.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.createInformation()} icon="add">
          <Trans>Publish information</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function NoMatchingInformation({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState.Root icon="search">
      <EmptyState.Title>
        <Trans>No information matches these filters</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Try other words, or clear the filters.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <Button variant="secondary" onClick={onClearFilters}>
          <Trans>Clear filters</Trans>
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
