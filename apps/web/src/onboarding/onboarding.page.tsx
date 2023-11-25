import { Show, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

import { selectAuthenticatedMember } from '../authentication/authentication.slice';
import { fetchAuthenticatedMember } from '../authentication/use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { store } from '../store/store';
import { TOKENS } from '../tokens';
import { formatPhoneNumber } from '../utils/format-phone-number';

import { Stepper } from './components/stepper';
import { OnFieldChange, OnboardingForm } from './onboarding-form';
import { WelcomeStep } from './steps/00-welcome-step';
import { NameStep } from './steps/01-name-step';
import { ContactStep } from './steps/02-contact-step';
import { BioStep } from './steps/03-bio-step';
import { AddressStep } from './steps/04-address-step';
import { EndStep } from './steps/05-end-step';

const T = Translate.prefix('onboarding');

export const OnboardingPage = () => {
  const [step, setStep] = createSignal(0);
  const handleNext = () => setStep((step) => step + 1);

  const member = selectAuthenticatedMember(store.getState());

  const [form, setForm] = createStore<OnboardingForm>({
    firstName: member.firstName,
    lastName: member.lastName,
    emailVisible: true,
    phoneNumber: member.phoneNumbers.length > 0 ? formatPhoneNumber(member.phoneNumbers[0].number) : '',
    phoneNumberVisible: true,
    bio: member.bio ?? '',
  });

  const onFieldChange: OnFieldChange = (field) => {
    return ({ currentTarget }) => {
      if (currentTarget.type === 'checkbox') {
        setForm(field, (currentTarget as HTMLInputElement).checked);
      } else {
        setForm(field, currentTarget.value);
      }
    };
  };

  const handleEnd = async () => {
    const memberProfileGateway = container.resolve(TOKENS.memberProfileGateway);

    await memberProfileGateway.updateMemberProfile(member.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      emailVisible: form.emailVisible,
      phoneNumbers: [{ number: form.phoneNumber.replaceAll(' ', ''), visible: form.phoneNumberVisible }],
      bio: form.bio || undefined,
      address: form.address || undefined,
      onboardingCompleted: true,
    });

    await store.dispatch(fetchAuthenticatedMember());
  };

  return (
    <div class="col mx-auto mt-8 w-full max-w-4xl gap-4 rounded-xl bg-neutral p-8">
      <h1 class="text-3xl font-semibold">
        <T id="title" />
      </h1>

      <Show when={step() >= 1 && step() <= 4}>
        <Stepper step={step()} setStep={setStep} />
      </Show>

      <Show when={step() === 0}>
        <WelcomeStep onStart={handleNext} />
      </Show>

      <Show when={step() === 1}>
        <NameStep onNext={handleNext} form={form} onFieldChange={onFieldChange} />
      </Show>

      <Show when={step() === 2}>
        <ContactStep onNext={handleNext} form={form} onFieldChange={onFieldChange} />
      </Show>

      <Show when={step() === 3}>
        <BioStep onNext={handleNext} form={form} onFieldChange={onFieldChange} />
      </Show>

      <Show when={step() === 4}>
        <AddressStep
          onNext={handleNext}
          form={form}
          onAddressSelected={(address) => setForm('address', address)}
        />
      </Show>

      <Show when={step() === 5}>
        <EndStep onNext={() => void handleEnd()} />
      </Show>
    </div>
  );
};
