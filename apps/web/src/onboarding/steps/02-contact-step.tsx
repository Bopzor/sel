import { Component, Show, createSignal } from 'solid-js';

import { Input } from '../../components/input';
import { Row } from '../../components/row';
import { Translate } from '../../intl/translate';
import { getAppState } from '../../store/app-store';
import { NextButton } from '../components/next-button';
import { OnboardingField } from '../components/onboarding-field';
import { OnboardingFieldVisibility } from '../components/onboarding-field-visibility';
import { OnboardingInput } from '../components/onboarding-input';
import { OnFieldChange, OnboardingForm } from '../onboarding-form';

const T = Translate.prefix('onboarding.steps.contact');

type ContactStepProps = {
  form: OnboardingForm;
  onFieldChange: OnFieldChange;
  onNext: () => void;
};

export const ContactStep: Component<ContactStepProps> = (props) => {
  const state = getAppState();
  const t = T.useTranslation();

  // eslint-disable-next-line prefer-const
  let phoneNumberRef: HTMLInputElement | undefined = undefined;

  const validatePhoneNumber = () => {
    const phoneNumber = props.form.phoneNumber.replaceAll(' ', '');

    if (!phoneNumber.match(/^0\d{9}$/)) {
      phoneNumberRef?.setCustomValidity(t('phoneNumberInvalid'));
      phoneNumberRef?.reportValidity();

      return false;
    }

    phoneNumberRef?.setCustomValidity('');

    return true;
  };

  const [showEmailReadonlyMessage, setShowEmailReadonlyMessage] = createSignal(false);

  return (
    <>
      <div>
        <p>
          <T id="sentence1" />
        </p>
        <p>
          <T id="sentence2" />
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (validatePhoneNumber()) {
            props.onNext();
          }
        }}
        class="col gap-4"
      >
        <OnboardingField label={<T id="emailAddress" />}>
          <Row gap={4}>
            <Input
              required
              readonly
              type="email"
              variant="outlined"
              width="medium"
              value={state.authenticatedMember?.email}
              onFocus={() => setShowEmailReadonlyMessage(true)}
              onBlur={() => setShowEmailReadonlyMessage(false)}
            />
            <OnboardingFieldVisibility field="email" form={props.form} onFieldChange={props.onFieldChange} />
          </Row>
          <Show when={showEmailReadonlyMessage()}>
            <p class="text-sm">{t('emailReadOnly')}</p>
          </Show>
        </OnboardingField>

        <OnboardingField label={<T id="phoneNumber" />}>
          <Row gap={4}>
            <OnboardingInput
              ref={phoneNumberRef}
              required
              type="tel"
              name="phoneNumber"
              placeholder={t('phoneNumberPlaceholder')}
              form={props.form}
              onFieldChange={props.onFieldChange}
              onBlur={(event) => {
                props.onFieldChange('phoneNumber')(event);
                validatePhoneNumber();
              }}
            />
            <OnboardingFieldVisibility
              field="phoneNumber"
              form={props.form}
              onFieldChange={props.onFieldChange}
            />
          </Row>
        </OnboardingField>

        <NextButton type="submit">
          <Translate id="onboarding.navigation.next" />
        </NextButton>
      </form>
    </>
  );
};
