import { useNavigate } from '@solidjs/router';

import { getAppActions } from '../../../app-context';
import { Button } from '../../../components/button';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';
import { createAsyncCall } from '../../../utils/async-call';

const T = Translate.prefix('profile.signOut');

export default function SignOutPage() {
  const sessionApi = container.resolve(TOKENS.sessionApi);
  const { refreshAuthenticatedMember } = getAppActions();
  const navigate = useNavigate();

  const [signOut, pending] = createAsyncCall(sessionApi.signOut.bind(sessionApi), {
    onSuccess() {
      refreshAuthenticatedMember();
      navigate(routes.home);
    },
  });

  return (
    <div class="col card mx-auto my-6 w-full max-w-2xl items-center gap-6 px-6 py-12">
      <p>
        <T id="description" />
      </p>

      <Button onClick={() => signOut()} loading={pending()} class="self-center">
        <T id="button" />
      </Button>
    </div>
  );
}
