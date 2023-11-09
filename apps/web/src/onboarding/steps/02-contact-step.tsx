import { Component } from 'solid-js';

import { selectAuthenticatedMember } from '../../authentication/authentication.slice';
import { Input } from '../../components/input';
import { Translate } from '../../intl/translate';
import { selector } from '../../store/selector';
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
  const member = selector(selectAuthenticatedMember);
  const t = T.useTranslation();

  // eslint-disable-next-line prefer-const
  let phoneNumberRef: HTMLInputElement | undefined = undefined;

  const validatePhoneNumber = () => {
    const phoneNumber = props.form.phoneNumber.replaceAll(' ', '');

    if (!phoneNumber.match(/\d{10}/) || phoneNumber[0] !== '0') {
      phoneNumberRef?.setCustomValidity(t('phoneNumberInvalid'));

      return false;
    }

    return true;
  };

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
          <div class="row items-center gap-4">
            <Input
              required
              readonly
              width="medium"
              class="border"
              value={member().email}
              title={t('emailReadOnly')}
            />
            <OnboardingFieldVisibility field="email" form={props.form} onFieldChange={props.onFieldChange} />
          </div>
        </OnboardingField>

        <OnboardingField label={<T id="phoneNumber" />}>
          <div class="row items-center gap-4">
            <OnboardingInput
              ref={phoneNumberRef}
              required
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
          </div>
        </OnboardingField>

        <NextButton type="submit">
          <Translate id="onboarding.navigation.next" />
        </NextButton>
      </form>
    </>
  );
};
