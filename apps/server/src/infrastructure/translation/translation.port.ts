import { Member } from '../../members/member.entity';

import fr from './lang/fr.json';

export interface TranslationPort {
  translate(key: keyof typeof fr, values?: Record<string, string | number>): string;

  memberName(member: Pick<Member, 'firstName' | 'lastName'>): string;

  notificationTitle<K extends string>(
    key: keyof typeof fr,
    trimmableKey: K,
    values: Record<K, string | number>,
  ): string;
}
