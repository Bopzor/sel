import { Plural, Trans, useLingui } from '@lingui/react/macro';
import type { Member } from '@sel/shared';
import { Card, Chip, EmptyState, LinkButton, ListItem, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import z from 'zod';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { DefinitionItem } from 'src/components/definition-item';
import { Link } from 'src/components/link';
import { FetchNextPageError, Pagination } from 'src/components/pagination';
import { useFilters } from 'src/hooks/use-filters';

import { ActivityItem } from './activity-item';

const filtersSchema = z.object({
  comments: z.stringbool().catch(false),
});

export function ActivityTab({ member }: { member: Member }) {
  return (
    <div className="stack gap-6 pt-6">
      <ActivityCounts member={member} />
      <Activity member={member} />
    </div>
  );
}

function ActivityCounts({ member }: { member: Member }) {
  const { t } = useLingui();
  const query = useQuery(queries.memberActivityCounts(member.id));

  return (
    <QueryResult
      query={query}
      failed={
        <ApiFailed
          title={<Trans>Unable to load the activity summary</Trans>}
          retrying={query.isFetching}
          retry={() => void query.refetch()}
        />
      }
      loading={<CountsSkeleton />}
    >
      {(counts) => (
        <Card.Root>
          <Card.Body compact>
            <dl className="grid grid-cols-2 gap-4 tabular-nums sm:grid-cols-3">
              <DefinitionItem label={t`Requests`} className="text-title-3">
                {counts.requests}
              </DefinitionItem>
              <DefinitionItem label={t`Offers to help`} className="text-title-3">
                {counts.requestAnswers}
              </DefinitionItem>
              <DefinitionItem label={t`Events organized`} className="text-title-3">
                {counts.events}
              </DefinitionItem>
              <DefinitionItem label={t`Events attended`} className="text-title-3">
                {counts.eventParticipations}
              </DefinitionItem>
              <DefinitionItem label={t`Information`} className="text-title-3">
                {counts.information}
              </DefinitionItem>
              <DefinitionItem label={t`Comments`} className="text-title-3">
                {counts.comments}
              </DefinitionItem>
            </dl>
          </Card.Body>
        </Card.Root>
      )}
    </QueryResult>
  );
}

function CountsSkeleton() {
  return (
    <Card.Root aria-busy>
      <Card.Body compact className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="stack gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="w-3/4" />
          </div>
        ))}
      </Card.Body>
    </Card.Root>
  );
}

function Activity({ member }: { member: Member }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const { filters, setFilters } = useFilters(filtersSchema);

  const query = useInfiniteQuery(
    queries.listMemberActivity(member.id, {
      includeComments: filters.comments ? 'true' : undefined,
    }),
  );

  return (
    <section className="stack gap-3">
      <div className="row flex-wrap items-center justify-between gap-3">
        <h2 className="text-title-3">
          <Trans>Timeline</Trans>
        </h2>

        <Chip selected={filters.comments} onChange={(comments) => setFilters({ comments })}>
          <Trans>Show comments</Trans>
        </Chip>
      </div>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the activity</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<ActivityListSkeleton count={3} />}
        empty={<NoActivity member={member} isMe={member.id === me.id} />}
      >
        {({ items, total }) => (
          <div className="stack gap-4">
            <Card.Root
              aria-busy={query.isPlaceholderData}
              className={clsx('transition', query.isPlaceholderData && 'opacity-60')}
            >
              <ul>
                {items.map((item) => (
                  <ActivityItem key={item.id} memberId={member.id} item={item} />
                ))}
              </ul>
            </Card.Root>

            <FetchNextPageError query={query} />

            <Pagination query={query}>
              {query.hasNextPage ? (
                <Trans>
                  Showing {items.length} of {total} activities
                </Trans>
              ) : (
                <Plural value={total} one="# activity" other="# activities" />
              )}
            </Pagination>
          </div>
        )}
      </QueryResult>
    </section>
  );
}

function NoActivity({ member, isMe }: { member: Member; isMe: boolean }) {
  const name = member.firstName;

  return (
    <EmptyState.Root icon="request">
      <EmptyState.Title level={3}>
        <Trans>No activity yet</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        {isMe ? (
          <Trans>Your requests, events and offers to help will appear here.</Trans>
        ) : (
          <Trans>{name}'s requests, events and offers to help will appear here.</Trans>
        )}
      </EmptyState.Description>
      {isMe && (
        <EmptyState.Action>
          <LinkButton Link={Link} href={routes.createRequest()} icon="add">
            <Trans>Post a request</Trans>
          </LinkButton>
        </EmptyState.Action>
      )}
    </EmptyState.Root>
  );
}

function ActivityListSkeleton({ count }: { count: number }) {
  return (
    <Card.Root>
      <ul aria-busy>
        {Array.from({ length: count }, (_, index) => (
          <ListItem.Root key={index} className="items-start">
            <Skeleton variant="circle" />
            <div className="stack min-w-0 flex-1 gap-2 py-0.5">
              <Skeleton className="w-2/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </ListItem.Root>
        ))}
      </ul>
    </Card.Root>
  );
}
