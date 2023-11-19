import { Show } from 'solid-js';

import { Switch } from '../../components/switch';
import { Translate } from '../../intl/translate';

const T = Translate.prefix('onboarding');

type ProfileFieldVisibilityProps<Name extends string> = {
  name: Name;
  data: (name: Name) => boolean;
};

export const ProfileFieldVisibility = <Name extends string>(props: ProfileFieldVisibilityProps<Name>) => {
  return (
    <Switch name={props.name}>
      <Show when={props.data(props.name)}>
        <T id="visible" />
      </Show>
      <Show when={!props.data(props.name)}>
        <T id="notVisible" />
      </Show>
    </Switch>
  );
};
