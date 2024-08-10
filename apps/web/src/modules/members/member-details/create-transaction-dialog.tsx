import { createForm } from '@felte/solid';
import { validateSchema } from '@felte/validator-zod';
import { Member } from '@sel/shared';
import { assert } from '@sel/utils';
import { createEffect, createSignal, Show } from 'solid-js';
import { z } from 'zod';

import { authenticatedMember } from '../../../app-context';
import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { Select } from '../../../components/select';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getLetsConfig } from '../../../utils/lets-config';
import { createErrorMap } from '../../../utils/zod-error-map';

const T = Translate.prefix('members.transactions.create');

const schema = z.object({
  type: z.union([z.literal('send'), z.literal('request')]),
  amount: z.number().min(1).max(1000),
  description: z.string().min(10),
});

export function CreateTransactionDialog(props: { open: boolean; onClose: () => void; member: Member }) {
  const config = getLetsConfig();
  const t = T.useTranslation();

  const [showConfirmation, setShowConfirmation] = createSignal(false);

  const transactionApi = container.resolve(TOKENS.transactionApi);
  const member = authenticatedMember();

  // @ts-expect-error solidjs directive
  const { form, data, setData, errors, reset } = createForm<z.infer<typeof schema>>({
    initialValues: {
      type: 'send',
      amount: null,
      description: '',
    },
    validate: validateSchema(schema, {
      errorMap: createErrorMap(),
    }),
    async onSubmit({ type, amount, description }) {
      assert(member);

      if (!showConfirmation()) {
        setShowConfirmation(true);
      } else {
        const [payer, recipient] = type === 'send' ? [member, props.member] : [props.member, member];

        await transactionApi.createTransaction({
          payerId: payer.id,
          recipientId: recipient.id,
          amount,
          description,
        });
      }
    },
  });

  createEffect(() => {
    if (!open()) {
      setShowConfirmation(false);
      reset();
    }
  });

  return (
    <Dialog
      title={<T id="title" values={{ name: props.member.firstName }} />}
      open={props.open}
      onClose={() => props.onClose()}
      width={1}
    >
      <form use:form class="col gap-4">
        <div class="col gap-4" classList={{ '!hidden': showConfirmation() }}>
          <FormField label={<T id="exchangeTypeLabel" />} error={errors('type')}>
            <Select
              width="full"
              variant="outlined"
              items={['send', 'request'] as const}
              itemToString={(item) => item ?? ''}
              renderItem={(item) => <T id={item} values={{ currency: config()?.currencyPlural }} />}
              selectedItem={() => data('type')}
              onItemSelected={(item) => setData('type', item)}
            />
          </FormField>

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
                name: `${props.member?.firstName} ${props.member?.lastName}`,
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
