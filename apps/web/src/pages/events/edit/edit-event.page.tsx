import { updateEventBodySchema } from '@sel/shared';
import { defined } from '@sel/utils';
import { useNavigate, useParams } from '@solidjs/router';
import { createMutation, createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { createTranslate } from 'src/intl/translate';

import { EventForm } from '../components/event-form';

const T = createTranslate('pages.events.edit');

export function EditEventPage() {
  const navigate = useNavigate();
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const params = useParams<{ eventId: string }>();
  const query = createQuery(() => apiQuery('getEvent', { path: { eventId: params.eventId } }));

  const editEvent = createMutation(() => ({
    async mutationFn(data: z.infer<typeof updateEventBodySchema>) {
      const event = defined(query.data);
      return api.updateEvent({ path: { eventId: event.id }, body: data });
    },
    async onSuccess() {
      const event = defined(query.data);

      await invalidate('getEvent', { path: { eventId: event.id } });
      notify.success(t('edited'));
      navigate(routes.events.details(event.id));
    },
  }));

  return (
    <>
      <Breadcrumb
        items={[
          breadcrumb.events(),
          query.data && breadcrumb.event(query.data),
          query.data && breadcrumb.editEvent(query.data),
        ]}
      />

      <h1>
        <T id="title" values={{ title: query.data?.title ?? <TextSkeleton width={12} /> }} />
      </h1>

      <Show when={query.data} fallback={<Skeleton />}>
        {(event) => (
          <EventForm
            initialValues={event()}
            onSubmit={(data) => editEvent.mutateAsync(data)}
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
