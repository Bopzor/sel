import { updateInformationBodySchema } from '@sel/shared';
import { defined } from '@sel/utils';
import { useNavigate, useParams } from '@solidjs/router';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { createTranslate } from 'src/intl/translate';

import { InformationForm } from '../components/information-form';

const T = createTranslate('pages.information.edit');

export function EditInformationPage() {
  const navigate = useNavigate();
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const params = useParams<{ informationId: string }>();
  const query = useQuery(() => apiQuery('getInformation', { path: { informationId: params.informationId } }));

  const editInformation = useMutation(() => ({
    async mutationFn(data: z.infer<typeof updateInformationBodySchema>) {
      const information = defined(query.data);
      return api.updateInformation({ path: { informationId: information.id }, body: data });
    },
    async onSuccess() {
      const information = defined(query.data);

      await Promise.all([
        invalidate('getInformation', { path: { informationId: information.id } }),
        invalidate('getFeed'),
      ]);
      notify.success(t('edited'));
      navigate(routes.information.details(information.id));
    },
  }));

  return (
    <>
      <h1>
        <T id="title" values={{ title: query.data?.title ?? <TextSkeleton width={12} /> }} />
      </h1>

      <Show when={query.data} fallback={<Skeleton />}>
        {(event) => (
          <InformationForm
            initialValue={event()}
            onSubmit={(data) => editInformation.mutateAsync(data)}
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
