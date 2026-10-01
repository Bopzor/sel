import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import { api, ApiError } from '../api';
import { InputField } from '../components/fields';
import { instance } from '../instance';
import { nextUrl } from '../session';
import { t } from '../translations';

export function AuthenticationPage() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') ?? undefined;

  const [step, setStep] = useState<{ name: 'email' | 'code'; email?: string }>(
    initialCode === undefined ? { name: 'email' } : { name: 'code' },
  );

  return (
    <main className="row min-h-dvh items-center justify-center bg-page p-4">
      <Card className="w-full max-w-content">
        <CardHeader className="bg-primary pb-5 text-on-primary">
          <div className="row items-center gap-4">
            {/* The name next to it says what the logo shows. */}
            <img src={instance.logo} alt="" className="size-12 shrink-0 rounded-md bg-surface" />
            <div className="stack min-w-0">
              <h1 className="text-title-2">{instance.name}</h1>
              <p className="text-body-sm">{instance.place}</p>
            </div>
          </div>
        </CardHeader>

        {step.name === 'email' ? (
          <EmailStep initialEmail={step.email} onSent={(email) => setStep({ name: 'code', email })} />
        ) : (
          <CodeStep
            email={step.email}
            initialCode={initialCode}
            onBack={() => setStep({ name: 'email', email: step.email })}
          />
        )}
      </Card>
    </main>
  );
}

const emailSchema = z.object({
  email: z.string().trim().pipe(z.email(t.authentication.email.invalid)),
});

function EmailStep({ initialEmail, onSent }: { initialEmail?: string; onSent: (email: string) => void }) {
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
      setError('email', { message: t.authentication.email.failed });
    },
  });

  const submit = handleSubmit(({ email }) => request.mutate(email));

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="contents">
      <CardBody className="stack gap-6">
        <p>{t.authentication.email.instructions}</p>

        <InputField
          control={control}
          name="email"
          label={t.authentication.email.label}
          type="email"
          autoComplete="email"
          placeholder={t.authentication.email.placeholder}
        />
      </CardBody>

      <CardFooter className="justify-end">
        <Button type="submit" loading={request.isPending}>
          {t.authentication.email.submit}
        </Button>
      </CardFooter>
    </form>
  );
}

const codeSchema = z.object({
  code: z
    .string()
    .transform((code) => code.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{6}$/, t.authentication.code.invalid)),
});

type CodeStepProps = {
  email?: string;
  initialCode?: string;
  onBack: () => void;
};

function CodeStep({ email, initialCode, onBack }: CodeStepProps) {
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
      setError('code', { message: verificationError(error) });
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
      <CardBody className="stack gap-6 pt-2">
        <div className="stack gap-3">
          {email === undefined ? (
            <p>{t.authentication.code.instructions}</p>
          ) : (
            <p>
              {t.authentication.code.sent} <strong>{email}</strong>.
            </p>
          )}
          <p className="text-body-sm text-muted">{t.authentication.code.notReceived}</p>
        </div>

        <InputField
          control={control}
          name="code"
          label={t.authentication.code.label}
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
      </CardBody>

      <CardFooter className="justify-end">
        <Button variant="secondary" onClick={onBack}>
          {t.authentication.code.back}
        </Button>
      </CardFooter>
    </form>
  );
}

function verificationError(error: Error) {
  const messages: Record<string, string> = {
    AuthenticationCodeNotFound: t.authentication.code.notFound,
    CodeRevoked: t.authentication.code.revoked,
    CodeExpired: t.authentication.code.expired,
  };

  if (ApiError.is(error) && error.code && error.code in messages) {
    return messages[error.code];
  }

  return t.authentication.code.failed;
}
