import { ClientOnly } from '../../../../app/components/client-only';
import { Member } from '../../aliases';

type MemberMapProps = {
  member: Member;
};

export const MemberMap = ({ member }: MemberMapProps) => (
  <ClientOnly
    load={() => import('../../../../app/components/map')}
    center={member.address.position}
    markers={[member.address.position]}
  />
);
