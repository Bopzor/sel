import { createId } from '@sel/utils';
import clsx from 'clsx';
import * as maplibre from 'maplibre-gl';
import { Component, For, JSX, createEffect, createSignal } from 'solid-js';
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

export const Map: Component<MapProps> = (props) => {
  const id = createId();

  const [viewport, setViewport] = createSignal<Viewport>({
    id,
    center: props.center,
    zoom: props.zoom,
  });

  createEffect(() => {
    setViewport({
      id,
      center: props.center,
      zoom: props.zoom,
    });
  });

  return (
    <MapGL
      debug
      id={id}
      mapLib={maplibre}
      viewport={viewport()}
      onViewportChange={(evt) => setViewport(evt)}
      // eslint-disable-next-line tailwindcss/no-arbitrary-value
      class={clsx(props.class, '[&_.maplibregl-canvas]:outline-none')}
    >
      <Source
        source={{
          type: 'raster',
          tileSize: 256,
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          attribution: '© OpenStreetMap',
        }}
      >
        {/* eslint-disable-next-line solid/style-prop */}
        <Layer style={{ type: 'raster' }} />
      </Source>

      <For each={props.markers}>
        {(marker) => (
          <Marker
            lngLat={marker.position}
            showPopup={marker.isPopupOpen}
            popup={{ closeButton: false, className: '[&>.maplibregl-popup-content]:rounded-lg' }}
          >
            {marker.render && <div>{marker.render()}</div>}
          </Marker>
        )}
      </For>
    </MapGL>
  );
};
