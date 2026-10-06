import { Trans, useLingui } from '@lingui/react/macro';
import { addressSchema, type Address } from '@sel/shared';
import { Button, Dialog } from '@sel/ui';
import { useForm } from 'react-hook-form';

import { useZodResolver } from 'src/hooks/use-zod-resolver';

import { InputField } from './fields';

type AddressFormDialogProps = {
  open: boolean;
  onClose: () => void;
  address?: Address;
  title: React.ReactNode;
  submitLabel: React.ReactNode;
  onSubmit: (address: Address) => void;
};

export function AddressFormDialog({ open, onClose, title, ...props }: AddressFormDialogProps) {
  const { t } = useLingui();

  return (
    <Dialog.Root open={open} onClose={onClose}>
      <Dialog.Content closeLabel={t`Close`}>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        <AddressForm {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

const schema = addressSchema.transform(({ line2, ...address }) => ({
  ...address,
  ...(line2 !== '' && { line2 }),
}));

function AddressForm({
  address,
  submitLabel,
  onSubmit,
}: Pick<AddressFormDialogProps, 'address' | 'submitLabel' | 'onSubmit'>) {
  const form = useForm({
    resolver: useZodResolver(schema),
    defaultValues: {
      line1: '',
      line2: '',
      postalCode: '',
      city: '',
      country: 'France',
      ...address,
    },
  });

  const handleSubmit = (event: React.SubmitEvent) => {
    event.stopPropagation();
    void form.handleSubmit(onSubmit)(event);
  };

  // An address changed by hand is no longer at the position found by the search.
  const clearPosition = () => {
    form.setValue('position', undefined);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="contents">
      <Dialog.Body className="stack gap-4">
        <InputField
          control={form.control}
          name="line1"
          label={<Trans>Number and street</Trans>}
          autoComplete="address-line1"
          onChange={clearPosition}
          autoFocus
        />

        <InputField
          control={form.control}
          name="line2"
          label={<Trans>Address complement (optional)</Trans>}
          autoComplete="address-line2"
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <InputField
            control={form.control}
            name="postalCode"
            label={<Trans>Postal code</Trans>}
            autoComplete="postal-code"
            inputMode="numeric"
            onChange={clearPosition}
          />

          <div className="sm:col-span-2">
            <InputField
              control={form.control}
              name="city"
              label={<Trans>City</Trans>}
              autoComplete="address-level2"
              onChange={clearPosition}
            />
          </div>
        </div>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="submit">{submitLabel}</Button>
        <Dialog.Close>
          <Button variant="ghost">
            <Trans>Cancel</Trans>
          </Button>
        </Dialog.Close>
      </Dialog.Footer>
    </form>
  );
}
