import { Component, ComponentProps, splitProps } from 'solid-js';

import { Input, TextArea } from '../../components/input';
import { OnFieldChange, OnboardingForm } from '../onboarding-form';

type OnboardingInputProps = Omit<ComponentProps<typeof Input>, 'name' | 'form'> & {
  name: keyof OnboardingForm;
  form: OnboardingForm;
  onFieldChange: OnFieldChange;
};

export const OnboardingInput: Component<OnboardingInputProps> = (_props) => {
  const [local, props] = splitProps(_props, ['form', 'onFieldChange']);

  return (
    <Input
      width="medium"
      class="border"
      value={local.form[props.name] as string}
      onBlur={local.onFieldChange(props.name)}
      {...props}
    />
  );
};

type OnboardingTextAreaProps = Omit<ComponentProps<typeof TextArea>, 'name' | 'form'> & {
  name: keyof OnboardingForm;
  form: OnboardingForm;
  onFieldChange: OnFieldChange;
};

export const OnboardingTextArea: Component<OnboardingTextAreaProps> = (_props) => {
  const [local, props] = splitProps(_props, ['form', 'onFieldChange']);

  return (
    <TextArea
      width="medium"
      class="border"
      value={local.form[props.name] as string}
      onBlur={local.onFieldChange(props.name)}
      {...props}
    />
  );
};
