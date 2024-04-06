import { useIntl } from '@cookbook/solid-intl';

export function getMonthName(date: Date, useAbbreviation?: boolean) {
  const intl = useIntl();
  const name = intl.formatDate(date, { month: 'long' });

  if (useAbbreviation) {
    return name[0];
  }

  return name;
}

export function getDayName(date: Date, useAbbreviation?: boolean) {
  const intl = useIntl();
  const name = intl.formatDate(date, { weekday: 'long' });

  if (useAbbreviation) {
    return name[0];
  }

  return name;
}
