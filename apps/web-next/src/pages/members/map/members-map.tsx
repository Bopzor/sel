import type { Member } from '@sel/shared';
import { Popup } from 'react-leaflet';

import { useConfig } from 'src/app/config';
import { formatAddressLines, formatMemberName } from 'src/app/format';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { Map, MapPin, toLatLng } from 'src/components/map';
import { MemberAvatar } from 'src/components/member-avatar';

type MembersMapProps = {
  members: Member[];
  selectedMemberId?: string;
  className?: string;
};

export function MembersMap({ members, selectedMemberId, className }: MembersMapProps) {
  const config = useConfig();

  const located = members.flatMap((member) => {
    const position = member.address?.position;
    return position ? [{ member, position: toLatLng(position) }] : [];
  });

  const selected = located.find(({ member }) => member.id === selectedMemberId);

  const view = selected
    ? { center: selected.position, zoom: 15 }
    : { center: toLatLng(config.map.center), zoom: config.map.zoom };

  return (
    <Map {...view} className={className}>
      {located.map(({ member, position }) => (
        <MapPin
          key={member.id}
          position={position}
          title={formatMemberName(member)}
          eventHandlers={
            member.id === selected?.member.id ? { add: (event) => event.target.openPopup() } : {}
          }
        >
          <Popup>
            <MemberPopup member={member} />
          </Popup>
        </MapPin>
      ))}
    </Map>
  );
}

function MemberPopup({ member }: { member: Member }) {
  return (
    <div className="row items-center gap-3 font-sans">
      <MemberAvatar member={member} size="md" decorative />
      <div className="stack gap-1">
        <Link href={routes.member(member.id)} className="text-body-strong text-primary underline">
          {formatMemberName(member)}
        </Link>
        {member.address && (
          <address className="text-body-sm whitespace-pre text-muted not-italic">
            {formatAddressLines(member.address).join('\n')}
          </address>
        )}
      </div>
    </div>
  );
}
