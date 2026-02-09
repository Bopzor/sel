import { updateEventBodySchema } from '@sel/shared';
import { useNavigate, useParams } from '@solidjs/router';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery, useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Query } from 'src/components/query';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { createTranslate } from 'src/intl/translate';

import { EventForm } from '../components/event-form';

const T = createTranslate('pages.events.edit');

export function EditEventPage() {
  const navigate = useNavigate();
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const params = useParams<{ eventId: string }>();
  const query = useQuery(() => apiQuery('getEvent', { path: { eventId: params.eventId } }));

  const editEvent = useMutation(() => ({
    async mutationFn(data: z.infer<typeof updateEventBodySchema>) {
      return api.updateEvent({ path: { eventId: params.eventId }, body: data });
    },
    async onSuccess() {
      await Promise.all([
        invalidate('getEvent', { path: { eventId: params.eventId } }),
        invalidate('listEvents'),
        invalidate('getFeed'),
      ]);

      notify.success(t('edited'));
      navigate(routes.events.details(params.eventId));
    },
  }));

  return (
    <Query query={query} pending={<Skeleton />}>
      {(event) => (
        <>
          <h1>
            <T id="title" values={{ title: event.title }} />
          </h1>

          <EventForm
            initialValue={event}
            onSubmit={(data) => editEvent.mutateAsync(data)}
            submit={<T id="submit" />}
          />
        </>
      )}
    </Query>
  );
}

function Skeleton() {
  return (
    <>
      <div class="text-3xl">
        <TextSkeleton width={32} />
      </div>

      <div class="my-6 col max-w-4xl gap-4">
        <BoxSkeleton height={4} />
        <BoxSkeleton height={16} />
        <BoxSkeleton height={6} />

        <div class="row items-center gap-4">
          <BoxSkeleton height={4} />
          <BoxSkeleton height={4} />
        </div>
      </div>
    </>
  );
}
