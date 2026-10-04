import type { Override } from '@sel/utils';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

type RichTextProps = Override<
  ComponentProps<'div'>,
  {
    dangerouslySetInnerHTML?: never;
    /** HTML written with RichTextEditor, inserted as it is: the application sanitizes it. */
    unsafeHtml: string;
    children?: never;
  }
>;

export function RichText({ unsafeHtml, className, ...props }: RichTextProps) {
  return (
    <div
      {...props}
      className={clsx('prose prose-theme max-w-none text-body', className)}
      dangerouslySetInnerHTML={{ __html: unsafeHtml }}
    />
  );
}
