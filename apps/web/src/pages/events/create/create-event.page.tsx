import { createEventBodySchema } from '@sel/shared';
import { useNavigate } from '@solidjs/router';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { createTranslate } from 'src/intl/translate';

import { EventForm } from '../components/event-form';

const T = createTranslate('pages.events.create');

export function CreateEventPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const t = T.useTranslate();

  const createEvent = createMutation(() => ({
    async mutationFn(data: z.infer<typeof createEventBodySchema>) {
      return api.createEvent({ body: data });
    },
    async onSuccess(eventId) {
      await queryClient.prefetchQuery(apiQuery('getEvent', { path: { eventId } }));
      notify.success(t('created'));
      navigate(routes.events.details(eventId));
    },
  }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.events(), breadcrumb.createEvent()]} />

      <h1>
        <T id="title" />
      </h1>

      <EventForm onSubmit={(data) => createEvent.mutateAsync(data)} submit={<T id="submit" />} />
    </>
  );
}
