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
