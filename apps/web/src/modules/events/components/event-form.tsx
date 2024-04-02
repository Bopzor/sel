import { createForm } from '@felte/solid';
import { Event, EventKind } from '@sel/shared';
import { JSX } from 'solid-js';

import { AddressSearch } from '../../../components/address-search';
import { Button } from '../../../components/button';
import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { RichEditor } from '../../../components/rich-editor';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';

const T = Translate.prefix('events.form');

export function EventForm(props: {
  event?: Event;
  submit: JSX.Element;
  onSubmit: (event: Event) => Promise<string>;
  onSubmitted: (eventId: string) => void;
}) {
  const t = T.useTranslation();

  const { form, data, setData } = createForm({
    initialValues: {
      date: props.event?.date ?? '',
      location: props.event?.location,
      title: props.event?.title ?? '',
      body: props.event?.body ?? '',
      kind: props.event?.kind ?? EventKind.internal,
    },
    transform: (values) => ({
      ...values,
      date: values.date ? new Date(values.date).toISOString() : '',
    }),
    onSubmit: props.onSubmit,
    onSuccess: (eventId) => props.onSubmitted(eventId as string),
    onError: createErrorHandler(),
  });

  return (
    <form ref={form} class="col my-6 gap-4">
      <div class="col md:row gap-4">
        <FormField class="flex-1" label={<T id="dateLabel" />}>
          <Input name="date" type="datetime-local" />
        </FormField>

        <FormField class="flex-2" label={<T id="locationLabel" />}>
          <AddressSearch value={data('location')} onSelected={(address) => setData('location', address)} />
        </FormField>
      </div>

      <FormField label={<T id="titleLabel" />}>
        <Input name="title" placeholder={t('titlePlaceholder')} />
      </FormField>

      <FormField label={<T id="bodyLabel" />}>
        <RichEditor
          placeholder={t('bodyPlaceholder')}
          initialValue={data('body')}
          onChange={(body) => setData('body', body)}
        />
      </FormField>

      <Button type="submit" class="self-start">
        {props.submit}
      </Button>
    </form>
  );
}
