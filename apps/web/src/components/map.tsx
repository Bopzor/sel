import clsx from 'clsx';
import * as maplibre from 'maplibre-gl';
import { For, JSX, createEffect, createSignal, createUniqueId, onMount } from 'solid-js';
import MapGL, { Layer, Marker, Source, Viewport } from 'solid-map-gl';

import 'maplibre-gl/dist/maplibre-gl.css';

// cspell:words maplibre maplibregl

export type MapMarker = {
  position: [lng: number, lat: number];
  isPopupOpen: boolean;
  render?: () => JSX.Element;
};

type MapProps = {
  center: [lng: number, lat: number];
  zoom: number;
  markers?: Array<MapMarker>;
  class?: string;
};

export function Map(props: MapProps) {
  const id = createUniqueId();

  const [viewport, setViewport] = createSignal<Viewport>({
    center: props.center,
    zoom: props.zoom,
    id,
  });

  createEffect(() => {
    setViewport({
      center: props.center,
      zoom: props.zoom,
      id,
    });
  });

  const [fade, setFade] = createSignal<number>(0);

  onMount(() => {
    // avoid fade in on mount
    setTimeout(() => setFade(300), 1000);
  });

  return (
    <MapGL
      mapLib={maplibre}
      id={id}
      viewport={viewport()}
      onViewportChange={(viewport) => setViewport(viewport)}
      class={clsx(props.class, 'map size-full rounded-lg shadow [&_canvas]:outline-none')}
    >
      <Source
        source={{
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap',
          maxzoom: 19, // cspell:disable-line
        }}
      >
        {/* eslint-disable-next-line solid/style-prop */}
        <Layer style={{ type: 'raster', paint: { 'raster-fade-duration': fade() } }} />
      </Source>

      <For each={props.markers}>
        {(marker) => (
          <Marker lngLat={marker.position} showPopup={marker.isPopupOpen} popup={{ closeButton: false }}>
            {marker.render ? <div>{marker.render()}</div> : <div />}
          </Marker>
        )}
      </For>
    </MapGL>
  );
}
