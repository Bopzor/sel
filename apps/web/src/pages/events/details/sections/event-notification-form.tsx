import { createForm, Field, FormStore } from '@modular-forms/solid';
import { Event, SendEventNotificationBody, sendEventNotificationBodySchema } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { useMutation, useQuery } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { apiQuery } from 'src/application/query';
import { Button } from 'src/components/button';
import { DialogFooter } from 'src/components/dialog';
import { Field as FieldComponent, Input, Textarea } from 'src/components/form-controls';
import { Query } from 'src/components/query';
import { Radio } from 'src/components/radio';
import { createTranslate } from 'src/intl/translate';
import { zodForm } from 'src/utils/validation';

const T = createTranslate('pages.events.details.notificationForm');

export function EventNotificationForm(props: { event: Event; onSuccess: () => void }) {
  const t = T.useTranslate();

  const membersCountQuery = useQuery(() => ({
    ...apiQuery('listMembers', { query: {} }),
    select: (members) => members.length,
  }));

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
            {...props}
            variant="outlined"
            label={<T id="title.label" />}
            error={field.error}
            value={field.value}
          />
        )}
      </Field>

      <Field name="content">
        {(field, props) => (
          <Textarea
            {...props}
            rows={4}
            variant="outlined"
            label={<T id="content.label" />}
            error={field.error}
            value={field.value}
          />
        )}
      </Field>

      <Query query={membersCountQuery}>
        {(membersCount) => (
          <FieldComponent label={<T id="recipients.label" />}>
            <RecipientsField
              form={form}
              membersCount={membersCount()}
              participantsCount={props.event.participants.filter(hasProperty('participation', 'yes')).length}
            />
          </FieldComponent>
        )}
      </Query>

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
  const nonParticipantsCount = () => props.membersCount - props.participantsCount;

  return (
    <div class="col gap-0.5">
      <Field of={props.form} name="recipients">
        {(field, fieldProps) => (
          <Radio
            label={<T id="recipients.participants" values={{ count: props.participantsCount }} />}
            checked={field.value === 'participants'}
            value="participants"
            {...fieldProps}
          />
        )}
      </Field>

      <Field of={props.form} name="recipients">
        {(field, fieldProps) => (
          <Radio
            label={<T id="recipients.nonParticipants" values={{ count: nonParticipantsCount() }} />}
            checked={field.value === 'non-participants'}
            value="non-participants"
            {...fieldProps}
          />
        )}
      </Field>

      <Field of={props.form} name="recipients">
        {(field, fieldProps) => (
          <Radio
            label={<T id="recipients.all" values={{ count: props.membersCount }} />}
            checked={field.value === 'all'}
            value="all"
            {...fieldProps}
          />
        )}
      </Field>
    </div>
  );
}
