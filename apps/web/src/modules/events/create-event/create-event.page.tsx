import { useNavigate } from '@solidjs/router';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { notify } from '../../../utils/notify';
import { EventForm } from '../components/event-form';

const T = Translate.prefix('events.create');

export default function CreateEventPage() {
  const t = T.useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Breadcrumb items={[breadcrumb.events(), breadcrumb.createEvent()]} />

      <h1>
        <T id="title" />
      </h1>

      <CreateEventForm
        onCreated={(eventId) => {
          navigate(routes.events.details(eventId));
          notify.success(t('created'));
        }}
      />
    </>
  );
}

export function CreateEventForm(props: { onCreated: (eventId: string) => void }) {
  const eventApi = container.resolve(TOKENS.eventApi);

  return (
    <EventForm
      submit={<T id="create" />}
      onSubmit={(event) => eventApi.createEvent(event)}
      onSubmitted={(eventId) => props.onCreated(eventId as string)}
    />
  );
}
