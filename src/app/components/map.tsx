import { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

type MarkerProps = {
  key: string;
  position: [lat: number, lng: number];
  popup?: React.ReactNode;
  open?: boolean;
};

type MapProps = {
  center: [lat: number, lng: number];
  markers?: Array<MarkerProps>;
};

const Map = ({ center, markers }: MapProps) => {
  const [map, setMap] = useState<LeafletMap | null>(null);

  const handleMarkerRef = (marker: LeafletMarker | null, open?: boolean) => {
    if (!marker || !map) {
      return;
    }

    if (open) {
      marker.openPopup();
      map.setZoom(12);
    } else if (marker.isPopupOpen()) {
      marker.closePopup();
    }
  };

  return (
    <MapContainer
      ref={setMap}
      center={center}
      zoom={13}
      style={{ height: '100%' }}
      className="rounded shadow outline-none"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers?.map(({ key, position, popup, open }) => (
        <Marker ref={(ref) => handleMarkerRef(ref, open)} key={key} position={position}>
          {popup && <Popup>{popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
