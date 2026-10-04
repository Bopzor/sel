import { Trans, useLingui } from '@lingui/react/macro';
import { RequestStatus, updateRequestBodySchema, type Request } from '@sel/shared';
import { Card, EmptyState, LinkButton, showToast, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton, Link } from 'src/components/link';

import { RequestForm } from '../request-form';
import { RequestNotFound } from '../request-not-found';

export function EditRequestPage() {
  const requestId = defined(useParams().requestId);
  const query = useQuery(queries.request(requestId));

  return (
    <div className="stack gap-4">
      <BackButton href={routes.request(requestId)}>
        <Trans>Back</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={<RequestNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the request</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<EditRequestSkeleton />}
      >
        {(request) => <EditRequest request={request} />}
      </QueryResult>
    </div>
  );
}

function EditRequest({ request }: { request: Request }) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(queries.session());

  if (request.requester.id !== me.id || request.status !== RequestStatus.pending) {
    return <RequestNotEditable request={request} />;
  }

  const onSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['requests'] }),
      queryClient.invalidateQueries(queries.request(request.id)),
    ]);

    await navigate(routes.request(request.id));
    showToast(t`Request edited`);
  };

  return (
    <>
      <header className="stack max-w-content gap-1">
        <h1 className="text-title-1">
          <Trans>Edit the request</Trans>
        </h1>
        <p className="text-muted">
          <Trans>The members who offered help or commented will see the new version.</Trans>
        </p>
      </header>

      <Card.Root className="max-w-content">
        <RequestForm
          schema={updateRequestBodySchema}
          defaultValues={{
            title: request.title,
            body: request.message.body,
            fileIds: request.message.attachments.map(({ fileId }) => fileId),
          }}
          mutationFn={(body) => api('PUT', `/requests/${request.id}`, { body })}
          onSuccess={onSuccess}
          submitLabel={<Trans>Save the changes</Trans>}
          errorTitle={<Trans>Your changes could not be saved</Trans>}
        />
      </Card.Root>
    </>
  );
}

function RequestNotEditable({ request }: { request: Request }) {
  return (
    <EmptyState.Root icon="request">
      <EmptyState.Title level={1}>
        <Trans>This request cannot be edited</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Only its author can edit a request, as long as it is open.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.request(request.id)} variant="secondary">
          <Trans>See the request</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function EditRequestSkeleton() {
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
