import { JSX, Show } from 'solid-js';

export enum Feature {
  none = 'none',
  requests = 'requests',
}

type FeatureFlagProps = {
  feature: Feature;
  fallback?: JSX.Element;
  children?: JSX.Element;
};

export function FeatureFlag(props: FeatureFlagProps) {
  const features = JSON.parse(localStorage.getItem('features') ?? '{}');

  return (
    <Show when={features[props.feature]} fallback={props.fallback}>
      {props.children}
    </Show>
  );
}
