import { createForm } from '@felte/solid';
import { createQuery } from '@tanstack/solid-query';
import { JSX, Show, createSignal } from 'solid-js';

import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { ApiError, useInvalidateApi } from '../../infrastructure/api';
import { container } from '../../infrastructure/container';
import { useSearchParam } from '../../infrastructure/router/use-search-param';
import { Translate } from '../../intl/translate';
import { Header } from '../../layout/header';
import { TOKENS } from '../../tokens';
import { createErrorHandler } from '../../utils/create-error-handler';
import { notify } from '../../utils/notify';

const T = Translate.prefix('authentication');

export default function AuthenticationPage() {
  const [linkRequested, setLinkRequested] = createSignal<string>();

  const verifyAuthenticationTokenQuery = verifyAuthenticationToken();

  return (
    <div class="col flex-1 items-center justify-center px-4">
      <div class="w-full max-w-2xl overflow-hidden rounded-lg bg-neutral">
        <Header />

        <div class="col gap-4 p-4">
          <Show when={linkRequested()} fallback={<AuthenticationForm onSubmitted={setLinkRequested} />}>
            {(email) => <AuthenticationLinkRequested email={email()} />}
          </Show>
        </div>

        {/* trigger suspense */}
        {verifyAuthenticationTokenQuery.data}
      </div>
    </div>
  );
}

function verifyAuthenticationToken() {
  const api = container.resolve(TOKENS.api);
  const t = T.useTranslation();
  const [token, setToken] = useSearchParam('auth-token');
  const invalidate = useInvalidateApi();

  return createQuery(() => ({
    queryKey: ['verifyAuthenticationToken'],
    enabled: token() !== undefined,
    async queryFn() {
      try {
        await api.verifyAuthenticationToken({ query: { token: token()! } });
        await invalidate(['getAuthenticatedMember']);
        setToken(undefined);

        return null;
      } catch (error) {
        if (!ApiError.is(error)) {
          throw error;
        }

        if (error.body?.code === 'TokenNotFound' || error.body?.code === 'TokenRevoked') {
          notify.error(t('invalidAuthenticationLink'));
        } else if (error.body?.code === 'TokenExpired') {
          notify.error(t('authenticationLinkExpired'));
        } else {
          throw error;
        }

        return null;
      }
    },
  }));
}

function AuthenticationForm(props: { onSubmitted: (email: string) => void }) {
  const api = container.resolve(TOKENS.api);
  const t = T.useTranslation();

  // @ts-expect-error solidjs directive
  const { form, data, isSubmitting } = createForm({
    initialValues: {
      email: '',
    },
    async onSubmit(values) {
      await api.requestAuthenticationLink({ query: { email: values.email } });
    },
    onSuccess() {
      props.onSubmitted(data((data) => data.email));
    },
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col gap-4">
      <p class="my-4">
        <T id="description" />
      </p>

      <Input autofocus name="email" type="email" variant="outlined" placeholder={t('emailAddress')} />

      <Button type="submit" loading={isSubmitting()} class="self-end">
        <T id="send" />
      </Button>
    </form>
  );
}

function AuthenticationLinkRequested(props: { email: string }) {
  return (
    <p class="my-4">
      <T id="authenticationLinkRequested" values={{ email: props.email, strong }} />
    </p>
  );
}

const strong = (children: JSX.Element) => {
  return <strong>{children}</strong>;
};
