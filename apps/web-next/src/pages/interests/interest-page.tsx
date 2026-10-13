import { Plural, Trans } from '@lingui/react/macro';
import type { Interest } from '@sel/shared';
import { Card, EmptyState, LinkButton, ListItem, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { fileUrl } from 'src/app/api';
import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton, Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';

import { ParticipationCard } from './membership';

export function InterestPage() {
  const interestId = defined(useParams().interestId);
  const query = useQuery(queries.listInterests());

  return (
    <div className="stack gap-4">
      <BackButton href={routes.interests()}>
        <Trans>Interests</Trans>
      </BackButton>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the interest</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<InterestSkeleton />}
      >
        {(interests) => {
          const interest = interests.find(({ id }) => id === interestId);

          return interest ? <InterestDetails interest={interest} /> : <InterestNotFound />;
        }}
      </QueryResult>
    </div>
  );
}

function InterestDetails({ interest }: { interest: Interest }) {
  return (
    <div className="stack gap-6">
      <header className="row flex-wrap items-center gap-3">
        <h1 className="text-title-1">{interest.label}</h1>
      </header>

      <div className="stack gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:grid-rows-[auto_auto_1fr] xl:items-start xl:gap-x-10">
        {interest.image && (
          <img
            src={fileUrl(interest.image)}
            alt=""
            className="aspect-2/1 w-full max-w-content rounded-lg object-cover xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-aside"
          />
        )}

        <p className="max-w-content whitespace-pre-line xl:col-start-1 xl:row-start-1">
          {interest.description}
        </p>

        <div className="max-w-content xl:col-start-1 xl:row-span-2 xl:row-start-2">
          <Members interest={interest} />
        </div>

        <div className="max-w-content xl:sticky xl:top-10 xl:col-start-2 xl:row-start-3 xl:w-aside">
          <ParticipationCard interest={interest} />
        </div>
      </div>
    </div>
  );
}

function Members({ interest }: { interest: Interest }) {
  const { members } = interest;

  return (
    <section className="stack gap-3">
      <h2 className="text-title-3">
        {members.length === 0 ? (
          <Trans>Members</Trans>
        ) : (
          <Plural value={members.length} one="# member" other="# members" />
        )}
      </h2>

      {members.length === 0 && (
        <p className="text-body-sm text-muted">
          <Trans>No one has chosen this interest yet.</Trans>
        </p>
      )}

      {members.length > 0 && (
        <Card.Root>
          <ul>
            {members.map((member) => (
              <ListItem.Root key={member.id} className="items-start">
                <MemberAvatar member={member} size="sm" decorative />

                <ListItem.Content>
                  <ListItem.Title className="text-body-sm font-medium">
                    <ListItem.Link Link={Link} href={routes.member(member.id)}>
                      {formatMemberName(member)}
                    </ListItem.Link>
                  </ListItem.Title>

                  {member.description && (
                    <ListItem.Description className="line-clamp-none whitespace-pre-line">
                      {member.description}
                    </ListItem.Description>
                  )}
                </ListItem.Content>
              </ListItem.Root>
            ))}
          </ul>
        </Card.Root>
      )}
    </section>
  );
}

function InterestSkeleton() {
  return (
    <div aria-busy className="stack gap-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="stack max-w-content gap-2">
        <Skeleton className="w-full" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  );
}

function InterestNotFound() {
  return (
    <EmptyState.Root icon="interests">
      <EmptyState.Title level={1}>
        <Trans>Interest not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the interest may no longer exist.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.interests()} variant="secondary">
          <Trans>See all interests</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
