import type { Member } from '@sel/shared';

import { formatMemberName } from 'src/app/format';

// vCard 3.0 (RFC 2426), with only the fields the member made visible.
export function formatVCard(member: Member) {
  const { firstName, lastName, email, phoneNumber, address } = member;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escape(lastName)};${escape(firstName)};;;`,
    `FN:${escape(formatMemberName(member))}`,
    email !== undefined && `EMAIL;TYPE=INTERNET:${escape(email)}`,
    phoneNumber !== undefined && `TEL;TYPE=CELL:${escape(phoneNumber)}`,
    address !== undefined &&
      `ADR;TYPE=HOME:;;${[address.line1, address.line2 ?? ''].filter(Boolean).map(escape).join('\\n')};${escape(address.city)};;${escape(address.postalCode)};${escape(address.country)}`,
    'END:VCARD',
  ];

  return lines.filter((line) => line !== false).join('\r\n') + '\r\n';
}

function escape(value: string) {
  return value.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n');
}

export function downloadVCard(member: Member) {
  const blob = new Blob([formatVCard(member)], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${formatMemberName(member)}.vcf`;
  link.click();

  URL.revokeObjectURL(url);
}
