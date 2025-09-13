import { createForm } from '@modular-forms/solid';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';

import { getAppConfig } from 'src/application/config';
import { Button } from 'src/components/button';
import { externalLink } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.onboarding.steps.welcome');

export function WelcomeStep(props: { next: () => void }) {
  const { contactEmail } = getAppConfig();
  const [, { Form }] = createForm();

  return (
    <>
      <h1>
        <T id="title" />
      </h1>

      <div class="col gap-4">
        <p>
          <T id="sentence1" />
        </p>

        <p class="text-sm text-dim">
          <T
            id="sentence2"
            values={{ link: externalLink(`mailto:${contactEmail}`, { class: 'text-link' }) }}
          />
        </p>
      </div>

      <Form class="col" onSubmit={() => props.next()}>
        <Button type="submit" end={<Icon path={arrowRight} class="size-6" />} class="self-end">
          <T id="start" />
        </Button>
      </Form>
    </>
  );
}
