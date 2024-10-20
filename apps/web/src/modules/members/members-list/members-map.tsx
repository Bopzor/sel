import { Member } from '@sel/shared';
import { defined } from '@sel/utils';

import { FormattedAddress } from '../../../components/formatted-address';
import { Link } from '../../../components/link';
import { Map } from '../../../components/map';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { routes } from '../../../routes';

type MemberMapProps = {
  members: Member[];
  openPopupMember?: Member;
};

export function MembersMap(props: MemberMapProps) {
  const membersWithAddress = () => {
    return props.members.filter((member) => member.address?.position);
  };

  const markers = () => {
    return membersWithAddress().map((member) => ({
      position: defined(member.address?.position),
      isPopupOpen: member === props.openPopupMember,
      render: () => <Popup member={member} />,
    }));
  };

  return (
    <div class="max-h-md grow">
      <Map center={props.openPopupMember?.address?.position} markers={markers()} />
    </div>
  );
}

type PopupProps = {
  member: Member;
};

function Popup(props: PopupProps) {
  return (
    <Link unstyled href={routes.members.member(props.member.id)} class="col min-w-48 gap-2 outline-none">
      <div class="row items-center gap-2 text-base font-medium">
        <MemberAvatarName member={props.member} />
      </div>

      <hr />

      <FormattedAddress address={defined(props.member.address)} />
    </Link>
  );
}
