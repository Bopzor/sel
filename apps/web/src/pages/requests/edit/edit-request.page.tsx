import { createRequestBodySchema } from '@sel/shared';
import { useNavigate, useParams } from '@solidjs/router';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Query } from 'src/components/query';
import { BoxSkeleton } from 'src/components/skeleton';
import { createTranslate } from 'src/intl/translate';

import { RequestForm } from '../components/request-form';

const T = createTranslate('pages.requests.edit');

export function EditRequestPage() {
  const navigate = useNavigate();
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const params = useParams<{ requestId: string }>();
  const query = useQuery(() => apiQuery('getRequest', { path: { requestId: params.requestId } }));

  const editRequest = useMutation(() => ({
    async mutationFn(data: z.infer<typeof createRequestBodySchema>) {
      return api.updateRequest({ path: { requestId: params.requestId }, body: data });
    },
    async onSuccess() {
      await Promise.all([
        invalidate('getRequest', { path: { requestId: params.requestId } }),
        invalidate('listRequests'),
        invalidate('getFeed'),
      ]);

      notify.success(t('edited'));
      navigate(routes.requests.details(params.requestId));
    },
  }));

  return (
    <Query query={query} pending={<Skeleton />}>
      {(request) => (
        <>
          <h1>
            <T id="title" values={{ title: request().title }} />
          </h1>

          <RequestForm
            initialValue={request()}
            onSubmit={(data) => editRequest.mutateAsync(data)}
            submit={<T id="submit" />}
          />
        </>
      )}
    </Query>
  );
}

function Skeleton() {
  return (
    <div class="my-6 col max-w-4xl gap-4">
      <BoxSkeleton height={2} />
      <BoxSkeleton height={16} />
    </div>
  );
}
