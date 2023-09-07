import { Address } from '@sel/shared';
import { Component } from 'solid-js';

type MemberAddressProps = {
  address: Address;
};

export const MemberAddress: Component<MemberAddressProps> = (props) => {
  return <div class="whitespace-pre-wrap">{formatAddress(props.address)}</div>;
};

export const formatAddress = (address: Address) => {
  return [
    [address.line1, address.line2].filter(Boolean).join('\n'),
    `${address.postalCode} ${address.city}`,
  ].join('\n');
};
