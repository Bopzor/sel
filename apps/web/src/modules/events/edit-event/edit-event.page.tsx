import { Event, UpdateEventBody } from '@sel/shared';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';
import { EventForm } from '../components/event-form';

const T = Translate.prefix('events.edit');

export default function EditEventPage() {
  const eventApi = container.resolve(TOKENS.eventApi);
  const { eventId } = useParams<{ eventId: string }>();
  const t = T.useTranslation();
  const navigate = useNavigate();

  const [event] = createResource(eventId, async (eventId) => {
    return eventApi.getEvent(eventId);
  });

  return (
    <>
      <Breadcrumb
        items={[
          breadcrumb.events(),
          event.latest && breadcrumb.event(event.latest),
          event.latest && breadcrumb.editEvent(event.latest),
        ]}
      />

      <Show when={event()}>
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
  const eventApi = container.resolve(TOKENS.eventApi);

  return (
    <EventForm
      event={props.event}
      submit={<Translate id="common.save" />}
      onSubmit={(data: UpdateEventBody) => eventApi.updateEvent(props.event.id, data)}
      onSubmitted={props.onEdited}
    />
  );
}
