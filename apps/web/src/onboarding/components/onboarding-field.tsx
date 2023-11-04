import { JSX } from 'solid-js';

type OnboardingFieldProps = {
  label: JSX.Element;
  children: JSX.Element;
};

export const OnboardingField = (props: OnboardingFieldProps) => {
  return (
    <div class="col gap-1">
      <label class="font-medium">{props.label}</label>
      {props.children}
    </div>
  );
};
