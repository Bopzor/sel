import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import clsx from 'clsx';
import { Show, createSignal } from 'solid-js';
import { z } from 'zod';

import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { Switch } from '../../../components/switch';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NextButton } from '../components/next-button';
import { OnboardingStep, OnboardingStepProps } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.contact');

function schema() {
  const t = T.useTranslation();

  return z.object({
    phoneNumber: z.preprocess(
      (value) => String(value).replaceAll(' ', ''),
      z.string().refine((value) => value.match(/^0\d{9}$/), t('phoneNumberInvalid')),
    ),
  });
}

export function ContactStep(props: OnboardingStepProps<OnboardingStep.contact>) {
  const t = T.useTranslation();
  const [showEmailReadonlyMessage, setShowEmailReadonlyMessage] = createSignal(false);

  // @ts-expect-error solidjs directive
  const { form, data, errors } = createForm({
    initialValues: props.initialValues,
    extend: validator({ schema: schema() }),
    onSubmit: props.onSubmit,
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col gap-4">
      <div class="col gap-1">
        <p>
          <T id="sentence1" />
        </p>
      </div>

      <FormField label={<T id="emailAddress" />}>
        <div class="row gap-4">
          <Input
            required
            readonly
            type="email"
            name="email"
            variant="outlined"
            width="medium"
            onFocus={() => setShowEmailReadonlyMessage(true)}
            onBlur={() => setShowEmailReadonlyMessage(false)}
          />
          <FieldVisibility name="emailVisible" checked={data((data) => data.emailVisible)} />
        </div>
        <Show when={showEmailReadonlyMessage()}>
          <p class="text-sm">{t('emailReadOnly')}</p>
        </Show>
      </FormField>

      <FormField label={<T id="phoneNumber" />} error={errors('phoneNumber')}>
        <div class="row gap-4">
          <Input
            required
            type="tel"
            name="phoneNumber"
            variant="outlined"
            width="medium"
            placeholder={t('phoneNumberPlaceholder')}
          />
          <FieldVisibility name="phoneNumberVisible" checked={data((data) => data.phoneNumberVisible)} />
        </div>
      </FormField>

      <NextButton type="submit">
        <Translate id="onboarding.navigation.next" />
      </NextButton>
    </form>
  );
}

export function FieldVisibility(props: { name: string; checked: boolean }) {
  return (
    <Switch name={props.name}>
      <span class={clsx(!props.checked && 'hidden')}>
        <Translate id="common.visible" />
      </span>
      <span class={clsx(props.checked && 'hidden')}>
        <Translate id="common.notVisible" />
      </span>
    </Switch>
  );
}
