import { Trans, useLingui } from '@lingui/react/macro';
import { sendEventNotificationBodySchema, type Event, type SendEventNotificationBody } from '@sel/shared';
import { Button, Dialog, Fieldset, RadioGroup, showToast } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { api } from 'src/app/api';
import { FormServerErrorAlert, InputField, submitWithMutation, TextAreaField } from 'src/components/fields';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

export function NotifyDialog({ event }: { event: Event }) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon="notifications" onClick={() => setOpen(true)} className="grow">
        <Trans>Notify the members</Trans>
      </Button>

      <Dialog.Root open={open} onClose={() => setOpen(false)}>
        <Dialog.Content closeLabel={t`Close`}>
          <Dialog.Header>
            <Dialog.Title>
              <Trans>Notify the members</Trans>
            </Dialog.Title>
            <Dialog.Description>
              <Trans>They receive it by email or on their devices, depending on their settings.</Trans>
            </Dialog.Description>
          </Dialog.Header>

          <NotifyForm event={event} onSent={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

function NotifyForm({ event, onSent }: { event: Event; onSent: () => void }) {
  const { t } = useLingui();
  const participantsCount = event.participants.filter(({ participation }) => participation === 'yes').length;

  const form = useForm({
    resolver: useZodResolver(sendEventNotificationBodySchema),
    defaultValues: { title: '', content: '', recipients: 'participants' as const },
  });

  const mutation = useMutation({
    mutationFn: (body: SendEventNotificationBody) => api('POST', `/events/${event.id}/notify`, { body }),
    onSuccess: () => {
      showToast(t`Notification sent`);
      onSent();
    },
    onError: useFormApiError(form),
  });

  return (
    <form noValidate onSubmit={submitWithMutation(form, mutation)} className="contents">
      <Dialog.Body className="stack gap-6">
        <InputField
          control={form.control}
          name="title"
          label={<Trans>Title</Trans>}
          hint={<Trans>For example: The meeting point has changed</Trans>}
        />

        <TextAreaField control={form.control} name="content" label={<Trans>Message</Trans>} rows={4} />

        <Controller
          control={form.control}
          name="recipients"
          render={({ field: { value, onChange, ref, ...field } }) => (
            <Fieldset.Root>
              <Fieldset.Legend>
                <Trans>Recipients</Trans>
              </Fieldset.Legend>

              <RadioGroup.Root {...field} ref={ref} value={value} onChange={onChange}>
                <RadioGroup.Item
                  value="participants"
                  label={<Trans>The participants ({participantsCount})</Trans>}
                />
                <RadioGroup.Item value="non-participants" label={<Trans>The other members</Trans>} />
                <RadioGroup.Item value="all" label={<Trans>All the members</Trans>} />
              </RadioGroup.Root>
            </Fieldset.Root>
          )}
        />

        <FormServerErrorAlert
          error={form.formState.errors.root}
          title={<Trans>The notification could not be sent</Trans>}
        />
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="submit" loading={form.formState.isSubmitting}>
          <Trans>Send</Trans>
        </Button>
        <Button variant="secondary" onClick={onSent}>
          <Trans>Cancel</Trans>
        </Button>
      </Dialog.Footer>
    </form>
  );
}
