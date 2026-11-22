import { Trans, useLingui } from '@lingui/react/macro';
import { createTransactionBodySchema, type CreateTransactionBody, type LightMember } from '@sel/shared';
import { Alert, Button, Card, Dialog, FormField, Icon, Input, ListItem, showToast, Skeleton } from '@sel/ui';
import { removeDiacriticCharacters } from '@sel/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { api } from 'src/app/api';
import { useConfig } from 'src/app/config';
import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { useSession } from 'src/app/session';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import { Amount } from './amount';
import { ApiFailed, QueryFailed } from './api-result';
import { InputField, TextAreaField } from './fields';
import { MemberAvatar } from './member-avatar';
import { Unit } from './unit';

export type TransactionDirection = 'send' | 'request';

type TransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  direction?: TransactionDirection;
  counterpart?: LightMember;
  requestId?: string;
  defaultDescription?: string;
};

export function TransactionDialog({
  open,
  onClose,
  direction,
  counterpart,
  requestId,
  defaultDescription,
}: TransactionDialogProps) {
  const { t } = useLingui();

  return (
    <Dialog.Root open={open} onClose={onClose}>
      <Dialog.Content closeLabel={t`Close`}>
        <TransactionFlow
          direction={direction}
          counterpart={counterpart}
          requestId={requestId}
          defaultDescription={defaultDescription}
          onCreated={onClose}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}

const steps = ['direction', 'member', 'details', 'recap'] as const;
type Step = (typeof steps)[number];

type TransactionDetails = Partial<{
  direction: TransactionDirection;
  counterpart: LightMember;
  amount: number;
  description: string;
  comment: string;
}>;

type TransactionFlowProps = {
  direction?: TransactionDirection;
  counterpart?: LightMember;
  requestId?: string;
  defaultDescription?: string;
  onCreated: () => void;
};

function TransactionFlow({
  direction,
  counterpart,
  requestId,
  defaultDescription,
  onCreated,
}: TransactionFlowProps) {
  const flowSteps = steps.filter((step) => {
    if (step === 'direction') return direction === undefined;
    if (step === 'member') return counterpart === undefined;
    return true;
  });

  const [step, setStep] = useState<Step>(flowSteps[0] ?? 'details');
  const previousStep = flowSteps[flowSteps.indexOf(step) - 1];
  const nextStep = flowSteps[flowSteps.indexOf(step) + 1];

  const [values, setValues] = useState<TransactionDetails>({
    direction,
    counterpart,
    description: defaultDescription,
  });

  const onBack = previousStep ? () => setStep(previousStep) : undefined;

  const onNext = (values: TransactionDetails) => {
    setValues((prev) => ({ ...prev, ...values }));

    if (nextStep) {
      setStep(nextStep);
    }
  };

  return (
    <>
      <Dialog.Header>
        <DialogTitle step={step} values={values} counterpart={counterpart} />
      </Dialog.Header>

      {step === 'direction' && <DirectionStep onSelected={(direction) => onNext({ direction })} />}

      {step === 'member' && (
        <MemberStep onBack={onBack} onSelected={(counterpart) => onNext({ counterpart })} />
      )}

      {step === 'details' && <DetailsStep defaultValues={values} onBack={onBack} onNext={onNext} />}

      {step === 'recap' && (
        <RecapStep
          values={values as Required<TransactionDetails>}
          requestId={requestId}
          onBack={() => setStep('details')}
          onCreated={onCreated}
        />
      )}
    </>
  );
}

type DialogTitleProps = {
  step: Step;
  values: TransactionDetails;
  counterpart?: LightMember;
};

function DialogTitle({ step, values, counterpart }: DialogTitleProps) {
  const { t } = useLingui();
  const { currencyPlural: units } = useConfig();
  const name = values.counterpart && formatMemberName(values.counterpart);
  const send = values.direction === 'send';

  const title = () => {
    if (step === 'recap') {
      return t`Confirmation`;
    }

    // The member chosen after this step is not part of its title, when the user comes back to it.
    if (step === 'direction') {
      return counterpart ? t`Exchange ${units} with ${name}` : t`Exchange ${units}`;
    }

    if (step === 'member' || !name) {
      return send ? t`Send ${units}` : t`Request ${units}`;
    }

    return send ? t`Send ${units} to ${name}` : t`Request ${units} from ${name}`;
  };

  return <Dialog.Title>{title()}</Dialog.Title>;
}

const focusFirstInput = (ref: HTMLElement | null) => {
  ref?.querySelector('input')?.focus();
};

const focusFirstButton = (ref: HTMLElement | null) => {
  ref?.querySelector('button')?.focus();
};

const focusElement = (ref: HTMLElement | null) => {
  ref?.focus();
};

function DirectionStep({ onSelected }: { onSelected: (direction: TransactionDirection) => void }) {
  return (
    <>
      <Dialog.Body ref={focusFirstButton} className="stack gap-3">
        <DirectionCard
          label={
            <Trans>
              Send <Unit plural />
            </Trans>
          }
          description={<Trans>The exchange will be completed right away.</Trans>}
          onClick={() => onSelected('send')}
        />

        <DirectionCard
          label={
            <Trans>
              Request <Unit plural />
            </Trans>
          }
          description={<Trans>The member will need to confirm the exchange.</Trans>}
          onClick={() => onSelected('request')}
        />
      </Dialog.Body>

      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="secondary">
            <Trans>Cancel</Trans>
          </Button>
        </Dialog.Close>
      </Dialog.Footer>
    </>
  );
}

type DirectionCardProps = {
  label: React.ReactNode;
  description: React.ReactNode;
  onClick: () => void;
};

function DirectionCard({ label, description, onClick }: DirectionCardProps) {
  const descriptionId = useId();

  return (
    <Card.Root>
      <Card.Header compact>
        <Card.Title>
          <Card.Button aria-describedby={descriptionId} onClick={onClick}>
            {label}
          </Card.Button>
        </Card.Title>

        <Card.Description id={descriptionId}>{description}</Card.Description>

        <Icon name="chevron-right" className="col-start-2 row-span-2 row-start-1 self-center text-muted" />
      </Card.Header>
    </Card.Root>
  );
}

type MemberStepProps = {
  onBack?: () => void;
  onSelected: (member: LightMember) => void;
};

function MemberStep({ onBack, onSelected }: MemberStepProps) {
  const { t } = useLingui();
  const me = useSession();
  const query = useQuery(queries.listMembers());
  const [search, setSearch] = useState('');

  const normalizedSearch = normalize(search.trim());
  const members = query.data
    ?.filter((member) => member.id !== me.id)
    .filter((member) => normalize(formatMemberName(member)).includes(normalizedSearch));

  const content = () => {
    if (query.error && !query.data) {
      return <QueryFailed query={query} title={<Trans>Unable to load members</Trans>} />;
    }

    return (
      <FormField label={<Trans>Member</Trans>}>
        <div className="stack gap-2">
          <Input
            type="search"
            icon="search"
            placeholder={t`Search for a member`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              const [first] = members ?? [];

              if (event.key === 'Enter' && first) {
                event.preventDefault();
                onSelected(first);
              }
            }}
          />

          {/* A fixed height, so that the dialog does not change size while searching. */}
          <div className="h-72 overflow-y-auto rounded-md border">
            <MembersList members={members} onSelected={onSelected} />
          </div>
        </div>
      </FormField>
    );
  };

  return (
    <>
      <Dialog.Body ref={focusFirstInput}>{content()}</Dialog.Body>

      <Dialog.Footer>
        {onBack ? (
          <Button variant="secondary" onClick={onBack}>
            <Trans>Back</Trans>
          </Button>
        ) : (
          <Dialog.Close>
            <Button variant="secondary">
              <Trans>Cancel</Trans>
            </Button>
          </Dialog.Close>
        )}
      </Dialog.Footer>
    </>
  );
}

function normalize(str: string) {
  return removeDiacriticCharacters(str).toLowerCase();
}

type MembersListProps = {
  members?: LightMember[];
  onSelected: (member: LightMember) => void;
};

function MembersList({ members, onSelected }: MembersListProps) {
  const { t } = useLingui();

  if (!members) {
    return <MembersSkeleton />;
  }

  if (members.length === 0) {
    return (
      <p className="row h-full items-center justify-center p-4 text-center text-body-sm text-muted">
        <Trans>No member matches this search</Trans>
      </p>
    );
  }

  return (
    <ul aria-label={t`Members`}>
      {members.map((member) => (
        <ListItem.Root key={member.id} className="min-h-0! py-2!">
          <MemberAvatar member={member} size="sm" decorative />
          <ListItem.Content>
            <ListItem.Title>
              <ListItem.Button onClick={() => onSelected(member)}>{formatMemberName(member)}</ListItem.Button>
            </ListItem.Title>
          </ListItem.Content>
        </ListItem.Root>
      ))}
    </ul>
  );
}

function MembersSkeleton() {
  return (
    <ul aria-busy>
      {[1, 2, 3, 4].map((index) => (
        <ListItem.Root key={index} className="min-h-0! py-2!">
          <Skeleton variant="circle" size="sm" />
          <ListItem.Content>
            <Skeleton className="w-1/2" />
          </ListItem.Content>
        </ListItem.Root>
      ))}
    </ul>
  );
}

const detailsSchema = z.object({
  amount: z.string().trim().min(1).pipe(z.coerce.number<string>().int().min(1).max(1000)),
  description: createTransactionBodySchema.shape.description,
  comment: z.string().trim().max(4096),
});

type DetailsStepProps = {
  defaultValues: TransactionDetails;
  onBack?: () => void;
  onNext: (values: Pick<TransactionDetails, 'amount' | 'description' | 'comment'>) => void;
};

function DetailsStep({ defaultValues, onBack, onNext }: DetailsStepProps) {
  const { currencyPlural } = useConfig();

  const form = useForm({
    resolver: useZodResolver(detailsSchema),
    defaultValues: {
      amount: Number.isFinite(defaultValues.amount) ? String(defaultValues.amount) : '',
      description: defaultValues.description ?? '',
      comment: defaultValues.comment ?? '',
    },
  });

  return (
    <form noValidate onSubmit={(event) => void form.handleSubmit(onNext)(event)} className="contents">
      <Dialog.Body ref={focusFirstInput} className="stack gap-6">
        <InputField
          control={form.control}
          name="amount"
          label={<Trans>Amount</Trans>}
          inputMode="numeric"
          suffix={currencyPlural}
          className="max-w-48"
        />

        <InputField
          control={form.control}
          name="description"
          label={<Trans>Subject</Trans>}
          hint={<Trans>For example: Help with moving</Trans>}
        />

        <TextAreaField
          control={form.control}
          name="comment"
          label={<Trans>Comment (optional)</Trans>}
          rows={2}
        />
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="submit">
          <Trans>Next</Trans>
        </Button>

        {onBack ? (
          <Button variant="secondary" onClick={onBack}>
            <Trans>Back</Trans>
          </Button>
        ) : (
          <Dialog.Close>
            <Button variant="secondary">
              <Trans>Cancel</Trans>
            </Button>
          </Dialog.Close>
        )}
      </Dialog.Footer>
    </form>
  );
}

type RecapStepProps = {
  values: Required<TransactionDetails>;
  requestId?: string;
  onBack: () => void;
  onCreated: () => void;
};

function RecapStep({ values, requestId, onBack, onCreated }: RecapStepProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const me = useSession();

  const { direction, counterpart, amount, description, comment } = values;
  const name = formatMemberName(counterpart);

  const mutation = useMutation({
    mutationFn: () => {
      const body: CreateTransactionBody = {
        payerId: direction === 'send' ? me.id : counterpart.id,
        recipientId: direction === 'send' ? counterpart.id : me.id,
        amount,
        description,
        comment: comment === '' ? undefined : comment,
        requestId,
      };

      return api<string>('POST', '/transactions', { body });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries(queries.session()),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
        requestId !== undefined && queryClient.invalidateQueries(queries.request(requestId)),
      ]);

      showToast(direction === 'send' ? t`Exchange recorded` : t`Request sent to ${name}`);
      onCreated();
    },
  });

  return (
    <>
      <Dialog.Body className="stack gap-6">
        {/* Focused when the step opens, so that a screen reader reads the summary. */}
        <dl
          ref={focusElement}
          tabIndex={-1}
          className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-4 outline-none"
        >
          <RecapItem label={<Trans>Exchange</Trans>}>
            {direction === 'send' ? (
              <Trans>
                Send <Unit plural />
              </Trans>
            ) : (
              <Trans>
                Request <Unit plural />
              </Trans>
            )}
          </RecapItem>

          <RecapItem label={<Trans>Member</Trans>}>
            <span className="row items-center gap-2">
              <MemberAvatar member={counterpart} size="sm" decorative />
              {name}
            </span>
          </RecapItem>

          <RecapItem label={<Trans>Amount</Trans>}>
            <Amount value={amount} />
          </RecapItem>

          <RecapItem label={<Trans>Subject</Trans>}>{description}</RecapItem>

          {comment !== '' && (
            <RecapItem label={<Trans>Comment</Trans>}>
              <span className="whitespace-pre-line">{comment}</span>
            </RecapItem>
          )}
        </dl>

        <Alert.Root tone="info">
          <Alert.Description>
            {direction === 'send' ? (
              <Trans>{name} doesn't need to confirm: the exchange is completed right away.</Trans>
            ) : (
              <Trans>{name} needs to confirm to complete the exchange.</Trans>
            )}
          </Alert.Description>
        </Alert.Root>

        {mutation.isError && <ApiFailed title={<Trans>The exchange couldn't be created</Trans>} />}
      </Dialog.Body>

      <Dialog.Footer>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          {direction === 'send' ? (
            <Trans context="amount">
              Send <Amount value={amount} />
            </Trans>
          ) : (
            <Trans context="amount">
              Request <Amount value={amount} />
            </Trans>
          )}
        </Button>
        <Button variant="secondary" disabled={mutation.isPending} onClick={onBack}>
          <Trans>Back</Trans>
        </Button>
      </Dialog.Footer>
    </>
  );
}

function RecapItem({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-body-sm text-muted">{label}</dt>
      <dd className="min-w-0 text-body text-default">{children}</dd>
    </>
  );
}
