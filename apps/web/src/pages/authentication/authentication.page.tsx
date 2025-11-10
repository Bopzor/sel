import { createForm, getValue, setValue } from '@modular-forms/solid';
import { requestAuthenticationCodeQuerySchema, verifyAuthenticationCodeQuerySchema } from '@sel/shared';
import { useNavigate } from '@solidjs/router';
import { useMutation } from '@tanstack/solid-query';
import { createEffect, Match, onMount, Switch } from 'solid-js';
import { z } from 'zod';

import { api, ApiError } from 'src/application/api';
import { getAppConfig } from 'src/application/config';
import { notify } from 'src/application/notify';
import { useInvalidateApi } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { externalLink } from 'src/components/link';
import { SpinnerFullScreen } from 'src/components/spinner';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';
import { zodForm } from 'src/utils/validation';

const T = createTranslate('pages.authentication');

type RequestFormType = z.infer<typeof requestAuthenticationCodeQuerySchema>;
type VerifyFormType = z.infer<typeof verifyAuthenticationCodeQuerySchema>;

export function AuthenticationPage() {
  const t = T.useTranslate();

  const { contactEmail } = getAppConfig();
  const [code, setCode] = useSearchParam('code');

  const [form, { Form, Field }] = createForm<VerifyFormType>();

  const verifyCode = useVerifyAuthenticationCode(() => setValue(form, 'code', ''));

  const mutation = useMutation(() => ({
    async mutationFn(query: RequestFormType) {
      await api.requestAuthenticationCode({ query });
    },
  }));

  createEffect(() => {
    const code = getValue(form, 'code');

    if (code?.length === 6) {
      verifyCode.mutate(code);
    }
  });

  return (
    <Switch fallback={<AuthenticationForm onSubmit={(data) => mutation.mutateAsync(data)} />}>
      <Match when={code()}>
        {(code) => <VerifyAuthenticationCode code={code()} clearCode={() => setCode(undefined)} />}
      </Match>

      <Match when={mutation.isSuccess}>
        <div class="col">
          <p class="my-4">
            <T id="codeRequested.line1" values={{ email: mutation.variables?.email }} />
          </p>
          <p class="text-sm text-dim">
            <T
              id="codeRequested.line2"
              values={{ link: externalLink(`mailto:${contactEmail}`, { class: 'hover:underline' }) }}
            />
          </p>

          <Form class="my-8 row justify-center">
            <Field name="code">
              {(field, fieldProps) => (
                <Input
                  type="number"
                  value={field.value}
                  variant="outlined"
                  placeholder={t('codePlaceholder')}
                  {...fieldProps}
                  classes={{
                    input:
                      'tracking-[0.5em] text-2xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                  }}
                  disabled={verifyCode.isPending}
                />
              )}
            </Field>
          </Form>

          <Button
            variant="outline"
            class="self-end"
            disabled={verifyCode.isPending}
            onClick={() => mutation.reset()}
          >
            <T id="goBack" />
          </Button>
        </div>
      </Match>
    </Switch>
  );
}

function AuthenticationForm(props: { onSubmit: (data: RequestFormType) => Promise<void> }) {
  const t = T.useTranslate();

  const [form, { Form, Field }] = createForm<RequestFormType>({
    validate: zodForm(requestAuthenticationCodeQuerySchema),
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

function useVerifyAuthenticationCode(clearCode: () => void) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();
  const navigate = useNavigate();

  const mutation = useMutation(() => ({
    async mutationFn(code: string) {
      await api.verifyAuthenticationCode({ query: { code } });
    },
    onSettled() {
      clearCode();
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      navigate(routes.home);
    },
    onError(error) {
      if (!ApiError.is(error)) {
        throw error;
      }

      if (error.body?.code === 'AuthenticationCodeNotFound' || error.body?.code === 'CodeRevoked') {
        notify.error(t('invalidCode'));
      } else if (error.body?.code === 'CodeExpired') {
        notify.error(t('codeExpired'));
      } else {
        reportError(error);
        notify.error(error);
      }
    },
  }));

  return mutation;
}

function VerifyAuthenticationCode(props: { code: string; clearCode: () => void }) {
  const mutation = useVerifyAuthenticationCode(() => props.clearCode());

  onMount(() => {
    mutation.mutate(props.code);
  });

  return <SpinnerFullScreen />;
}
