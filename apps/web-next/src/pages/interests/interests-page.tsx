import { Plural, Trans } from '@lingui/react/macro';
import type { Interest, InterestMember } from '@sel/shared';
import { Badge, Button, Card, Chip, EmptyState, Skeleton } from '@sel/ui';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';

import { fileUrl } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { useSession } from 'src/app/session';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { useFilters } from 'src/hooks/use-filters';

import { InterestedButton } from './membership';

const filtersSchema = z.object({
  mine: z.stringbool().catch(false),
});

export function InterestsPage() {
  const { filters, setFilters } = useFilters(filtersSchema);
  const query = useQuery(queries.listInterests());

  return (
    <div className="stack gap-6">
      <h1 className="text-title-1">
        <Trans>Interests</Trans>
      </h1>

      <div className="row flex-wrap gap-2">
        <Chip icon="profile" selected={filters.mine} onChange={(mine) => setFilters({ mine })}>
          <Trans>My interests</Trans>
        </Chip>
      </div>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load interests</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<InterestListSkeleton />}
        empty={<NoInterest />}
      >
        {(interests) => (
          <InterestList
            interests={interests}
            mine={filters.mine}
            onShowAll={() => setFilters({ mine: false })}
          />
        )}
      </QueryResult>
    </div>
  );
}

type InterestListProps = {
  interests: Interest[];
  mine: boolean;
  onShowAll: () => void;
};

function InterestList({ interests, mine, onShowAll }: InterestListProps) {
  const me = useSession();

  const joined = (interest: Interest) => interest.members.some(({ id }) => id === me.id);
  const shown = mine ? interests.filter(joined) : interests;

  if (shown.length === 0) {
    return <NoJoinedInterest onShowAll={onShowAll} />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-3">
      {shown.map((interest) => (
        <li key={interest.id}>
          <InterestCard interest={interest} joined={joined(interest)} />
        </li>
      ))}
    </ul>
  );
}

function InterestCard({ interest, joined }: { interest: Interest; joined: boolean }) {
  return (
    <Card.Root className="h-full">
      {interest.image && (
        <img src={fileUrl(interest.image)} alt="" className="aspect-2/1 w-full object-cover" />
      )}

      <Card.Header compact>
        <Card.Title level={2} className="text-body-strong">
          <Card.Link Link={Link} href={routes.interest(interest.id)}>
            {interest.label}
          </Card.Link>
        </Card.Title>

        {joined && (
          <Card.Action>
            <InterestedBadge />
          </Card.Action>
        )}
      </Card.Header>

      <Card.Body compact className="stack flex-1 gap-3">
        <p className="line-clamp-2 text-body-sm text-muted">{interest.description}</p>
        <MembersPreview members={interest.members} />
      </Card.Body>

      {!joined && (
        <Card.Footer compact>
          <InterestedButton interest={interest} />
        </Card.Footer>
      )}
    </Card.Root>
  );
}

function InterestedBadge() {
  return (
    <Badge tone="success" icon="check" className="px-1.5 *:last:sr-only">
      <Trans>In your interests</Trans>
    </Badge>
  );
}

function MembersPreview({ members }: { members: InterestMember[] }) {
  if (members.length === 0) {
    return (
      <p className="text-caption text-subtle">
        <Trans>No members yet</Trans>
      </p>
    );
  }

  return (
    <div className="row items-center gap-2">
      <div className="row">
        {members.slice(0, 4).map((member) => (
          <MemberAvatar
            key={member.id}
            member={member}
            size="sm"
            decorative
            className="-ml-3 shadow-sm first:ml-0"
          />
        ))}
      </div>

      <span className="text-caption whitespace-nowrap text-subtle">
        <Plural value={members.length} one="# member" other="# members" />
      </span>
    </div>
  );
}

function InterestListSkeleton() {
  return (
    <ul aria-busy className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index}>
          <Card.Root>
            <Skeleton variant="rect" className="aspect-2/1 w-full rounded-none" />
            <Card.Body compact className="stack gap-2">
              <Skeleton className="w-1/2" />
              <Skeleton className="w-full" />
              <Skeleton className="h-3 w-1/3" />
            </Card.Body>
          </Card.Root>
        </li>
      ))}
    </ul>
  );
}

function NoInterest() {
  return (
    <EmptyState.Root icon="interests">
      <EmptyState.Title>
        <Trans>No interests yet</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The interests set up by the LETS will appear here.</Trans>
      </EmptyState.Description>
    </EmptyState.Root>
  );
}

function NoJoinedInterest({ onShowAll }: { onShowAll: () => void }) {
  return (
    <EmptyState.Root icon="interests">
      <EmptyState.Title>
        <Trans>You haven't chosen any interest yet</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Choose your interests to meet the members who share them.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <Button variant="secondary" onClick={onShowAll}>
          <Trans>See all interests</Trans>
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
