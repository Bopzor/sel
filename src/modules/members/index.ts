import { Member } from './entities/member.entity';

export type { GetMemberResult as Member } from './use-cases/get-member/get-member-result';

export const transformMember = (member: Member) => ({
  id: member.id,
  email: member.email,
  firstName: member.firstName,
  lastName: member.lastName,
  fullName: member.fullName,
  phoneNumber: member.phoneNumber,
  address: {
    line1: member.address.line1,
    line2: member.address.line2,
    postalCode: member.address.postalCode,
    city: member.address.city,
    country: member.address.country,
    position: member.address.position,
  },
});
