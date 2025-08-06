import { createRequestBodySchema } from '@sel/shared';
import { useNavigate } from '@solidjs/router';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { createTranslate } from 'src/intl/translate';

import { RequestForm } from '../components/request-form';

const T = createTranslate('pages.requests.create');

export function CreateRequestPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const createRequest = useMutation(() => ({
    async mutationFn(data: z.infer<typeof createRequestBodySchema>) {
      return api.createRequest({ body: data });
    },
    async onSuccess(requestId) {
      await Promise.all([
        queryClient.prefetchQuery(apiQuery('getRequest', { path: { requestId } })),
        invalidate('listRequests'),
        invalidate('getFeed'),
      ]);
      notify.success(t('created'));
      navigate(routes.requests.details(requestId));
    },
  }));

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <RequestForm onSubmit={(data) => createRequest.mutateAsync(data)} submit={<T id="submit" />} />
    </>
  );
}
