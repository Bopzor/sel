import { zodResolver } from '@hookform/resolvers/zod';
import { i18n, type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, Card } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import { api, ApiError } from 'src/app/api';
import { useConfig } from 'src/app/config';
import { nextUrl } from 'src/app/session';
import { InputField } from 'src/components/fields';

export function AuthenticationPage() {
  const config = useConfig();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') ?? undefined;

  const [step, setStep] = useState<{ name: 'email' | 'code'; email?: string }>(
    initialCode === undefined ? { name: 'email' } : { name: 'code' },
  );

  return (
    <main className="row min-h-dvh items-center justify-center bg-page p-4">
      <Card.Root className="w-full max-w-content">
        <Card.Header className="bg-primary pb-5 text-on-primary">
          <div className="row items-center gap-4">
            {/* The name next to it says what the logo shows. */}
            <img src={config.logoUrl} alt="" className="size-logo shrink-0 rounded-md bg-surface" />
            <div className="stack min-w-0">
              <h1 className="text-title-2">{config.letsName}</h1>
              <p className="text-body-sm">{config.place}</p>
            </div>
          </div>
        </Card.Header>

        {step.name === 'email' ? (
          <EmailStep initialEmail={step.email} onSent={(email) => setStep({ name: 'code', email })} />
        ) : (
          <CodeStep
            email={step.email}
            initialCode={initialCode}
            onBack={() => setStep({ name: 'email', email: step.email })}
          />
        )}
      </Card.Root>
    </main>
  );
}

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: () => i18n._(msg`Enter a valid email address, for example my@email.com.`) })),
});

function EmailStep({ initialEmail, onSent }: { initialEmail?: string; onSent: (email: string) => void }) {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const next = searchParams.has('next') ? nextUrl(searchParams) : undefined;

  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: initialEmail ?? '' },
  });

  const request = useMutation({
    mutationFn: async (email: string) => {
      await api('POST', '/authentication/request-authentication-code', { query: { email, next } });
    },
    onSuccess: (_, email) => {
      onSent(email);
    },
    onError: () => {
      setError('email', { message: t`The sign-in code could not be sent. Try again in a few moments.` });
    },
  });

  const submit = handleSubmit(({ email }) => request.mutate(email));

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="contents">
      <Card.Body className="stack gap-6">
        <p>
          <Trans>Enter the email address of your LETS account to access the app.</Trans>
        </p>

        <InputField
          control={control}
          name="email"
          label={<Trans>Email address</Trans>}
          type="email"
          autoComplete="email"
          placeholder={t`my@email.com`}
        />
      </Card.Body>

      <Card.Footer className="justify-end">
        <Button type="submit" loading={request.isPending}>
          <Trans>Sign in</Trans>
        </Button>
      </Card.Footer>
    </form>
  );
}

const codeSchema = z.object({
  code: z
    .string()
    .transform((code) => code.replace(/\s/g, ''))
    .pipe(
      z.string().regex(/^\d{6}$/, {
        error: () => i18n._(msg`Enter the 6 digits of the code received by email.`),
      }),
    ),
});

type CodeStepProps = {
  email?: string;
  initialCode?: string;
  onBack: () => void;
};

function CodeStep({ email, initialCode, onBack }: CodeStepProps) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: initialCode ?? '' },
  });

  const verify = useMutation({
    mutationFn: async (code: string) => {
      await api('GET', '/authentication/verify-authentication-code', { query: { code } });
    },
    onSuccess: async () => {
      await navigate(nextUrl(searchParams), { replace: true });
    },
    onError: (error) => {
      setError('code', { message: t(verificationError(error)) });
    },
  });

  const submit = handleSubmit(({ code }) => verify.mutate(code));

  // The code of the link is verified once: a ref, rather than a state, survives the effects run twice in development.
  const initialCodeVerified = useRef(false);

  useEffect(() => {
    if (initialCode !== undefined && !initialCodeVerified.current) {
      initialCodeVerified.current = true;
      void submit();
    }
  }, [initialCode, submit]);

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="contents">
      <Card.Body className="stack gap-6 pt-2">
        <div className="stack gap-3">
          {email === undefined ? (
            <p>
              <Trans>Enter the sign-in code received by email.</Trans>
            </p>
          ) : (
            <p>
              <Trans>
                If your email address is allowed, an email containing a sign-in code has been sent to{' '}
                <strong>{email}</strong>.
              </Trans>
            </p>
          )}
          <p className="text-body-sm text-muted">
            <Trans>If nothing arrives in the next few minutes, check your spam folder or contact us.</Trans>
          </p>
        </div>

        <InputField
          control={control}
          name="code"
          label={<Trans>Sign-in code</Trans>}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          onChange={(event) => {
            if (codeSchema.safeParse({ code: event.target.value }).success) {
              void submit();
            }
          }}
          className="[&_input]:text-center [&_input]:tracking-[0.5em]"
        />
      </Card.Body>

      <Card.Footer className="justify-end">
        <Button variant="secondary" onClick={onBack}>
          <Trans>Back</Trans>
        </Button>
      </Card.Footer>
    </form>
  );
}

function verificationError(error: Error) {
  const messages: Record<string, MessageDescriptor> = {
    AuthenticationCodeNotFound: msg`This code is not valid. Check that it matches the one in the email.`,
    CodeRevoked: msg`This code has been replaced by a newer one: use the one from the latest email.`,
    CodeExpired: msg`This code has expired. Go back to receive a new one.`,
  };

  if (ApiError.is(error) && error.code && error.code in messages) {
    return messages[error.code];
  }

  return msg`Sign-in failed. Try again in a few moments.`;
}
