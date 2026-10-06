import { Trans } from '@lingui/react/macro';
import type { Member, MembersSort } from '@sel/shared';
import { Badge, Button, Card, EmptyState, Icon, Skeleton } from '@sel/ui';
import { differenceInCalendarDays, removeDiacriticCharacters } from '@sel/utils';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { fileUrl } from 'src/app/api';
import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
import { Link } from 'src/components/link';

type MembersListProps = {
  sort: MembersSort;
  search: string;
  onClearSearch: () => void;
};

export function MembersList({ sort, search, onClearSearch }: MembersListProps) {
  const query = useQuery(queries.listMembers({ sort }));

  // With data, a failed refetch keeps the list on screen.
  if (query.error && !query.data) {
    return (
      <ApiFailed
        title={<Trans>Unable to load the members</Trans>}
        retrying={query.isFetching}
        retry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <MembersListSkeleton />;
  }

  if (query.data.length === 0) {
    return <NoMembers />;
  }

  const normalizedSearch = normalize(search.trim());
  const members = query.data.filter((member) => matchesSearch(member, normalizedSearch));

  if (members.length === 0) {
    return <NoMatchingMembers onClearSearch={onClearSearch} />;
  }

  return (
    <ul
      aria-busy={query.isPlaceholderData}
      className={clsx(
        'grid grid-cols-2 gap-4 transition md:grid-cols-3 xl:grid-cols-4',
        query.isPlaceholderData && 'opacity-60',
      )}
    >
      {members.map((member) => (
        <li key={member.id}>
          <MemberCard member={member} />
        </li>
      ))}
    </ul>
  );
}

function normalize(str: string) {
  return removeDiacriticCharacters(str).toLowerCase();
}

function matchesSearch(member: Member, search: string) {
  return [
    normalize(formatMemberName(member)).includes(search),
    normalize(member.email ?? '').includes(search),
    member.phoneNumber?.includes(search),
    member.id === search,
  ].some(Boolean);
}

function MemberCard({ member }: { member: Member }) {
  return (
    <Card.Root className="h-full">
      <Card.Body className="stack flex-1 items-center gap-3 text-center">
        <MemberImage member={member} />

        <Card.Title level={2} className="mt-2">
          <Card.Link Link={Link} href={routes.member(member.id)}>
            {formatMemberName(member)}
          </Card.Link>
        </Card.Title>

        {member.bio && <p className="line-clamp-3 text-body-sm text-muted">{member.bio}</p>}
      </Card.Body>
    </Card.Root>
  );
}

function MemberImage({ member }: { member: Member }) {
  const badge = () => {
    if (differenceInCalendarDays(new Date(), member.membershipStartDate) < 60) {
      return (
        <Badge tone="primary" className="absolute -top-3 -right-3 max-sm:hidden">
          <Trans context="member">New</Trans>
        </Badge>
      );
    }
  };

  return (
    <div className="relative w-full">
      {member.avatar && (
        <img
          src={fileUrl(member.avatar)}
          alt=""
          className="aspect-square w-full rounded-lg border object-cover shadow-sm"
        />
      )}

      {!member.avatar && (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-page">
          <Icon name="profile" className="size-1/3! text-subtle opacity-40" />
        </div>
      )}

      {badge()}
    </div>
  );
}

function MembersListSkeleton() {
  return (
    <ul aria-busy className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <li key={index}>
          <Card.Root>
            <Card.Body className="stack items-center gap-3">
              <Skeleton variant="rect" className="aspect-square w-full rounded-lg shadow-sm" />
              <Skeleton className="my-3 w-2/3" />
              <Skeleton className="w-full" />
              <Skeleton className="w-full" />
            </Card.Body>
          </Card.Root>
        </li>
      ))}
    </ul>
  );
}

function NoMembers() {
  return (
    <EmptyState.Root icon="members">
      <EmptyState.Title>
        <Trans>No members</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The members of the association appear here once their account is active.</Trans>
      </EmptyState.Description>
    </EmptyState.Root>
  );
}

function NoMatchingMembers({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <EmptyState.Root icon="search">
      <EmptyState.Title>
        <Trans>No member matches this search</Trans>
      </EmptyState.Title>
      <EmptyState.Action>
        <Button variant="secondary" onClick={onClearSearch}>
          <Trans>Clear the search</Trans>
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
