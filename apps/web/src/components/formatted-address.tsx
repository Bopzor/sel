import { Address } from '@sel/shared';

type FormattedAddressProps = {
  address: Address;
  inline?: boolean;
};

export function FormattedAddress(props: FormattedAddressProps) {
  const address = () => {
    if (props.inline) {
      return formatAddressInline(props.address);
    }

    return formatAddress(props.address);
  };

  return <div class="whitespace-pre-wrap">{address()}</div>;
}

export const formatAddress = (address: Address) => {
  return [
    [address.line1, address.line2].filter(Boolean).join('\n'),
    `${address.postalCode} ${address.city}`,
  ].join('\n');
};

export function formatAddressInline(address: Address) {
  return [address.line1, address.line2, `${address.postalCode} ${address.city}`].filter(Boolean).join(', ');
}
