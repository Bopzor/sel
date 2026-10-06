import { Trans } from '@lingui/react/macro';
import { addressSchema, createEventBodySchema, EventKind, type Address, type Event } from '@sel/shared';
import { Button, Card, Fieldset, FormField, Input, RadioGroup, RichTextEditor } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import z from 'zod';

import { formatAddressLines } from 'src/app/format';
import { AddressFormDialog } from 'src/components/address-form-dialog';
import { AddressSearchResults, useAddressSearch } from 'src/components/address-search';
import { AttachmentsField, useAttachments } from 'src/components/attachments';
import { FormServerErrorAlert, InputField, RichTextField, submitWithMutation } from 'src/components/fields';
import { RichTextToolbar } from 'src/components/rich-text-toolbar';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

type EventFormBody = z.output<ReturnType<typeof useSchema>>;

type EventFormProps<Result> = {
  event?: Event;
  mutationFn: (body: EventFormBody) => Promise<Result>;
  onSuccess: (result: Result) => Promise<void>;
  submitLabel: React.ReactNode;
  errorTitle: React.ReactNode;
};

export function EventForm<Result>({
  event,
  mutationFn,
  onSuccess,
  submitLabel,
  errorTitle,
}: EventFormProps<Result>) {
  const form = useForm({
    resolver: useZodResolver(useSchema()),
    defaultValues: {
      title: event?.title ?? '',
      body: event?.message.body ?? '',
      fileIds: event?.message.attachments.map(({ fileId }) => fileId) ?? [],
      kind: event?.kind ?? EventKind.internal,
      date: event?.date === undefined ? '' : toDateTimeLocal(new Date(event.date)),
      location: event?.location ?? null,
    },
  });

  const mutation = useMutation({
    mutationFn,
    onSuccess,
    onError: useFormApiError(form),
  });

  const attachments = useAttachments({
    form,
    name: 'fileIds',
    initial: event?.message.attachments,
  });

  // A new event is planned: the date picker starts from now. An existing one may already be over.
  const [minDate] = useState(() => (event === undefined ? toDateTimeLocal(new Date()) : undefined));

  const onSubmit = (event: React.SubmitEvent) => {
    if (attachments.uploading) {
      event.preventDefault();
    } else {
      submitWithMutation(form, mutation)(event);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="stack gap-6">
      <Card.Body className="stack gap-6">
        <InputField
          control={form.control}
          name="title"
          label={<Trans>Title</Trans>}
          hint={<Trans>A few words, for example: Picnic at the lake</Trans>}
        />
        <Controller
          control={form.control}
          name="kind"
          render={({ field: { value, onChange, ref, ...field } }) => (
            <Fieldset.Root>
              <Fieldset.Legend>
                <Trans>Organizer</Trans>
              </Fieldset.Legend>

              <RadioGroup.Root
                {...field}
                ref={ref}
                value={value}
                onChange={onChange}
                className="grid gap-2 md:grid md:grid-cols-2"
              >
                <RadioGroup.Card
                  value={EventKind.internal}
                  label={<Trans>Organized by the LETS</Trans>}
                  description={<Trans>An event of the LETS, for its members.</Trans>}
                />
                <RadioGroup.Card
                  value={EventKind.external}
                  label={<Trans>Outside event</Trans>}
                  description={<Trans>An event organized by others, that you share with the members.</Trans>}
                />
              </RadioGroup.Root>
            </Fieldset.Root>
          )}
        />

        <InputField
          control={form.control}
          name="date"
          type="datetime-local"
          min={minDate}
          label={<Trans>Date and time (optional)</Trans>}
          hint={<Trans>Leave it empty if the date is not set yet</Trans>}
          className="max-w-80"
        />

        <LocationField event={event} form={form} />

        <RichTextField
          control={form.control}
          name="body"
          label={<Trans>Message</Trans>}
          hint={<Trans>The program, what to bring, how to get there</Trans>}
          toolbar={
            <RichTextEditor.Toolbar>
              <RichTextToolbar.Bold />
              <RichTextToolbar.Italic />
              <RichTextToolbar.Underline />
              <RichTextToolbar.Link />
              <RichTextToolbar.BulletList />
              <RichTextToolbar.OrderedList />
            </RichTextEditor.Toolbar>
          }
        />
        <AttachmentsField
          label={<Trans>Attachments</Trans>}
          hint={<Trans>Photos or documents, up to 10 MB per file</Trans>}
          attachments={attachments}
        />
        <FormServerErrorAlert error={form.formState.errors.root} title={errorTitle} />
      </Card.Body>

      <Card.Footer className="justify-end">
        <Button
          type="submit"
          size="lg"
          loading={form.formState.isSubmitting || attachments.uploading}
          className="max-sm:w-full"
        >
          {submitLabel}
        </Button>
      </Card.Footer>
    </form>
  );
}

type FormSchema = ReturnType<typeof useSchema>;
type FormInput = z.input<FormSchema>;
type FormOutput = z.output<FormSchema>;

type LocationField = {
  event?: Event;
  form: UseFormReturn<FormInput, unknown, FormOutput>;
};

function LocationField({ event, form }: LocationField) {
  const addressSearch = useAddressSearch();
  const location = useWatch({ control: form.control, name: 'location' });

  const [editLocation, setEditLocation] = useState<'search' | 'manual' | false>(
    event?.location ? false : 'search',
  );

  const [focusSearch, setFocusSearch] = useState(false);

  const showLocationSearch = () => {
    setFocusSearch(true);
    setEditLocation('search');
  };

  const setLocation = (address: Address | null) => {
    form.setValue('location', address, { shouldDirty: true });
    addressSearch.clear();
    setEditLocation(address === null ? 'search' : false);
  };

  return (
    <>
      <AddressFormDialog
        open={editLocation === 'manual'}
        onClose={showLocationSearch}
        address={location ?? undefined}
        title={<Trans>Enter the address of the event</Trans>}
        submitLabel={<Trans>Save</Trans>}
        onSubmit={setLocation}
      />

      {location && !editLocation && (
        <div className="stack gap-2">
          <FormField label={<Trans>Location</Trans>}>
            <p className="wrap-break-word whitespace-pre-line">{formatAddressLines(location).join('\n')}</p>
          </FormField>

          <div className="row flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={showLocationSearch}>
              <Trans>Edit</Trans>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFocusSearch(true);
                setLocation(null);
              }}
            >
              <Trans>Remove the location</Trans>
            </Button>
          </div>
        </div>
      )}

      {editLocation && (
        <div className="stack gap-4">
          <FormField
            label={<Trans>Location (optional)</Trans>}
            hint={<Trans>Leave it empty if the location is not decided yet</Trans>}
          >
            <Input
              type="search"
              icon="search"
              // Enter would submit the event.
              onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
              autoFocus={focusSearch}
              {...addressSearch.inputProps}
            />
          </FormField>

          {addressSearch.status && (
            <p aria-live="polite" className="text-body-sm text-muted">
              {addressSearch.status}
            </p>
          )}

          {addressSearch.suggestions.length > 0 && (
            <div className="text-body-sm text-subtle">
              <Trans>Choose an address in the list below</Trans>
            </div>
          )}

          <AddressSearchResults {...addressSearch} onSelect={setLocation} />

          <div className="row flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditLocation('manual')}>
              <Trans>Manual entry</Trans>
            </Button>
            {location && (
              <Button variant="ghost" size="sm" onClick={() => setEditLocation(false)}>
                <Trans>Cancel</Trans>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function useSchema() {
  return createEventBodySchema
    .extend({ date: z.string(), location: addressSchema.nullable() })
    .transform(({ date, ...body }) => ({
      ...body,
      date: date === '' ? null : new Date(date).toISOString(),
    }));
}

// The value of a datetime-local input: the local date and time, without the time zone.
function toDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join('T');
}
