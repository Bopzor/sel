import { createForm } from '@modular-forms/solid';
import { requestAuthenticationLinkQuerySchema } from '@sel/shared';
import { useNavigate } from '@solidjs/router';
import { useMutation } from '@tanstack/solid-query';
import { Match, onMount, Switch } from 'solid-js';
import { z } from 'zod';

import { api, ApiError } from 'src/application/api';
import { notify } from 'src/application/notify';
import { useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { SpinnerFullScreen } from 'src/components/spinner';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';
import { zodForm } from 'src/utils/validation';

const T = createTranslate('pages.authentication');

type FormType = z.infer<typeof requestAuthenticationLinkQuerySchema>;

export function AuthenticationPage() {
  const [token, setToken] = useSearchParam('auth-token');

  const mutation = useMutation(() => ({
    async mutationFn(query: FormType) {
      await api.requestAuthenticationLink({ query });
    },
  }));

  return (
    <Switch fallback={<AuthenticationForm onSubmit={(data) => mutation.mutateAsync(data)} />}>
      <Match when={token()}>
        {(token) => <VerifyAuthenticationToken token={token()} clearToken={() => setToken(undefined)} />}
      </Match>

      <Match when={mutation.isSuccess}>
        <p class="my-4">
          <T id="linkRequested.line1" values={{ email: mutation.variables?.email }} />
        </p>
        <p class="my-4 text-sm text-dim">
          <T id="linkRequested.line2" />
        </p>
      </Match>
    </Switch>
  );
}

function AuthenticationForm(props: { onSubmit: (data: FormType) => Promise<void> }) {
  const t = T.useTranslate();

  const [form, { Form, Field }] = createForm<FormType>({
    validate: zodForm(requestAuthenticationLinkQuerySchema),
  });

  return (
    <Form class="col gap-4" onSubmit={(data) => props.onSubmit(data)}>
      <p class="py-4">
        <T id="description" />
      </p>

      <Field name="email">
        {(field, props) => (
          <Input
            {...props}
            type="email"
            variant="outlined"
            placeholder={t('email.placeholder')}
            value={field.value}
            error={field.error}
          />
        )}
      </Field>

      <Button type="submit" disabled={!form.dirty} loading={form.submitting} class="self-end">
        <T id="submit" />
      </Button>
    </Form>
  );
}

function VerifyAuthenticationToken(props: { token: string; clearToken: () => void }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();
  const navigate = useNavigate();

  const mutation = useMutation(() => ({
    async mutationFn(token: string) {
      await api.verifyAuthenticationToken({ query: { token } });
    },
    onSettled() {
      props.clearToken();
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      navigate(routes.home);
    },
    onError(error) {
      if (!ApiError.is(error)) {
        throw error;
      }

      if (error.body?.code === 'TokenNotFound' || error.body?.code === 'TokenRevoked') {
        notify.error(t('invalidLink'));
      } else if (error.body?.code === 'TokenExpired') {
        notify.error(t('linkExpired'));
      } else {
        reportError(error);
        notify.error(error);
      }
    },
  }));

  onMount(() => {
    mutation.mutate(props.token);
  });

  return <SpinnerFullScreen />;
}
