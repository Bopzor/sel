import { createForm, Field, FormStore } from '@modular-forms/solid';
import { Event, SendEventNotificationBody, sendEventNotificationBodySchema } from '@sel/shared';
import { useMutation, useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery } from 'src/application/query';
import { Button } from 'src/components/button';
import { DialogFooter } from 'src/components/dialog';
import { FormControl } from 'src/components/form-control';
import { Input } from 'src/components/input';
import { Radio } from 'src/components/radio';
import { TextArea } from 'src/components/text-area';
import { createTranslate } from 'src/intl/translate';
import { zodForm } from 'src/utils/validation';

const T = createTranslate('pages.events.details.notificationForm');

export function EventNotificationForm(props: { event: Event; onSuccess: () => void }) {
  const t = T.useTranslate();

  const membersQuery = useQuery(() => apiQuery('listMembers', { query: {} }));

  const [form, { Form, Field }] = createForm<SendEventNotificationBody>({
    initialValues: {
      title: '',
      content: '',
      recipients: 'participants',
    },
    validate: zodForm(sendEventNotificationBodySchema),
  });

  const mutation = useMutation(() => ({
    mutationFn: async (body: SendEventNotificationBody) => {
      return api.sendEventNotification({ path: { eventId: props.event.id }, body });
    },
    onSuccess: () => {
      notify.info(t('sent'));
      props.onSuccess();
    },
  }));

  return (
    <Form class="col gap-4" onSubmit={(values) => mutation.mutateAsync(values)}>
      <Field name="title">
        {(field, props) => (
          <Input
            variant="outlined"
            label={<T id="title.label" />}
            error={field.error}
            value={field.value}
            {...props}
          />
        )}
      </Field>

      <Field name="content">
        {(field, props) => (
          <TextArea
            variant="outlined"
            label={<T id="content.label" />}
            rows={4}
            classes={{ field: 'h-auto' }}
            error={field.error}
            value={field.value}
            {...props}
          />
        )}
      </Field>

      <Show when={membersQuery.isSuccess ? membersQuery.data.length : false}>
        {(membersCount) => (
          <FormControl id="" label={<T id="recipients.label" />}>
            <RecipientsField
              form={form}
              membersCount={membersCount()}
              participantsCount={props.event.participants.length}
            />
          </FormControl>
        )}
      </Show>

      <DialogFooter>
        <Button loading={mutation.isPending} type="submit">
          <T id="submit" />
        </Button>
      </DialogFooter>
    </Form>
  );
}

function RecipientsField(props: {
  form: FormStore<SendEventNotificationBody>;
  participantsCount: number;
  membersCount: number;
}) {
  return (
    <div class="col gap-0.5">
      <Field of={props.form} name="recipients">
        {(field, fieldProps) => (
          <label class="row gap-2 items-center">
            <input type="radio" checked={field.value === 'participants'} {...fieldProps} />
            <T id="recipients.participants" values={{ count: props.participantsCount }} />
          </label>
        )}
      </Field>

      <Field of={props.form} name="recipients">
        {(field, fieldProps) => (
          <Radio
            label={
              <T
                id="recipients.nonParticipants"
                values={{ count: props.membersCount - props.participantsCount }}
              />
            }
            checked={field.value === 'non-participants'}
            {...fieldProps}
          />
        )}
      </Field>

      <Field of={props.form} name="recipients">
        {(field, fieldProps) => (
          <Radio
            label={<T id="recipients.all" values={{ count: props.membersCount }} />}
            checked={field.value === 'non-participants'}
            {...fieldProps}
          />
        )}
      </Field>
    </div>
  );
}
