import clsx from 'clsx';

export function BoxSkeleton(props: { height: number }) {
  return (
    <div class="w-full animate-pulse rounded-lg bg-inverted/10" style={{ height: `${props.height}rem` }} />
  );
}

export function TextSkeleton(props: { width: number; class?: string }) {
  return (
    <span
      class={clsx('inline-block w-full animate-pulse rounded-sm bg-inverted/10 align-middle', props.class)}
      style={{ 'max-width': `${props.width}rem` }}
    >
      <wbr />
    </span>
  );
}
