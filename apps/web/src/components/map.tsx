import * as leaflet from 'leaflet';
import { JSX, createEffect, onMount } from 'solid-js';

import 'leaflet/dist/leaflet.css';

export type MapMarker<T> = {
  position: [lat: number, lng: number];
  payload: T;
};

type MapProps<T> = {
  center: [lat: number, lng: number];
  markers?: Array<MapMarker<T>>;
  openPopup?: T;
  getPopup: (payload: T) => JSX.Element;
  class?: string;
};

export const Map = <T,>(props: MapProps<T>) => {
  let elem: HTMLElement;
  let map: leaflet.Map;

  onMount(() => {
    map = leaflet.map(elem).setView(props.center, 13);

    leaflet
      .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
      .addTo(map);
  });

  const markers = new globalThis.Map<T, leaflet.Marker>();

  createEffect(() => {
    markers.forEach((marker) => marker.remove());
    markers.clear();

    for (const { position, payload } of props.markers ?? []) {
      const marker = leaflet
        .marker(position)
        .addTo(map)
        .bindPopup(props.getPopup(payload) as HTMLElement);

      markers.set(payload, marker);
    }
  });

  createEffect(() => {
    if (props.openPopup) {
      const marker = markers.get(props.openPopup);

      if (marker) {
        marker.openPopup();
        map.setView(props.center, 13);
      }
    } else {
      map.closePopup();
    }
  });

  return <div class={props.class} ref={(ref) => (elem = ref)} />;
};
