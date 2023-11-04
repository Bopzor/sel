import { assert } from '@sel/utils';

export const formatPhoneNumber = (phoneNumber: string) => {
  assert(phoneNumber.length === 10);

  return Array(5)
    .fill(null)
    .map((_, i) => phoneNumber[2 * i] + phoneNumber[2 * i + 1])
    .join(' ');
};
