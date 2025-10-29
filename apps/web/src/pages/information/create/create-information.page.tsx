import { createInformationBodySchema } from '@sel/shared';
import { useNavigate } from '@solidjs/router';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { createTranslate } from 'src/intl/translate';

import { InformationForm } from '../components/information-form';

const T = createTranslate('pages.information.create');

export function CreateInformationPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const createInformation = useMutation(() => ({
    async mutationFn(data: z.infer<typeof createInformationBodySchema>) {
      return api.createInformation({ body: data });
    },
    async onSuccess(informationId) {
      await Promise.all([
        queryClient.prefetchQuery(apiQuery('getInformation', { path: { informationId } })),
        invalidate('getFeed'),
      ]);

      notify.success(t('created'));
      navigate(routes.information.details(informationId));
    },
  }));

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <InformationForm onSubmit={(data) => createInformation.mutateAsync(data)} submit={<T id="submit" />} />
    </>
  );
}
