import { map as leaflet, marker, tileLayer } from 'leaflet';
import { Component, onMount } from 'solid-js';

import 'leaflet/dist/leaflet.css';

type MarkerProps = {
  key: string;
  position: [lat: number, lng: number];
  popup?: Element;
  open?: boolean;
};

type MapProps = {
  center: [lat: number, lng: number];
  markers?: Array<MarkerProps>;
  class?: string;
};

export const Map: Component<MapProps> = (props: MapProps) => {
  let elem: HTMLElement;

  onMount(() => {
    const map = leaflet(elem).setView(props.center, 13);

    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    marker(props.center).addTo(map).bindPopup('A pretty CSS popup.<br> Easily customizable.').openPopup();
  });

  return <div class={props.class} ref={(ref) => (elem = ref)} />;
};
