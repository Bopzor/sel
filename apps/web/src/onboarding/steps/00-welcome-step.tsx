import { Component } from 'solid-js';

import { Translate } from '../../intl/translate';
import { NextButton } from '../next-button';

const T = Translate.prefix('onboarding.steps.welcome');

type WelcomeStepProps = {
  onStart: () => void;
};

export const WelcomeStep: Component<WelcomeStepProps> = (props) => {
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

      <NextButton class="self-center" onClick={props.onStart}>
        <Translate id="onboarding.navigation.start" />
      </NextButton>
    </>
  );
};
