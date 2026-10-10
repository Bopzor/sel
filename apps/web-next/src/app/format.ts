import type { Address, LightMember } from '@sel/shared';

export function formatMemberName({ firstName, lastName }: Pick<LightMember, 'firstName' | 'lastName'>) {
  return [firstName, lastName].join(' ');
}

export function formatPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/(\d{2})(?=\d)/g, '$1 ');
}

export function formatAddressLines({ line1, line2, postalCode, city }: Address) {
  return [line1, line2, `${postalCode} ${city}`].filter(Boolean);
}

// Plain text: the formatting does not fit in a clamped line. The blocks are separated by a space.
export function formatExcerpt(html: string) {
  const { body } = new DOMParser().parseFromString(html, 'text/html');

  body.querySelectorAll('p, li, br').forEach((element) => element.after(' '));

  return body.textContent.replace(/\s+/g, ' ').trim();
}

export function formatFileSize(bytes: number, locale: string) {
  const kilobytes = Math.max(1, Math.round(bytes / 1000));

  if (kilobytes < 1000) {
    return new Intl.NumberFormat(locale, { style: 'unit', unit: 'kilobyte' }).format(kilobytes);
  }

  return new Intl.NumberFormat(locale, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 }).format(
    bytes / 1000 / 1000,
  );
}
