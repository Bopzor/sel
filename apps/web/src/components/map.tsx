import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createEffect, createSignal, For, JSX, Show } from 'solid-js';
import MapGL, { Marker, Viewport } from 'solid-map-gl';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';
import { getLetsConfig } from '../utils/lets-config';

// cspell:words maplibre maplibregl

export type MapMarker = {
  position: [lng: number, lat: number];
  isPopupOpen: boolean;
  render?: () => JSX.Element;
};

type MapProps = {
  center?: [lng: number, lat: number];
  zoom?: number;
  markers?: Array<MapMarker>;
  class?: string;
};

export function Map(props: MapProps) {
  const { geoapify } = container.resolve(TOKENS.config);

  const config = getLetsConfig();
  const [viewport, setViewport] = createSignal<Viewport>();

  createEffect(() => {
    const { map } = config() ?? {};

    if (map) {
      setViewport((viewport) => viewport ?? map);
    }
  });

  createEffect(() => {
    if (props.center && props.zoom) {
      setViewport((viewport) => ({
        ...viewport,
        center: props.center,
        zoom: props.zoom,
      }));
    }
  });

  return (
    <Show when={viewport()}>
      {(viewport) => (
        <MapGL
          mapLib={maplibre}
          options={{
            style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapify.apiKey}`,
          }}
          viewport={viewport()}
          onViewportChange={setViewport}
          class="map relative size-full rounded-lg shadow"
        >
          <For each={props.markers}>
            {(marker) => (
              <Marker lngLat={marker.position} showPopup={marker.isPopupOpen} popup={{ closeButton: false }}>
                {marker.render ? <div>{marker.render()}</div> : <div />}
              </Marker>
            )}
          </For>
        </MapGL>
      )}
    </Show>
  );
}
