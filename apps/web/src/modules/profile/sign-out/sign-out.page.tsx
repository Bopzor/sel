import { useNavigate } from '@solidjs/router';
import { createMutation } from '@tanstack/solid-query';

import { Button } from '../../../components/button';
import { useInvalidateApi } from '../../../infrastructure/api';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';

const T = Translate.prefix('profile.signOut');

export default function SignOutPage() {
  const api = container.resolve(TOKENS.api);
  const invalidate = useInvalidateApi();
  const navigate = useNavigate();

  const mutation = createMutation(() => ({
    mutationFn: () => api.signOut({}),
    async onSuccess() {
      await invalidate(['getAuthenticatedMember']);
      navigate(routes.home);
    },
  }));

  return (
    <div class="col card mx-auto my-6 w-full max-w-2xl items-center gap-6 px-6 py-12">
      <p>
        <T id="description" />
      </p>

      <Button onClick={() => mutation.mutate()} loading={mutation.isPending} class="self-center">
        <T id="button" />
      </Button>
    </div>
  );
}
