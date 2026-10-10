import { Trans, useLingui } from '@lingui/react/macro';
import type { Member } from '@sel/shared';
import { Card, Skeleton, Tabs } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link as RouterLink, useParams } from 'react-router';

import { ApiError } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton } from 'src/components/link';

import { ActivityTab } from './activity-tab';
import { ExchangesTab } from './exchanges-tab';
import { FormerMember } from './former-member';
import { MemberNotFound } from './member-not-found';
import { MemberSidebar } from './member-sidebar';

type MemberTab = 'overview' | 'exchanges' | 'activity';

const tabs: Record<string, MemberTab | undefined> = {
  exchanges: 'exchanges',
  activity: 'activity',
};

export function MemberPage() {
  const params = useParams();
  const memberId = defined(params.memberId);
  const tab = params.tab === undefined ? 'overview' : tabs[params.tab];
  const query = useQuery(queries.member(memberId));

  if (tab === undefined) {
    return <Navigate replace to={routes.member(memberId)} />;
  }

  return (
    <div className="stack gap-4">
      <BackButton href={routes.members()}>
        <Trans>Members</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={isFormerMember(query.error) ? <FormerMember /> : <MemberNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the member</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<MemberSkeleton />}
      >
        {(member) => <MemberDetails member={member} tab={tab} />}
      </QueryResult>
    </div>
  );
}

function MemberDetails({ member, tab }: { member: Member; tab: MemberTab }) {
  return (
    <div className="stack gap-6 xl:grid xl:grid-cols-[auto_minmax(0,1fr)] xl:items-start xl:gap-x-10">
      <aside className="stack max-w-content gap-6 xl:sticky xl:top-10 xl:w-aside">
        <MemberSidebar member={member} />
      </aside>

      <MemberTabs member={member} tab={tab} />
    </div>
  );
}

function MemberTabs({ member, tab }: { member: Member; tab: MemberTab }) {
  const { t } = useLingui();

  return (
    <Tabs.Root value={tab} className="min-w-0">
      <Tabs.List aria-label={t`Member sections`}>
        <Tabs.Tab value="overview" Link={TabLink} href={routes.member(member.id)}>
          <Trans>Overview</Trans>
        </Tabs.Tab>
        <Tabs.Tab value="exchanges" Link={TabLink} href={routes.member(member.id, 'exchanges')}>
          <Trans>Exchanges</Trans>
        </Tabs.Tab>
        <Tabs.Tab value="activity" Link={TabLink} href={routes.member(member.id, 'activity')}>
          <Trans>Activity</Trans>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview" />
      <Tabs.Panel value="exchanges">
        {/* force re-render if the member changes */}
        <ExchangesTab key={member.id} member={member} />
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <ActivityTab key={member.id} member={member} />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

function isFormerMember(error: Error | null) {
  return ApiError.is(error, 404) && error.code === 'MemberInactive';
}

// Switching tabs keeps the scroll position: the sidebar and the tab list stay where they are.
function TabLink({ href, ...props }: React.ComponentProps<'a'>) {
  return <RouterLink to={defined(href)} preventScrollReset {...props} />;
}

function MemberSkeleton() {
  return (
    <div
      aria-busy
      className="stack gap-6 xl:grid xl:grid-cols-[auto_minmax(0,1fr)] xl:items-start xl:gap-x-10"
    >
      <div className="stack max-w-content gap-6 xl:w-aside">
        <Card.Root>
          <Card.Body className="stack items-center gap-3">
            <Skeleton variant="rect" className="aspect-square w-full max-w-48 rounded-lg" />
            <Skeleton className="w-2/3" />
            <Skeleton className="w-1/2" />
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body className="stack gap-3">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-1/2" />
          </Card.Body>
        </Card.Root>
      </div>

      <Skeleton variant="rect" className="h-control-md w-full" />
    </div>
  );
}
