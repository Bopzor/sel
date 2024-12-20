import { Event, UpdateEventBody } from '@sel/shared';
import { useNavigate, useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';
import { EventForm } from '../components/event-form';

const T = Translate.prefix('events.edit');

export default function EditEventPage() {
  const api = container.resolve(TOKENS.api);
  const params = useParams<{ eventId: string }>();
  const t = T.useTranslation();
  const navigate = useNavigate();

  const query = createQuery(() => ({
    queryKey: ['getEvent', params.eventId],
    queryFn: () => api.getEvent({ path: { eventId: params.eventId } }),
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

      <Show when={query.data}>
        {(event) => (
          <>
            <h1 class="truncate">
              <T id="title" values={{ eventTitle: event().title }} />
            </h1>

            <EditEventForm
              event={event()}
              onEdited={() => {
                navigate(routes.events.details(event().id));
                notify.success(t('edited'));
              }}
            />
          </>
        )}
      </Show>
    </>
  );
}

function EditEventForm(props: { event: Event; onEdited: () => void }) {
  const api = container.resolve(TOKENS.api);

  return (
    <EventForm
      event={props.event}
      submit={<Translate id="common.save" />}
      onSubmit={(data: UpdateEventBody) => api.updateEvent({ path: { eventId: props.event.id }, body: data })}
      onSubmitted={props.onEdited}
    />
  );
}
