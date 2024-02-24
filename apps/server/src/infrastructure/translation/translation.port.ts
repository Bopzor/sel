import { Member } from '../../members/member.entity';

import fr from './lang/fr.json';

export interface TranslationPort {
  translate(key: keyof typeof fr, values?: Record<string, string | number | boolean>): string;

  memberName(member: Pick<Member, 'firstName' | 'lastName'>): string;

  notificationTitle(
    key: keyof typeof fr,
    trimmableKey: string,
    values: Record<string, string | number | boolean>,
  ): string;
}
