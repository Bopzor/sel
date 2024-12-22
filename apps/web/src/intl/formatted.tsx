import { Address } from '@sel/shared';
import { assert, formatDateRelative } from '@sel/utils';
import { Show } from 'solid-js';

import { getLetsConfig } from 'src/application/config';

import { useIntl } from './intl-provider';

export function FormattedDate(
  props: Intl.DateTimeFormatOptions & { date: string | Date | number | undefined },
) {
  const intl = useIntl();

  return <>{intl.formatDate(props.date, props)}</>;
}

export function FormattedRelativeDate(props: { date: string; addSuffix?: boolean }) {
  return <>{formatDateRelative(props.date, props.addSuffix)}</>;
}

export function FormattedPhoneNumber(props: { phoneNumber: string }) {
  return <>{formatPhoneNumber(props.phoneNumber)}</>;
}

export function formatPhoneNumber(phoneNumber: string) {
  assert(phoneNumber.length === 10);

  return Array(5)
    .fill(null)
    .map((_, i) => phoneNumber[2 * i]! + phoneNumber[2 * i + 1]!)
    .join(' ');
}

export function FormattedAddress(props: { address: Address; inline?: boolean }) {
  return <>{props.inline ? formatAddressInline(props.address) : formatAddress(props.address)}</>;
}

export function formatAddress(address: Address) {
  return [
    [address.line1, address.line2].filter(Boolean).join('\n'),
    `${address.postalCode} ${address.city}`,
  ].join('\n');
}

export function formatAddressInline(address: Address) {
  return [address.line1, address.line2, `${address.postalCode} ${address.city}`].filter(Boolean).join(', ');
}

export function FormattedCurrencyAmount(props: { amount: number }) {
  const config = getLetsConfig();

  return (
    <>
      <Show when={Math.abs(props.amount) === 1}>
        {props.amount} {config()?.currency}
      </Show>

      <Show when={Math.abs(props.amount) !== 1}>
        {props.amount} {config()?.currencyPlural}
      </Show>
    </>
  );
}
