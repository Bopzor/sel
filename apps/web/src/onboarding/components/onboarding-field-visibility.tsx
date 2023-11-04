import { Show, createMemo } from 'solid-js';

import { SwitchLabel } from '../../components/switch';
import { Translate } from '../../intl/translate';
import { OnFieldChange, OnboardingForm } from '../onboarding-form';

const T = Translate.prefix('onboarding');

type OnboardingFieldVisibilityProps = {
  field: 'email' | 'phoneNumber' | 'bio' | 'address';
  form: OnboardingForm;
  onFieldChange: OnFieldChange;
};

export const OnboardingFieldVisibility = (props: OnboardingFieldVisibilityProps) => {
  const field = () => `${props.field}Visible` as const;
  const visible = createMemo(() => props.form[field()]);

  return (
    <SwitchLabel id={field()} checked={visible()} onChange={props.onFieldChange(field())}>
      <Show when={visible()}>
        <T id="visible" />
      </Show>
      <Show when={!visible()}>
        <T id="notVisible" />
      </Show>
    </SwitchLabel>
  );
};
