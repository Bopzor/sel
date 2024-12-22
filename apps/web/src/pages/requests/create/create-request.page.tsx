import { createRequestBodySchema } from '@sel/shared';
import { useNavigate } from '@solidjs/router';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { createTranslate } from 'src/intl/translate';

import { RequestForm } from '../components/request-form';

const T = createTranslate('pages.requests.create');

export function CreateRequestPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const t = T.useTranslate();

  const createRequest = createMutation(() => ({
    async mutationFn(data: z.infer<typeof createRequestBodySchema>) {
      return api.createRequest({ body: data });
    },
    async onSuccess(requestId) {
      await queryClient.prefetchQuery(apiQuery('getRequest', { path: { requestId } }));
      notify.success(t('created'));
      navigate(routes.requests.details(requestId));
    },
  }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.requests(), breadcrumb.createRequest()]} />

      <h1>
        <T id="title" />
      </h1>

      <RequestForm onSubmit={(data) => createRequest.mutateAsync(data)} submit={<T id="submit" />} />
    </>
  );
}
