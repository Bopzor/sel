import { Member } from '../../members/entities';

import fr from './lang/fr.json';

export interface TranslationPort {
  translate(key: keyof typeof fr, values?: Record<string, string | number>): string;
  emailSubject(key: keyof typeof fr, values?: Record<string, string | number>): string;
  memberName(member: Pick<Member, 'firstName' | 'lastName'>): string;
}
