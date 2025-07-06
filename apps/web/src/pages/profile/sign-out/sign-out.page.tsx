import { useNavigate } from '@solidjs/router';
import { createMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Button } from 'src/components/button';
import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.profile.signOut');

export function SignOutPage() {
  const invalidate = useInvalidateApi();
  const navigate = useNavigate();

  const mutation = createMutation(() => ({
    async mutationFn() {
      await api.signOut({});
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      navigate(routes.home);
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
