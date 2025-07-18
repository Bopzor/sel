import { createForm, setValue } from '@modular-forms/solid';
import { CreateEventBody, createEventBodySchema, Event, EventKind } from '@sel/shared';
import { isPast, isToday } from '@sel/utils';
import { JSX } from 'solid-js';
import { z } from 'zod';

import { AddressSearch } from 'src/components/address-search';
import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { RichEditor } from 'src/components/rich-editor';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.events.form');

const schema = createEventBodySchema.extend({
  kind: z.undefined(),
  date: z
    .date()
    .optional()
    .refine((date) => (date ? !isPast(date) || isToday(date) : true), { params: { dateIsPast: true } }),
  location: z.any(),
});

type FormType = z.infer<typeof schema>;

export function EventForm(props: {
  initialValues?: Event;
  onSubmit: (data: CreateEventBody) => Promise<unknown>;
  submit: JSX.Element;
}) {
  const t = T.useTranslate();

  const [form, { Form, Field }] = createForm<FormType>({
    initialValues: {
      title: props.initialValues?.title,
      body: props.initialValues?.body,
      location: props.initialValues?.location ?? null,
      date: props.initialValues?.date ? new Date(props.initialValues.date) : undefined,
    },
    validate: zodForm(schema, {
      errorMap: createErrorMap((error) => {
        if (error.code === 'custom' && error.params?.dateIsPast) {
          return t('date.isPast');
        }
      }),
    }),
  });

  return (
    <Form
      class="my-6 col max-w-4xl gap-4"
      onSubmit={({ title, body, date, location }) => {
        return props.onSubmit({
          title,
          body,
          date: date ? date.toISOString() : undefined,
          location: location ?? undefined,
          kind: EventKind.internal,
        });
      }}
    >
      <Field name="title">
        {(field, props) => (
          <Input
            {...props}
            label={<T id="title.label" />}
            placeholder={t('title.placeholder')}
            error={field.error}
            value={field.value}
          />
        )}
      </Field>

      <Field name="body">
        {(field, props) => (
          <RichEditor
            ref={props.ref}
            label={<T id="body.label" />}
            placeholder={t('body.placeholder')}
            error={field.error}
            initialValue={field.value}
            onChange={(html) => setValue(form, 'body', html)}
          />
        )}
      </Field>

      <div class="row gap-4">
        <Field name="date" type="Date">
          {(field, props) => (
            <Input
              {...props}
              type="datetime-local"
              min={formatDateToInput(new Date())}
              label={<T id="date.label" />}
              error={field.error}
              value={formatDateToInput(field.value)}
              onChange={(event) =>
                setValue(form, 'date', event.target.value ? new Date(event.target.value) : undefined)
              }
              classes={{ root: 'w-1/3' }}
            />
          )}
        </Field>

        <Field name="location">
          {(field, props) => (
            <AddressSearch
              ref={props.ref}
              name={props.name}
              autofocus={props.autofocus}
              label={<T id="location.label" />}
              error={field.error}
              selected={field.value}
              onSelected={(location) => setValue(form, 'location', location)}
              classes={{ root: 'w-2/3' }}
            />
          )}
        </Field>
      </div>

      <Button type="submit" class="self-start">
        {props.submit}
      </Button>
    </Form>
  );
}

function formatDateToInput(date?: Date): string {
  if (!date) {
    return '';
  }

  const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  const [hours, minutes] = [date.getHours(), date.getMinutes()];

  const str = (value: number) => {
    return String(value).padStart(2, '0');
  };

  return `${year}-${str(month)}-${str(day)}T${str(hours)}:${str(minutes)}`;
}
