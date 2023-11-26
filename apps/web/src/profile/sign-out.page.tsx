import { useNavigate } from '@solidjs/router';
import { Component } from 'solid-js';

import { Button } from '../components/button';
import { Translate } from '../intl/translate';
import { mutation } from '../utils/mutation';

const T = Translate.prefix('profile.signOut');

export const SignOutPage: Component = () => {
  const navigate = useNavigate();

  const [signOut] = mutation((fetcher) => ({
    key: ['signOut'],
    async mutate() {
      await fetcher.delete('/api/session');
    },
    invalidate: ['authenticatedMember'],
    onSuccess: () => navigate('/'),
  }));

  return (
    <div class="col mx-auto my-6 w-full max-w-2xl items-center gap-6 rounded-lg bg-neutral px-6 py-12">
      <p>
        <T id="description" />
      </p>

      <Button onClick={() => signOut()} class="self-center">
        <T id="button" />
      </Button>
    </div>
  );
};
