import { Extend } from '@sel/utils';
import { ComponentProps, For, JSX, Show, splitProps } from 'solid-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function List<T extends readonly any[], U extends JSX.Element>(
  props: Extend<ComponentProps<'ul'>, ComponentProps<typeof For<T, U>>>,
) {
  const [forPros, ulProps] = splitProps(props, ['fallback', 'each', 'children']);

  return (
    <Show when={Array.isArray(props.each) && props.each.length > 0} fallback={props.fallback}>
      <ul {...ulProps}>
        <For {...forPros} />
      </ul>
    </Show>
  );
}
