import { Trans } from '@lingui/react/macro';
import { Skeleton } from '@sel/ui';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton } from 'src/components/link';

const MembersMap = lazy(() => import('./members-map').then((module) => ({ default: module.MembersMap })));

export function MembersMapPage() {
  const [searchParams] = useSearchParams();
  const query = useQuery(queries.listMembers());

  return (
    <div className="stack gap-4">
      <BackButton href={routes.members()}>
        <Trans>Members</Trans>
      </BackButton>

      <h1 className="text-title-1">
        <Trans>Members map</Trans>
      </h1>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the members</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<MapSkeleton />}
      >
        {(members) => (
          <Suspense fallback={<MapSkeleton />}>
            <MembersMap
              members={members}
              selectedMemberId={searchParams.get('memberId') ?? undefined}
              className="h-[70dvh] min-h-80 rounded-lg border"
            />
          </Suspense>
        )}
      </QueryResult>
    </div>
  );
}

function MapSkeleton() {
  return <Skeleton variant="rect" aria-busy className="h-[70dvh] min-h-80 w-full rounded-lg" />;
}
