import { createAddress, createMember } from '@sel/shared';
import { describe, expect, it } from 'vitest';

import { formatVCard } from './vcard';

describe('formatVCard', () => {
  const claire = createMember({ id: 'claire', firstName: 'Claire', lastName: 'Dubois' });

  it('formats a member with only a name', () => {
    expect(formatVCard(claire)).toEqual(
      ['BEGIN:VCARD', 'VERSION:3.0', 'N:Dubois;Claire;;;', 'FN:Claire Dubois', 'END:VCARD', ''].join('\r\n'),
    );
  });

  it('formats the email address and the phone number', () => {
    const lines = formatVCard({ ...claire, email: 'claire@domain.tld', phoneNumber: '0612345678' }).split(
      '\r\n',
    );

    expect(lines).toContain('EMAIL;TYPE=INTERNET:claire@domain.tld');
    expect(lines).toContain('TEL;TYPE=CELL:0612345678');
  });

  it('formats the address', () => {
    const address = createAddress({
      line1: '1 rue des Lilas',
      postalCode: '74000',
      city: 'Annecy',
      country: 'France',
    });

    expect(formatVCard({ ...claire, address }).split('\r\n')).toContain(
      'ADR;TYPE=HOME:;;1 rue des Lilas;Annecy;;74000;France',
    );
  });

  it('joins the two lines of the street with an escaped line break', () => {
    const address = createAddress({
      line1: '1 rue des Lilas',
      line2: 'Bâtiment A',
      postalCode: '74000',
      city: 'Annecy',
      country: 'France',
    });

    expect(formatVCard({ ...claire, address }).split('\r\n')).toContain(
      'ADR;TYPE=HOME:;;1 rue des Lilas\\nBâtiment A;Annecy;;74000;France',
    );
  });

  it('escapes the special characters of the values', () => {
    const lines = formatVCard({ ...claire, firstName: 'Anne; Marie', lastName: 'Dupont, Jr\\' }).split(
      '\r\n',
    );

    expect(lines).toContain('N:Dupont\\, Jr\\\\;Anne\\; Marie;;;');
    expect(lines).toContain('FN:Anne\\; Marie Dupont\\, Jr\\\\');
  });

  it('escapes the line breaks of the values', () => {
    const address = createAddress({
      line1: '1 rue des Lilas\nAppartement 3',
      postalCode: '74000',
      city: 'Annecy',
    });

    expect(formatVCard({ ...claire, address })).toContain(';;1 rue des Lilas\\nAppartement 3;');
  });
});
