import { createForm } from '@felte/solid';
import { validateSchema } from '@nilscox/felte-validator-zod';
import { CreateTransactionBody, LightMember, Member } from '@sel/shared';
import { assert, defined, hasProperty, not } from '@sel/utils';
import { createEffect, createResource, createSignal, Show } from 'solid-js';
import { z } from 'zod';

import { Autocomplete } from '../../components/autocomplete';
import { Button } from '../../components/button';
import { Dialog, DialogHeader } from '../../components/dialog';
import { FormField } from '../../components/form-field';
import { Input } from '../../components/input';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { Select } from '../../components/select';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { TOKENS } from '../../tokens';
import { getAuthenticatedMember } from '../../utils/authenticated-member';
import { createErrorHandler } from '../../utils/create-error-handler';
import { getLetsConfig } from '../../utils/lets-config';
import { notify } from '../../utils/notify';
import { createErrorMap } from '../../utils/zod-error-map';
import { filteredMemberList } from '../members/filter-member-list';
import { fullName } from '../members/full-name';

const T = Translate.prefix('members.transactions.create');

const schema = z.object({
  type: z.union([z.literal('send'), z.literal('request')]),
  memberId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(10).max(80),
});

export function CreateTransactionDialog(props: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  createTransaction: (values: CreateTransactionBody) => Promise<unknown>;
  member?: LightMember;
  type?: 'send' | 'request';
  initialDescription?: string;
}) {
  const config = getLetsConfig();
  const authenticatedMember = getAuthenticatedMember();
  const t = T.useTranslation();

  const [showConfirmation, setShowConfirmation] = createSignal(false);

  // @ts-expect-error solidjs directive
  const { form, data, setData, errors, reset } = createForm<z.infer<typeof schema>>({
    initialValues: {
      type: props.type ?? 'send',
      memberId: props.member?.id ?? null,
      amount: null,
      description: props.initialDescription ?? '',
    },
    validate: validateSchema(schema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit({ type, amount, description }) {
      const currentMember = defined(authenticatedMember());

      if (!showConfirmation()) {
        setShowConfirmation(true);
        return false;
      } else {
        const [payer, recipient] = type === 'send' ? [currentMember, member()] : [member(), currentMember];

        assert(payer);
        assert(recipient);

        await props.createTransaction({
          payerId: payer.id,
          recipientId: recipient.id,
          amount,
          description,
        });

        return true;
      }
    },
    onSuccess(created) {
      if (!created) {
        return;
      }

      if (data('type') === 'request') {
        notify.success(t('requested', { payer: fullName(defined(member())) }));
      } else {
        notify.success(t('created'));
      }

      props.onClose();
      props.onCreated();
    },
    onError: createErrorHandler(),
  });

  const [memberSearch, setMemberSearch] = createSignal('');

  const membersApi = container.resolve(TOKENS.memberApi);
  const [members] = createResource(() => membersApi.listMembers());

  const member = () => members()?.find(hasProperty('id', data('memberId')));

  const membersList = () => {
    return filteredMemberList(members() ?? [], memberSearch())
      .filter(not(hasProperty('id', defined(authenticatedMember()).id)))
      .slice(0, 6);
  };

  createEffect(() => {
    if (!props.open) {
      setShowConfirmation(false);
      reset();
    }
  });

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} width={1}>
      <DialogHeader
        title={<T id="title" values={{ name: member()?.firstName }} />}
        onClose={() => props.onClose()}
      />

      <form use:form class="col gap-4">
        <div class="col gap-4" classList={{ '!hidden': showConfirmation() }}>
          <FormField
            label={<T id="transactionTypeLabel" />}
            error={errors('type')}
            helperText={props.type !== undefined && <T id="transactionTypeReadOnly" />}
          >
            <Select
              width="full"
              variant="outlined"
              readOnly={props.type !== undefined}
              items={['send', 'request'] as const}
              itemToString={(item) => item ?? ''}
              renderItem={(item) => <T id={item} values={{ currency: config()?.currencyPlural }} />}
              selectedItem={() => data('type')}
              onItemSelected={(item) => setData('type', item)}
            />
          </FormField>

          <Show when={!props.member}>
            <FormField label={<T id="memberLabel" />} error={errors('memberId')}>
              <Autocomplete<Member>
                width="full"
                variant="outlined"
                placeholder={t('memberPlaceholder')}
                items={membersList}
                itemToString={(member) => (member ? fullName(member) : '')}
                renderItem={(member) => (
                  <div class="row items-center gap-2">
                    <MemberAvatarName member={member} />
                  </div>
                )}
                selectedItem={() => member() ?? null}
                onItemSelected={(member) => setData('memberId', member.id)}
                onSearch={(value) => setMemberSearch(value)}
              />
            </FormField>
          </Show>

          <FormField label={<T id="descriptionLabel" />} error={errors('description')}>
            <Input
              name="description"
              type="text"
              variant="outlined"
              placeholder={t('descriptionPlaceholder')}
              min={1}
              max={1000}
            />
          </FormField>

          <FormField
            label={<T id="amountLabel" values={{ currency: config()?.currencyPlural }} />}
            error={errors('amount')}
          >
            <Input
              name="amount"
              type="number"
              variant="outlined"
              placeholder={t('amountPlaceholder')}
              min={1}
              max={1000}
              class="max-w-32"
            />
          </FormField>
        </div>

        <div class="row justify-end gap-4" classList={{ '!hidden': showConfirmation() }}>
          <Button type="submit" disabled={Object.values(errors()).some((value) => value !== null)}>
            <T id="next" />
          </Button>
        </div>

        <Show when={showConfirmation()}>
          <p>
            <T
              id={data('type') === 'send' ? 'confirmSend' : 'confirmRequest'}
              values={{
                amount: data('amount'),
                currency: config()?.currency,
                currencyPlural: config()?.currencyPlural,
                name: fullName(defined(member())),
                strong: (children) => <strong>{children}</strong>,
                br: <br />,
              }}
            />
          </p>

          <div class="row justify-end gap-4">
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
              <Translate id="common.back" />
            </Button>

            <Button type="submit">
              <T id="submit" />
            </Button>
          </div>
        </Show>
      </form>
    </Dialog>
  );
}
