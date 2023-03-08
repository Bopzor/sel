import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

type MapProps = {
  center: [lat: number, lng: number];
  markers?: Array<[lat: number, lng: number]>;
};

const Map = ({ center, markers }: MapProps) => (
  <MapContainer center={center} zoom={13} style={{ height: '100%' }} className="rounded outline-none">
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {markers?.map((position, index) => (
      <Marker key={index} position={position} />
    ))}
  </MapContainer>
);

export default Map;
