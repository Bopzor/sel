import { Component } from 'solid-js';

import { Button } from '../components/button';
import { Translate } from '../intl/translate';
import { getAppActions } from '../store/app-store';
import { createAsyncCall } from '../utils/async-call';

const T = Translate.prefix('profile.signOut');

export const SignOutPage: Component = () => {
  const actions = getAppActions();
  const [signOut, pending] = createAsyncCall(actions.signOut);

  return (
    <div class="col mx-auto my-6 w-full max-w-2xl items-center gap-6 rounded-lg bg-neutral px-6 py-12">
      <p>
        <T id="description" />
      </p>

      <Button onClick={() => signOut()} loading={pending()} class="self-center">
        <T id="button" />
      </Button>
    </div>
  );
};
