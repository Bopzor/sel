import { useNavigate } from '@solidjs/router';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { Component } from 'solid-js';

import { Button } from '../components/button';
import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { TOKENS } from '../tokens';

const T = Translate.prefix('profile.signOut');

export const SignOutPage: Component = () => {
  const navigate = useNavigate();

  const fetcher = container.resolve(TOKENS.fetcher);
  const queryClient = useQueryClient();

  const signOut = createMutation(() => ({
    mutationFn: () => fetcher.delete('/api/session'),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['authenticatedMember'] });
      navigate('/');
    },
  }));

  return (
    <div class="col mx-auto my-6 w-full max-w-2xl items-center gap-6 rounded-lg bg-neutral px-6 py-12">
      <p>
        <T id="description" />
      </p>

      <Button onClick={() => signOut.mutate()} class="self-center">
        <T id="button" />
      </Button>
    </div>
  );
};
