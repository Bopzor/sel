import { ClientOnly } from '../../../../app/components/client-only';
import { Members } from '../../aliases';

type MembersMapProps = {
  members: Members;
};

export const MembersMap = ({ members }: MembersMapProps) => (
  <ClientOnly
    load={() => import('../../../../app/components/map')}
    center={[43.836, 5.042]}
    markers={members.map((member) => member.address.position)}
  />
);
