import { useNavigate } from '@solidjs/router';
import { useMutation, useQueryClient } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { routes } from 'src/application/routes';
import { setSentryUserId } from 'src/application/sentry';
import { Button } from 'src/components/button';
import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.profile.signOut');

export function SignOutPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation(() => ({
    async mutationFn() {
      await api.signOut({});
    },
    async onSuccess() {
      queryClient.clear();
      setSentryUserId(null);
      navigate(routes.landing);
    },
  }));

  return (
    <div class="mx-auto my-6 w-full max-w-2xl">
      <Card title={<T id="title" />}>
        <p>
          <T id="description" />
        </p>

        <div class="mt-10 mb-8 row justify-center">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            <T id="button" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
