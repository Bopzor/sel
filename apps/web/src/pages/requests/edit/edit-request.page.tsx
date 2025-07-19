import { createRequestBodySchema } from '@sel/shared';
import { defined } from '@sel/utils';
import { useNavigate, useParams } from '@solidjs/router';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
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
      const request = defined(query.data);
      return api.updateRequest({ path: { requestId: request.id }, body: data });
    },
    async onSuccess() {
      const request = defined(query.data);

      await invalidate('getRequest', { path: { requestId: request.id } });
      notify.success(t('edited'));
      navigate(routes.requests.details(request.id));
    },
  }));

  return (
    <>
      <Breadcrumb
        items={[
          breadcrumb.requests(),
          query.data && breadcrumb.request(query.data),
          query.data && breadcrumb.editRequest(query.data),
        ]}
      />

      <h1>
        <T id="title" values={{ title: query.data?.title ?? <TextSkeleton width={12} /> }} />
      </h1>

      <Show when={query.data} fallback={<Skeleton />}>
        {(request) => (
          <RequestForm
            initialValues={request()}
            onSubmit={(data) => editRequest.mutateAsync(data)}
            submit={<T id="submit" />}
          />
        )}
      </Show>
    </>
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
