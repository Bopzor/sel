import { Address } from '@sel/shared';

type FormattedAddressProps = {
  address: Address;
};

export function FormattedAddress(props: FormattedAddressProps) {
  return <div class="whitespace-pre-wrap">{formatAddress(props.address)}</div>;
}

export const formatAddress = (address: Address) => {
  return [
    [address.line1, address.line2].filter(Boolean).join('\n'),
    `${address.postalCode} ${address.city}`,
  ].join('\n');
};
