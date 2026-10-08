import { Trans, useLingui } from '@lingui/react/macro';
import {
  createTransactionBodySchema,
  MembersSort,
  type CreateTransactionBody,
  type LightMember,
} from '@sel/shared';
import {
  Alert,
  Button,
  Dialog,
  Fieldset,
  FormField,
  Input,
  ListItem,
  RadioGroup,
  showToast,
  Skeleton,
  Stepper,
} from '@sel/ui';
import { removeDiacriticCharacters } from '@sel/utils';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useController, useForm, type Control, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { api } from 'src/app/api';
import { useConfig } from 'src/app/config';
import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import { Amount } from './amount';
import { ApiFailed } from './api-result';
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
  return (
    <Dialog.Root open={open} onClose={onClose}>
      <Dialog.Content>
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

type Step = 'exchange' | 'details' | 'recap';

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
  const { t } = useLingui();

  const steps: Step[] = direction && counterpart ? ['details', 'recap'] : ['exchange', 'details', 'recap'];

  const [step, setStep] = useState(steps[0]);
  const stepNumber = steps.indexOf(step) + 1;
  const stepCount = steps.length;

  const [values, setValues] = useState<TransactionDetails>({
    direction,
    counterpart,
    description: defaultDescription,
  });

  const stepNames: Record<Step, string> = {
    exchange: t`Exchange`,
    details: t`Details`,
    recap: t`Confirmation`,
  };

  return (
    <>
      <DialogTitle exchange={{ direction, counterpart }} />

      <Stepper
        steps={steps.map((step) => stepNames[step])}
        current={stepNumber}
        progressLabel={t`Step ${stepNumber} of ${stepCount}`}
        className="px-4 md:px-6"
      />

      {step === 'exchange' && (
        <ExchangeStep
          direction={direction}
          counterpart={counterpart}
          defaultValues={values}
          onNext={(values) => {
            setValues((prev) => ({ ...prev, ...values }));
            setStep('details');
          }}
        />
      )}

      {step === 'details' && (
        <DetailsStep
          defaultValues={values}
          onBack={steps[0] === 'exchange' ? () => setStep('exchange') : undefined}
          onNext={(values) => {
            setValues((prev) => ({ ...prev, ...values }));
            setStep('recap');
          }}
        />
      )}

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

function DialogTitle({ exchange }: { exchange: Pick<TransactionDetails, 'direction' | 'counterpart'> }) {
  const { direction, counterpart } = exchange;
  const name = counterpart && formatMemberName(counterpart);

  return (
    <Dialog.Title className="sr-only">
      {direction === 'send' && (
        <Trans>
          Send <Unit plural />
          {name && <Trans> to {name}</Trans>}
        </Trans>
      )}
      {direction === 'request' && (
        <Trans>
          Request <Unit plural />
          {name && <Trans> from {name}</Trans>}
        </Trans>
      )}
      {!direction && <Trans>New exchange</Trans>}
    </Dialog.Title>
  );
}

const focusFirstField = (ref: HTMLElement | null) => {
  ref?.querySelector('input')?.focus();
};

const focusElement = (ref: HTMLElement | null) => {
  ref?.focus();
};

const exchangeSchema = z.object({
  direction: z.enum(['send', 'request']),
  counterpartId: z.string().min(1),
});

type ExchangeValues = z.input<typeof exchangeSchema>;

type ExchangeStepProps = Pick<TransactionDialogProps, 'direction' | 'counterpart'> & {
  defaultValues: TransactionDetails;
  onNext: (values: Pick<TransactionDetails, 'direction' | 'counterpart'>) => void;
};

function ExchangeStep({ direction, counterpart, defaultValues, onNext }: ExchangeStepProps) {
  const { data: me } = useSuspenseQuery(queries.session());

  const form = useForm<ExchangeValues>({
    resolver: useZodResolver(exchangeSchema),
    defaultValues: {
      direction: defaultValues?.direction ?? direction,
      counterpartId: defaultValues?.counterpart?.id ?? counterpart?.id ?? '',
    },
  });

  const membersQuery = useQuery({
    ...queries.listMembers({ sort: MembersSort.firstName }),
    enabled: counterpart === undefined,
  });

  const findMember = (memberId: string) => {
    return counterpart ?? membersQuery.data?.find((member) => member.id === memberId);
  };

  const handleSubmit = form.handleSubmit(({ direction, counterpartId }) => {
    const member = findMember(counterpartId);

    if (member) {
      onNext({ direction, counterpart: member });
    }
  });

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="contents">
      <Dialog.Body ref={focusFirstField} className="stack gap-4">
        {direction === undefined && <DirectionField control={form.control} />}

        {counterpart ? (
          <SelectedMember member={counterpart} />
        ) : (
          <CounterpartField form={form} query={membersQuery} meId={me.id} findMember={findMember} />
        )}
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="submit">
          <Trans>Next</Trans>
        </Button>
        <Dialog.Close>
          <Button variant="secondary">
            <Trans>Cancel</Trans>
          </Button>
        </Dialog.Close>
      </Dialog.Footer>
    </form>
  );
}

function DirectionField({ control }: { control: Control<ExchangeValues> }) {
  const labels = {
    send: (
      <Trans>
        Send <Unit plural />
      </Trans>
    ),
    request: (
      <Trans>
        Request <Unit plural />
      </Trans>
    ),
  };

  return (
    <Controller
      control={control}
      name="direction"
      render={({ field: { value, onChange, ref, ...field }, fieldState }) => (
        <Fieldset.Root invalid={fieldState.invalid}>
          <Fieldset.Legend>
            <Trans>What do you want to do?</Trans>
          </Fieldset.Legend>

          <RadioGroup.Root
            {...field}
            ref={ref}
            value={value ?? null}
            onChange={onChange}
            className="grid gap-2 sm:grid-cols-2"
          >
            <RadioGroup.Item value="send" label={labels.send} />
            <RadioGroup.Item value="request" label={labels.request} />
          </RadioGroup.Root>

          <Fieldset.Error>{fieldState.error?.message}</Fieldset.Error>
        </Fieldset.Root>
      )}
    />
  );
}

type CounterpartFieldProps = {
  form: UseFormReturn<ExchangeValues>;
  query: UseQueryResult<LightMember[]>;
  meId: string;
  findMember: (memberId: string) => LightMember | undefined;
};

function CounterpartField({ form, query, meId, findMember }: CounterpartFieldProps) {
  const { t } = useLingui();
  const { field, fieldState } = useController({ control: form.control, name: 'counterpartId' });
  const { ref, value, onChange } = field;

  const [search, setSearch] = useState('');
  const [changed, setChanged] = useState(false);

  const selected = findMember(value);

  if (selected) {
    return (
      <SelectedMember
        member={selected}
        onChange={() => {
          setSearch('');
          setChanged(true);
          onChange('');
          form.clearErrors('counterpartId');
        }}
      />
    );
  }

  const normalizedSearch = normalize(search.trim());
  const members = query.data
    ?.filter((member) => member.id !== meId)
    .filter((member) => normalize(formatMemberName(member)).includes(normalizedSearch));

  if (query.error && !query.data)
    return (
      <ApiFailed
        title={<Trans>Unable to load the members</Trans>}
        retry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );

  return (
    <FormField label={<Trans>Member</Trans>} error={fieldState.error?.message}>
      <div className="stack gap-2">
        <Input
          ref={ref}
          type="search"
          icon="search"
          placeholder={t`Search a member`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && members && members.length > 0) {
              event.preventDefault();
              onChange(members[0].id);
            }
          }}
          autoFocus={changed}
        />

        {/* A fixed height, so that the dialog does not change size while searching. */}
        <div className="h-40 overflow-y-auto rounded-md border">
          <MembersList members={members} onSelected={(member) => onChange(member.id)} />
        </div>
      </div>
    </FormField>
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

function SelectedMember({ member, onChange }: { member: LightMember; onChange?: () => void }) {
  const { t } = useLingui();

  return (
    <div className="stack gap-2">
      <p className="text-label text-default">
        <Trans>Member</Trans>
      </p>

      <div className="row min-h-16 items-center gap-3 rounded-md border px-4 py-3">
        <MemberAvatar member={member} size="sm" decorative />
        <p className="min-w-0 flex-1 text-body text-default">{formatMemberName(member)}</p>

        {onChange && (
          <Button
            size="sm"
            variant="secondary"
            aria-label={t`Change the member`}
            onClick={onChange}
            autoFocus
          >
            <Trans>Change</Trans>
          </Button>
        )}
      </div>
    </div>
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
      <Dialog.Body ref={focusFirstField} className="stack gap-6">
        <InputField
          control={form.control}
          name="amount"
          label={<Trans>Amount</Trans>}
          inputMode="numeric"
          suffix={currencyPlural}
        />

        <InputField
          control={form.control}
          name="description"
          label={<Trans>Reason</Trans>}
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
  const { data: me } = useSuspenseQuery(queries.session());

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

      showToast(direction === 'send' ? t`The exchange is recorded` : t`The request is sent to ${name}`);
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

          <RecapItem label={<Trans>Reason</Trans>}>{description}</RecapItem>

          {comment !== '' && (
            <RecapItem label={<Trans>Comment</Trans>}>
              <span className="whitespace-pre-line">{comment}</span>
            </RecapItem>
          )}
        </dl>

        <Alert.Root tone="info">
          <Alert.Description>
            {direction === 'send' ? (
              <Trans>{name} does not need to confirm: the exchange is completed right away.</Trans>
            ) : (
              <Trans>{name} needs to confirm to complete the exchange.</Trans>
            )}
          </Alert.Description>
        </Alert.Root>

        {mutation.isError && <ApiFailed title={<Trans>The exchange could not be created</Trans>} />}
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
