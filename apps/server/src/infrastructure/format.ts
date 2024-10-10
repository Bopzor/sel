import { Member } from 'src/modules/member/member.entities';

export function currencyAmount(amount: number, config: { currency: string; currencyPlural: string }) {
  return `${amount} ${amount === 1 ? config.currency : config.currencyPlural}`;
}
export function memberName(member: Member) {
  return `${member.firstName} ${member.lastName[0]}.`;
}
