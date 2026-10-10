import { Trans, useLingui } from '@lingui/react/macro';
import type { Member, MemberInterest } from '@sel/shared';
import { Badge, Button, Card, LinkButton, Skeleton } from '@sel/ui';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';

import { fileUrl } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Amount } from 'src/components/amount';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { DefinitionItem } from 'src/components/definition-item';
import { Link } from 'src/components/link';

import { ActivityItem } from './activity-item';
import { TransactionItem } from './exchanges-tab';

export function OverviewTab({ member }: { member: Member }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const isMe = member.id === me.id;

  return (
    <div className="@container stack gap-8 pt-6">
      <Bio member={member} isMe={isMe} />
      <div className="grid grid-cols-1 gap-4 @min-[42rem]:grid-cols-2">
        <ExchangesCard member={member} />
        <ActivityCard member={member} />
      </div>
      <Interests member={member} isMe={isMe} />
    </div>
  );
}

function Bio({ member, isMe }: { member: Member; isMe: boolean }) {
  return (
    <Section title={<Trans>About</Trans>}>
      {!member.bio && <NoBio member={member} isMe={isMe} />}

      {member.bio && (
        <Card.Root>
          <Card.Body compact className="whitespace-pre-line">
            {member.bio}
          </Card.Body>
        </Card.Root>
      )}
    </Section>
  );
}

function NoBio({ member, isMe }: { member: Member; isMe: boolean }) {
  const name = member.firstName;

  return (
    <p className="text-body-sm text-muted">
      {isMe ? (
        <Trans>
          You haven't written a bio yet. <PromptLink href={routes.profile()}>Write my bio</PromptLink>
        </Trans>
      ) : (
        <Trans>{name} hasn't written a bio yet.</Trans>
      )}
    </p>
  );
}

function ExchangesCard({ member }: { member: Member }) {
  const { t } = useLingui();
  const query = useQuery(queries.memberTransactionStats(member.id));
  const latestQuery = useQuery(queries.latestMemberTransactions(member.id));

  return (
    <Card.Root>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>Exchanges</Trans>
        </Card.Title>
      </Card.Header>

      <Card.Body compact>
        <QueryResult
          query={query}
          failed={
            <ApiFailed
              title={<Trans>Unable to load the exchanges summary</Trans>}
              retrying={query.isFetching}
              retry={() => void query.refetch()}
            />
          }
          loading={<DefinitionsSkeleton count={4} />}
        >
          {(stats) => (
            <dl className="grid grid-cols-2 gap-4">
              <DefinitionItem label={t`Balance`} className="text-body-strong">
                <Amount value={member.balance} />
              </DefinitionItem>
              <DefinitionItem label={t`Exchanges`} className="tabular-nums">
                {stats.count}
              </DefinitionItem>
              <DefinitionItem label={t`Given`}>
                <Amount value={stats.given} />
              </DefinitionItem>
              <DefinitionItem label={t`Received`}>
                <Amount value={stats.received} />
              </DefinitionItem>
            </dl>
          )}
        </QueryResult>
      </Card.Body>

      <QueryResult
        query={latestQuery}
        failed={
          <Card.Body compact>
            <ApiFailed
              title={<Trans>Unable to load the exchanges</Trans>}
              retrying={latestQuery.isFetching}
              retry={() => void latestQuery.refetch()}
            />
          </Card.Body>
        }
        loading={null}
        empty={
          <Card.Body compact className="text-body-sm text-muted">
            <Trans>No exchanges yet</Trans>
          </Card.Body>
        }
      >
        {({ items }) => (
          <ul className="border-t">
            {items.map((transaction) => (
              <TransactionItem key={transaction.id} member={member} transaction={transaction} />
            ))}
          </ul>
        )}
      </QueryResult>

      <Card.Footer compact className="mt-auto">
        <LinkButton Link={Link} href={routes.member(member.id, 'exchanges')} variant="secondary" size="sm">
          <Trans>See exchanges</Trans>
        </LinkButton>
      </Card.Footer>
    </Card.Root>
  );
}

function ActivityCard({ member }: { member: Member }) {
  const { t } = useLingui();
  const countsQuery = useQuery(queries.memberActivityCounts(member.id));
  const latestQuery = useQuery(queries.latestMemberActivity(member.id));

  return (
    <Card.Root>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>Activity</Trans>
        </Card.Title>
      </Card.Header>

      <Card.Body compact>
        <QueryResult
          query={countsQuery}
          failed={
            <ApiFailed
              title={<Trans>Unable to load the activity summary</Trans>}
              retrying={countsQuery.isFetching}
              retry={() => void countsQuery.refetch()}
            />
          }
          loading={<DefinitionsSkeleton count={4} />}
        >
          {(counts) => (
            <dl className="grid grid-cols-2 gap-4 tabular-nums">
              <DefinitionItem label={t`Requests`}>{counts.requests}</DefinitionItem>
              <DefinitionItem label={t`Offers to help`}>{counts.requestAnswers}</DefinitionItem>
              <DefinitionItem label={t`Events organized`}>{counts.events}</DefinitionItem>
              <DefinitionItem label={t`Events attended`}>{counts.eventParticipations}</DefinitionItem>
            </dl>
          )}
        </QueryResult>
      </Card.Body>

      <QueryResult
        query={latestQuery}
        failed={
          <Card.Body compact>
            <ApiFailed
              title={<Trans>Unable to load the activity</Trans>}
              retrying={latestQuery.isFetching}
              retry={() => void latestQuery.refetch()}
            />
          </Card.Body>
        }
        loading={null}
        empty={
          <Card.Body compact className="text-body-sm text-muted">
            <Trans>No activity yet.</Trans>
          </Card.Body>
        }
      >
        {({ items }) => (
          <ul className="border-t">
            {items.map((item) => (
              <ActivityItem key={item.id} memberId={member.id} item={item} />
            ))}
          </ul>
        )}
      </QueryResult>

      <Card.Footer compact className="mt-auto">
        <LinkButton Link={Link} href={routes.member(member.id, 'activity')} variant="secondary" size="sm">
          <Trans>See activity</Trans>
        </LinkButton>
      </Card.Footer>
    </Card.Root>
  );
}

function Interests({ member, isMe }: { member: Member; isMe: boolean }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const [expanded, setExpanded] = useState(false);

  const common = new Set(isMe ? [] : me.interests.map(({ interestId }) => interestId));
  const isCommon = (interest: MemberInterest) => common.has(interest.interestId);
  const interests = [...member.interests.filter(isCommon), ...member.interests.filter((i) => !isCommon(i))];

  const limit = 4;

  return (
    <Section title={<Trans>Interests</Trans>}>
      {interests.length === 0 && <NoInterests member={member} isMe={isMe} />}

      {interests.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 @[32rem]:grid-cols-2">
          {interests.slice(0, expanded ? undefined : limit).map((interest) => (
            <li key={interest.id}>
              <InterestCard interest={interest} common={isCommon(interest)} />
            </li>
          ))}
        </ul>
      )}

      {!expanded && interests.length > limit && (
        <Button variant="secondary" size="sm" onClick={() => setExpanded(true)} className="self-start">
          <Trans>See more</Trans>
        </Button>
      )}
    </Section>
  );
}

function NoInterests({ member, isMe }: { member: Member; isMe: boolean }) {
  const name = member.firstName;

  return (
    <p className="text-body-sm text-muted">
      {isMe ? (
        <Trans>
          You haven't shared any interest yet.{' '}
          <PromptLink href={routes.interests()}>Browse the interests</PromptLink>
        </Trans>
      ) : (
        <Trans>{name} hasn't shared any interest yet.</Trans>
      )}
    </p>
  );
}

function InterestCard({ interest, common }: { interest: MemberInterest; common: boolean }) {
  return (
    <Card.Root className="block h-full">
      {interest.image && (
        <img src={fileUrl(interest.image)} alt="" className="aspect-2/1 w-full object-cover" />
      )}

      <Card.Header compact className="mt-5 mb-3">
        <Card.Title className="text-body-strong">{interest.label}</Card.Title>
        {common && (
          <Card.Action>
            <Badge tone="primary">
              <Trans>In common</Trans>
            </Badge>
          </Card.Action>
        )}
      </Card.Header>

      {interest.description && (
        <Card.Body compact className="text-body-sm text-muted">
          <p className="line-clamp-3">{interest.description}</p>
        </Card.Body>
      )}
    </Card.Root>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="stack gap-3">
      <h2 id={titleId} className="text-title-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PromptLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-primary hover:underline">
      {children}
    </Link>
  );
}

function DefinitionsSkeleton({ count }: { count: number }) {
  return (
    <div aria-busy className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="stack gap-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="w-3/4" />
        </div>
      ))}
    </div>
  );
}
