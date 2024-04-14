import { Member } from '../../members/member.entity';

import fr from './lang/fr.json';

export type Values = Record<string, string | number | boolean | ((children: string[]) => string)>;

export interface TranslationPort {
  translate(key: keyof typeof fr, values?: Values): string;

  link(target: string): (children: string[]) => string;

  memberName(member: Pick<Member, 'firstName' | 'lastName'>): string;

  notificationTitle(
    key: keyof typeof fr,
    trimmableKey: string,
    values: Record<string, string | number | boolean>,
  ): string;
}
