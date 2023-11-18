import { useNavigate } from '@solidjs/router';
import { Component } from 'solid-js';

import { fetchAuthenticatedMember } from '../authentication/use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { Button } from '../components/button';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { store } from '../store/store';
import { TOKENS } from '../tokens';

const T = Translate.prefix('profile');

export const ProfilePage: Component = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    await container.resolve(TOKENS.authenticationGateway).signOut();
    await store.dispatch(fetchAuthenticatedMember());
    navigate('/');
  };

  return (
    <div class="py-4">
      <Button onClick={() => void signOut()} class="self-start">
        <T id="signOut" />
      </Button>
    </div>
  );
};
