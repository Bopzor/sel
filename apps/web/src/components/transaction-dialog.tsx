import { useListCollection } from '@ark-ui/solid';
import { Combobox as ArkCombobox } from '@ark-ui/solid/combobox';
import { Field, FormStore, createForm, getValue, reset, setValue } from '@modular-forms/solid';
import { CreateTransactionBody, Member, MembersSort } from '@sel/shared';
import { assert, hasProperty, not, removeDiacriticCharacters } from '@sel/utils';
import { useMutation, useQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { check } from 'solid-heroicons/solid';
import { Show, createEffect, createSignal } from 'solid-js';
import { z } from 'zod';

import { getLetsConfig } from 'src/application/config';
import { notify } from 'src/application/notify';
import { apiQuery, getAuthenticatedMember } from 'src/application/query';
import { createTranslate } from 'src/intl/translate';
import { zodForm } from 'src/utils/validation';

import { Button } from './button';
import { Combobox } from './combobox';
import { Dialog, DialogFooter, DialogHeader } from './dialog';
import { Input } from './input';
import { MemberAvatarName } from './member-avatar-name';
import { Select } from './select';

const T = createTranslate('components.transactionDialog');

const schema = z.object({
  type: z.union([z.literal('send'), z.literal('request')]),
  memberId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(10).max(80),
});

type FormType = z.infer<typeof schema>;

export function TransactionDialog(props: {
  open: boolean;
  onClose: () => void;
  onCreate: (body: CreateTransactionBody) => Promise<unknown>;
  onCreated?: () => void | Promise<unknown>;
  initialValues?: Partial<FormType>;
}) {
  const t = T.useTranslate();
  const authenticatedMember = getAuthenticatedMember();

  const createTransaction = useMutation(() => ({
    async mutationFn(data: FormType) {
      const [payer, recipient] =
        data.type === 'send' ? [authenticatedMember(), member()] : [member(), authenticatedMember()];

      assert(payer);
      assert(recipient);

      await props.onCreate({
        amount: data.amount,
        description: data.description,
        payerId: payer.id,
        recipientId: recipient.id,
      });

      return payer;
    },
    async onSuccess(payer, { type }) {
      await props.onCreated?.();
      props.onClose();

      if (type === 'send') {
        notify.success(t('sent'));
      } else {
        notify.success(t('requested', { payer: payer.firstName }));
      }
    },
  }));

  const [form, { Form }] = createForm<FormType>({
    initialValues: {
      type: 'send',
      ...props.initialValues,
    },
    validate: zodForm(schema),
  });

  const [showConfirmation, setShowConfirmation] = createSignal(false);

  const membersQuery = useQuery(() =>
    apiQuery('listMembers', {
      query: { sort: MembersSort.firstName },
    }),
  );

  const member = () => membersQuery.data?.find(hasProperty('id', getValue(form, 'memberId') ?? ''));

  createEffect(() => {
    if (props.open === false) {
      reset(form);
      setShowConfirmation(false);
    }
  });

  return (
    <Dialog open={props.open} onClose={() => props.onClose()} class="max-w-xl">
      <DialogHeader
        title={<T id="title" values={{ name: member()?.firstName }} />}
        onClose={() => props.onClose()}
      />

      <Form
        onSubmit={(data) => {
          if (!showConfirmation()) {
            setShowConfirmation(true);
          } else {
            return createTransaction.mutateAsync(data);
          }
        }}
      >
        <div class={clsx('col gap-4', { 'hidden!': showConfirmation() })}>
          <Fields
            form={form}
            typeReadOnly={props.initialValues?.type !== undefined}
            showMemberSelector={props.initialValues?.memberId === undefined}
            members={membersQuery.data ?? []}
          />
        </div>

        <div class={clsx({ 'hidden!': !showConfirmation() })}>
          <Confirmation
            form={form}
            members={membersQuery.data ?? []}
            onBack={() => setShowConfirmation(false)}
            loading={form.submitting}
          />
        </div>
      </Form>
    </Dialog>
  );
}

export function filteredMemberList(members: Member[], search: string) {
  return members.filter((member) =>
    [member.firstName, member.lastName]
      .map(removeDiacriticCharacters)
      .some((value) => value.toLowerCase().includes(removeDiacriticCharacters(search.toLowerCase()))),
  );
}

function Fields(props: {
  form: FormStore<FormType>;
  typeReadOnly: boolean;
  showMemberSelector: boolean;
  members: Member[];
}) {
  const t = T.useTranslate();
  const config = getLetsConfig();

  const authenticatedMember = getAuthenticatedMember();
  const [memberSearch, setMemberSearch] = createSignal('');

  const membersList = () => {
    return filteredMemberList(props.members, memberSearch()).filter(
      not(hasProperty('id', authenticatedMember().id)),
    );
  };

  const { collection, set } = useListCollection<Member>({
    initialItems: [],
    itemToString: (member) => (member ? [member.firstName, member.lastName].join(' ') : ''),
    itemToValue: (member) => member.id,
  });

  createEffect(() => {
    set(membersList());
  });

  return (
    <>
      <Field of={props.form} name="type">
        {(field, fieldProps) => (
          <Select
            ref={fieldProps.ref}
            error={field.error}
            variant="outlined"
            label={<T id="type.label" />}
            readOnly={props.typeReadOnly}
            helperText={props.typeReadOnly && t('type.readOnly')}
            items={['send', 'request'] as const}
            itemToString={(item) => item ?? ''}
            renderItem={(item) => item && <T id={`type.${item}`} />}
            selectedItem={() => field.value}
            onItemSelected={(item) => item && setValue(props.form, 'type', item)}
          />
        )}
      </Field>

      <Field of={props.form} name="memberId">
        {(field, fieldProps) => (
          <Show when={props.showMemberSelector}>
            <Combobox
              collection={collection()}
              name={fieldProps.name}
              autofocus={fieldProps.autofocus}
              // todo
              // error={field.error}
              variant="outlined"
              label={<T id="member.label" />}
              placeholder={t('member.placeholder')}
              renderItem={(member) => (
                <ArkCombobox.Item
                  item={member}
                  class="row cursor-pointer items-center gap-2 rounded-sm px-2 py-1 hover:bg-primary hover:text-body"
                >
                  <MemberAvatarName link={false} member={member} />
                  <ArkCombobox.ItemIndicator class="ms-auto">
                    <Icon path={check} class="size-4" />
                  </ArkCombobox.ItemIndicator>
                </ArkCombobox.Item>
              )}
              value={field.value}
              onChange={(member) => setValue(props.form, 'memberId', member!.id)}
              onInputValueChange={setMemberSearch}
              onClear={() => reset(props.form, 'memberId')}
            />
          </Show>
        )}
      </Field>

      <Field of={props.form} name="description">
        {(field, props) => (
          <Input
            {...props}
            value={field.value}
            error={field.error}
            variant="outlined"
            label={<T id="description.label" />}
            placeholder={t('description.placeholder')}
          />
        )}
      </Field>

      <Field of={props.form} name="amount" type="number">
        {(field, props) => (
          <Input
            {...props}
            value={field.value}
            error={field.error}
            type="number"
            variant="outlined"
            label={<T id="amount.label" values={{ currency: config()?.currencyPlural }} />}
            placeholder={t('amount.placeholder')}
            classes={{ field: 'max-w-32' }}
          />
        )}
      </Field>

      <DialogFooter>
        <Button type="submit">
          <T id="next" />
        </Button>
      </DialogFooter>
    </>
  );
}

function Confirmation(props: {
  form: FormStore<FormType>;
  members: Member[];
  onBack: () => void;
  loading: boolean;
}) {
  const member = () => props.members.find(hasProperty('id', getValue(props.form, 'memberId') ?? ''));

  return (
    <Show when={getValue(props.form, 'type')}>
      {(type) => (
        <>
          <p>
            <T
              id={`confirmation.${type()}.line1`}
              values={{
                amount: getValue(props.form, 'amount'),
                name: [member()?.firstName, member()?.lastName].join(' '),
              }}
            />
          </p>

          <p class="mt-2 text-sm text-dim">
            <T id={`confirmation.${type()}.line2`} />
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => props.onBack()}>
              <T id="back" />
            </Button>

            <Button type="submit" loading={props.loading}>
              <T id="submit" />
            </Button>
          </DialogFooter>
        </>
      )}
    </Show>
  );
}
