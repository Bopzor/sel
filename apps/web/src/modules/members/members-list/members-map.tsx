import { Member } from '@sel/shared';
import { defined } from '@sel/utils';
import { Component } from 'solid-js';

import { Link } from '../../../components/link';
import { Map } from '../../../components/map';
import { MemberAddress } from '../../../components/member-address';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { Row } from '../../../components/row';
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
      <Map
        center={props.openPopupMember?.address?.position ?? [5.042, 43.836]}
        zoom={13}
        markers={markers()}
      />
    </div>
  );
}

type PopupProps = {
  member: Member;
};

const Popup: Component<PopupProps> = (props) => {
  return (
    <Link unstyled href={routes.members.member(props.member.id)} class="col min-w-48 gap-2 outline-none">
      <Row gap={2} class="text-base font-medium">
        <MemberAvatarName member={props.member} />
      </Row>

      <hr />

      <MemberAddress address={defined(props.member.address)} />
    </Link>
  );
};
