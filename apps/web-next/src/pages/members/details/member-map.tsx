import { Map, MapPin, toLatLng } from 'src/components/map';

export function MemberMap({ position }: { position: [number, number] }) {
  const latLng = toLatLng(position);

  return (
    <Map
      center={latLng}
      zoom={15}
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      className="h-48 w-full rounded-md border"
    >
      <MapPin position={latLng} interactive={false} />
    </Map>
  );
}
