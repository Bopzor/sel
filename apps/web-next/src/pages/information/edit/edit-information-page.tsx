import { Trans, useLingui } from '@lingui/react/macro';
import type { Information } from '@sel/shared';
import { Card, EmptyState, LinkButton, showToast, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton, Link } from 'src/components/link';

import { InformationForm } from '../information-form';
import { InformationNotFound } from '../information-not-found';

export function EditInformationPage() {
  const informationId = defined(useParams().informationId);
  const query = useQuery(queries.information(informationId));

  return (
    <div className="stack gap-4">
      <BackButton href={routes.informationDetails(informationId)}>
        <Trans>Back</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={<InformationNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the information</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<EditInformationSkeleton />}
      >
        {(information) => <EditInformation information={information} />}
      </QueryResult>
    </div>
  );
}

function EditInformation({ information }: { information: Information }) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(queries.session());

  if (information.author?.id !== me.id) {
    return <InformationNotEditable information={information} />;
  }

  const onSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['information-list'] }),
      queryClient.invalidateQueries(queries.information(information.id)),
    ]);

    await navigate(routes.informationDetails(information.id));
    showToast(t`Information edited`);
  };

  return (
    <>
      <header className="stack max-w-content gap-1">
        <h1 className="text-title-1">
          <Trans>Edit the information</Trans>
        </h1>
        <p className="text-muted">
          <Trans>The members will see the new version.</Trans>
        </p>
      </header>

      <Card.Root className="max-w-content">
        <InformationForm
          information={information}
          mutationFn={(body) => api('PUT', `/information/${information.id}`, { body })}
          onSuccess={onSuccess}
          submitLabel={<Trans>Save the changes</Trans>}
          errorTitle={<Trans>Your changes could not be saved</Trans>}
        />
      </Card.Root>
    </>
  );
}

function InformationNotEditable({ information }: { information: Information }) {
  return (
    <EmptyState.Root icon="information">
      <EmptyState.Title level={1}>
        <Trans>This information cannot be edited</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Only its author can edit this information.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.informationDetails(information.id)} variant="secondary">
          <Trans>See the information</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function EditInformationSkeleton() {
  return (
    <div aria-busy className="stack gap-4">
      <Skeleton className="h-8 w-1/2" />

      <Card.Root className="max-w-content">
        <Card.Body className="stack gap-6">
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
        </Card.Body>
      </Card.Root>
    </div>
  );
}
