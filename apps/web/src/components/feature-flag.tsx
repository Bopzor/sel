import { JSX, Show, createEffect, createSignal } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';

export enum Feature {
  none = 'none',
  requests = 'requests',
}

const [features, setFeatures] = createStore<Partial<Record<Feature, boolean>>>(
  JSON.parse(localStorage.getItem('features') ?? '{}')
);

type FeatureFlagProps = {
  feature: Feature;
  fallback?: JSX.Element;
  children?: JSX.Element;
};

export function FeatureFlag(props: FeatureFlagProps) {
  // eslint-disable-next-line solid/reactivity
  const enabled = hasFeatureFlag(props.feature);

  return (
    <Show when={enabled()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
}

export function hasFeatureFlag(feature: Feature) {
  const [enabled, setEnabled] = createSignal(Boolean(features[feature]));

  createEffect(() => {
    setEnabled(Boolean(features[feature]));
  });

  return enabled;
}

export function setFeatureFlag(feature: Feature, enabled: boolean) {
  setFeatures(feature, enabled);
  localStorage.setItem('features', JSON.stringify(unwrap(features)));
}
