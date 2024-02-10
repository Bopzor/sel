import { Address } from '@sel/shared';

type MemberAddressProps = {
  address: Address;
};

export function MemberAddress(props: MemberAddressProps) {
  return <div class="whitespace-pre-wrap">{formatAddress(props.address)}</div>;
}

export const formatAddress = (address: Address) => {
  return [
    [address.line1, address.line2].filter(Boolean).join('\n'),
    `${address.postalCode} ${address.city}`,
  ].join('\n');
};
