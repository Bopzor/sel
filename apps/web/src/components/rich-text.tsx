import clsx from 'clsx';

export function RichText(props: { class?: string; children?: string }) {
  // eslint-disable-next-line solid/no-innerhtml
  return <div class={clsx('prose max-w-none dark:prose-invert', props.class)} innerHTML={props.children} />;
}
