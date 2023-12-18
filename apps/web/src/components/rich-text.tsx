import clsx from 'clsx';

type RichTextProps = {
  class?: string;
  children?: string;
};

export function RichText(props: RichTextProps) {
  // eslint-disable-next-line solid/no-innerhtml
  return <div class={clsx('prose max-w-none dark:prose-invert', props.class)} innerHTML={props.children} />;
}
