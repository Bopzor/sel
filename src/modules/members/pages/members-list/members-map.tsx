import { ClientOnly } from '../../../../app/components/client-only';
import { Members } from '../../aliases';
import { MemberAvatarName } from '../../components/member-avatar-name';
import { formatAddress } from '../../format-address';

type MembersMapProps = {
  members: Members;
  popupOpen?: string;
};

export const MembersMap = ({ members, popupOpen }: MembersMapProps) => (
  <ClientOnly
    load={() => import('../../../../app/components/map')}
    center={[43.836, 5.042]}
    markers={members.map((member) => ({
      key: member.id,
      position: member.address.position,
      popup: (
        <div className="col min-w-[12rem] gap-0.5">
          <MemberAvatarName member={member} inline size="small" />
          <hr />
          <div className="whitespace-pre-wrap">{formatAddress(member.address)}</div>
        </div>
      ),
      open: member.id === popupOpen,
    }))}
  />
);
