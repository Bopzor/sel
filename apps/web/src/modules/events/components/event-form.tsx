import { createForm } from '@felte/solid';
import { validator } from '@nilscox/felte-validator-zod';
import { CreateEventBody, Event, EventKind, UpdateEventBody } from '@sel/shared';
import { isPast, isToday } from '@sel/utils';
import { JSX } from 'solid-js';

import { AddressSearch } from '../../../components/address-search';
import { Button } from '../../../components/button';
import { DayPicker } from '../../../components/day-picker';
import { FormField } from '../../../components/form-field';
import { FormattedInput } from '../../../components/formatted-input';
import { Input } from '../../../components/input';
import { RichEditor } from '../../../components/rich-editor';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';

const T = Translate.prefix('events.form');

const schema = () => {
  const t = T.useTranslation();
  const z = Translate.zod();

  return z.object({
    date: z
      .date()
      .nullable()
      .refine((date) => (date ? !isPast(date) || isToday(date) : true), t('dateIsPast')),
    time: z.date().nullable(),
    location: z.object({}).passthrough().optional(),
    title: z.string().min(3).max(256),
    body: z.string().min(3).max(8192),
    kind: z.nativeEnum(EventKind),
  });
};

type CreateEventFormProps = {
  submit: JSX.Element;
  onSubmit: (event: CreateEventBody) => Promise<string>;
  onSubmitted: (eventId: string) => void;
};

type UpdateEventFormProps = {
  event: Event;
  submit: JSX.Element;
  onSubmit: (event: UpdateEventBody) => Promise<void>;
  onSubmitted: () => void;
};

export function EventForm(props: CreateEventFormProps | UpdateEventFormProps) {
  const t = T.useTranslation();

  // eslint-disable-next-line solid/reactivity
  const event = 'event' in props ? props.event : undefined;

  const { form, data, setData, errors } = createForm({
    initialValues: {
      date: event?.date ? new Date(event.date) : null,
      time: event?.date ? new Date(event.date) : null,
      location: event?.location,
      title: event?.title ?? '',
      body: event?.body ?? '',
      kind: event?.kind ?? EventKind.internal,
    },
    onSubmit: async ({ date, time, ...data }) => {
      if (date && time) {
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
      }

      return props.onSubmit({
        date: date?.toISOString(),
        ...data,
      });
    },
    onSuccess: (eventId) => props.onSubmitted(eventId as string),
    onError: createErrorHandler(),
    extend: validator({ schema: schema() }),
    validate: (values) => {
      if (values.time && !values.date) {
        return { time: t('dateRequired') };
      }

      if (values.date && !values.time) {
        return { time: t('timeRequired') };
      }

      return {};
    },
  });

  return (
    <form ref={form} class="col my-6 gap-4">
      <FormField label={<T id="titleLabel" />} error={errors('title')}>
        <Input name="title" placeholder={t('titlePlaceholder')} />
      </FormField>

      <FormField label={<T id="bodyLabel" />} error={errors('body')}>
        <RichEditor
          placeholder={t('bodyPlaceholder')}
          initialValue={data('body')}
          onChange={(body) => setData('body', body)}
        />
      </FormField>

      <div class="col md:row gap-4">
        <div class="md:col hidden flex-1 gap-6">
          <div class="row gap-2">
            <FormField label={<T id="dateLabel" />} error={errors('date')}>
              <FormattedInput
                value={data('date')}
                onChange={(date) => setData('date', date)}
                placeholder={t('datePlaceholder')}
                parse={parseDay}
                format={formatDay}
              />
            </FormField>

            <FormField label={<T id="timeLabel" />} error={errors('time')}>
              <FormattedInput
                value={data('time')}
                onChange={(date) => setData('time', date)}
                placeholder={t('timePlaceholder')}
                parse={parseTime}
                format={formatTime}
              />
            </FormField>
          </div>

          <DayPicker value={data('date')} onChange={(date) => setData('date', date)} />
        </div>

        <FormField label={<T id="dateLabel" />} error={errors('date')} class="md:hidden">
          <DateInput
            value={data('date')}
            onChange={(date) => {
              setData('date', date);
              setData('time', date);
            }}
          />
        </FormField>

        <FormField class="flex-2 col" label={<T id="locationLabel" />}>
          <AddressSearch
            placeholder={t('locationPlaceholder')}
            value={data('location')}
            onSelected={(address) => setData('location', address)}
            mapClass="min-h-48"
          />
        </FormField>
      </div>

      <Button type="submit" class="self-start">
        {props.submit}
      </Button>
    </form>
  );
}

function DateInput(props: { value: Date; onChange: (value: Date) => void; class?: string }) {
  const getValue = () => {
    if (!props.value) {
      return undefined;
    }

    const date = props.value;

    return [
      [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-'),
      [pad(date.getHours()), pad(date.getMinutes())].join(':'),
    ].join('T');
  };

  return (
    <Input
      type="datetime-local"
      value={getValue()}
      onInput={(event) => props.onChange(new Date(event.target.value))}
      class={props.class}
    />
  );
}

const pad = (value: number) => {
  return String(value).padStart(2, '0');
};

function parseDay(value: string): Date | null {
  const result = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value);

  if (!result) {
    return null;
  }

  const date = new Date();

  date.setDate(Number(result[1]));
  date.setMonth(Number(result[2]) - 1);
  date.setFullYear(Number(result[3]));

  return date;
}

function formatDay(date: Date | null) {
  if (!date) {
    return '';
  }

  return [pad(date.getDate()), pad(date.getMonth() + 1), date.getFullYear()].join('/');
}

function parseTime(value: string): Date | null {
  const result = /(\d{1,2}):(\d{1,2})/.exec(value);

  if (!result) {
    return null;
  }

  const date = new Date();

  date.setHours(Number(result[1]));
  date.setMinutes(Number(result[2]));

  return date;
}

function formatTime(date: Date | null) {
  if (!date) {
    return '';
  }

  return [pad(date.getHours()), pad(date.getMinutes())].join(':');
}
