import { useNavigate } from '@solidjs/router';
import { Component } from 'solid-js';

import { fetchAuthenticatedMember } from '../authentication/use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { Button } from '../components/button';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { store } from '../store/store';
import { TOKENS } from '../tokens';

const T = Translate.prefix('profile.signOut');

export const ProfileSignOutPage: Component = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    await container.resolve(TOKENS.authenticationGateway).signOut();
    await store.dispatch(fetchAuthenticatedMember());
    navigate('/');
  };

  return (
    <div class="col mx-auto my-6 w-full max-w-2xl items-center gap-6 rounded-lg bg-neutral px-6 py-12">
      <p>
        <T id="description" />
      </p>

      <Button onClick={() => void signOut()} class="self-center">
        <T id="button" />
      </Button>
    </div>
  );
};
