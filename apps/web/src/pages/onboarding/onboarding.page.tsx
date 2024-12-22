import { defined } from '@sel/utils';
import { Component, createSignal, Show } from 'solid-js';
import { Dynamic, DynamicProps } from 'solid-js/web';

import { createTranslate } from 'src/intl/translate';
import { ValueOf } from 'src/utils/types';

import { WelcomeStep } from './steps/00-welcome-step';
import { NameStep } from './steps/01-name-step';
import { ContactStep } from './steps/02-contact-step';
import { AddressStep } from './steps/03-address-step';
import { NotificationsStep } from './steps/04-notifications-step';
import { EndStep } from './steps/05-end-step';

const steps = ['welcome', 'name', 'contact', 'address', 'notifications', 'end'] as const;
type Step = (typeof steps)[number];

const components: Record<Step, Component<{ next: () => void }>> = {
  welcome: WelcomeStep,
  name: NameStep,
  contact: ContactStep,
  address: AddressStep,
  notifications: NotificationsStep,
  end: EndStep,
};

const T = createTranslate('pages.onboarding');

export function OnboardingPage() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const step = () => defined(steps[stepIndex()]);

  const props = (): DynamicProps<ValueOf<typeof components>> => {
    return {
      component: components[step()],
      next: () => setStepIndex((index) => index + 1),
    };
  };

  return (
    <section class="col gap-2">
      <Header step={step()} stepIndex={stepIndex()} />

      <div class="col gap-8 rounded-lg bg-neutral p-8 shadow">
        <Dynamic {...props()} />
      </div>
    </section>
  );
}

function Header(props: { step: Step; stepIndex: number }) {
  const visible = () => props.step !== 'welcome' && props.step !== 'end';

  return (
    <header class="row items-end justify-between" classList={{ invisible: !visible() }}>
      <h2 class="text-xl font-semibold text-dim">
        <Show when={visible()} fallback={<wbr />}>
          <T id={`steps.${props.step}.title`} />
        </Show>
      </h2>

      <div class="text-sm text-dim">
        <T id="currentStep" values={{ step: props.stepIndex, total: steps.length - 1 }} />
      </div>
    </header>
  );
}
