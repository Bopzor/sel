import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import { Member } from '../../aliases';

import 'leaflet/dist/leaflet.css';

type MembersMapProps = {
  members?: Member[];
};

const MembersMap = ({ members }: MembersMapProps) => {
  return (
    <MapContainer
      center={[43.836, 5.042]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: 400 }}
      className="rounded"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {members?.map(({ id, address }) => (
        <Marker key={id} position={address.position} />
      ))}
    </MapContainer>
  );
};

export default MembersMap;
