import { Component } from 'solid-js';

import { Translate } from '../../intl/translate';
import { NextButton } from '../components/next-button';

const T = Translate.prefix('onboarding.steps.end');

type EndStepProps = {
  loading: boolean;
  onNext: () => void;
};

export const EndStep: Component<EndStepProps> = (props) => {
  return (
    <>
      <div class="col gap-1">
        <p>
          <T id="sentence1" />
        </p>

        <p>
          <T id="sentence2" />
        </p>

        <ul class="list-inside list-disc">
          <li>
            <a href="https://join.slack.com/t/selons-nous/shared_invite/zt-23rygmgs7-CxJupKgeTM0OrV4WQXuFaA">
              <T id="contact.slack" />
            </a>
          </li>

          <li>
            <T
              id="contact.email"
              values={{
                email: 'selons-nous@nilscox.dev',
                link: (children) => <a href="selons-nous@nilscox.dev">{children}</a>,
              }}
            />
          </li>
        </ul>
      </div>

      <NextButton class="self-center" loading={props.loading} onClick={props.onNext}>
        <Translate id="onboarding.navigation.end" />
      </NextButton>
    </>
  );
};
