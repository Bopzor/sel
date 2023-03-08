import { Member } from './aliases';

export const formatAddress = (address: Member['address']) => {
  return [
    [address.line1, address.line2].filter(Boolean).join('\n'),
    `${address.postalCode} ${address.city}`,
  ].join('\n');
};
