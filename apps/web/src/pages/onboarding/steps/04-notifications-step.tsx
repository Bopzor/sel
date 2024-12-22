import { createForm } from '@modular-forms/solid';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';

import { Button } from 'src/components/button';
import { createTranslate } from 'src/intl/translate';
import { NotificationSettingsForm } from 'src/pages/profile/setting/components/notification-settings';

const T = createTranslate('pages.onboarding.steps.notifications');
const Translate = createTranslate('common');

export function NotificationsStep(props: { next: () => void }) {
  const [, { Form }] = createForm();

  return (
    <>
      <p>
        <T id="sentence1" />
      </p>

      <NotificationSettingsForm />

      <Form class="col" onSubmit={() => props.next()}>
        <Button type="submit" end={<Icon path={arrowRight} class="size-6" />} class="self-end">
          <Translate id="next" />
        </Button>
      </Form>
    </>
  );
}
