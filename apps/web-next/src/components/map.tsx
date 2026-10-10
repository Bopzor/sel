import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

// Load this module with React.lazy, so that only the pages showing a map download Leaflet.

type MapProps = React.ComponentProps<typeof MapContainer>;

export function Map({ className, children, ...props }: MapProps) {
  return (
    // isolate: Leaflet's panes have z-indexes up to 1000, which would go over the navigation and the dialogs.
    <MapContainer {...props} className={clsx('isolate', className)}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {children}
    </MapContainer>
  );
}

export function MapPin(props: Omit<React.ComponentProps<typeof Marker>, 'icon'>) {
  return <Marker icon={pinIcon} {...props} />;
}

// Addresses are geocoded as [longitude, latitude], Leaflet takes [latitude, longitude].
export function toLatLng([longitude, latitude]: [number, number]): L.LatLngTuple {
  return [latitude, longitude];
}

const pinIcon = L.divIcon({
  className: 'text-primary',
  html: '<svg viewBox="0 0 24 32" width="24" height="32" aria-hidden="true"><path d="M12 1C5.9 1 1 5.9 1 12c0 8.3 11 19 11 19s11-10.7 11-19C23 5.9 18.1 1 12 1z" fill="currentColor" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="white"/></svg>',
  iconSize: [24, 32],
  iconAnchor: [12, 31],
  popupAnchor: [0, -28],
});
