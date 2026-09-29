import clsx from 'clsx';
import type { ComponentProps } from 'react';

export type RichTextProps = Omit<ComponentProps<'div'>, 'children' | 'dangerouslySetInnerHTML'> & {
  /** HTML written with RichTextEditor, sanitized by the application. */
  html: string;
};

export function RichText({ html, className, ...props }: RichTextProps) {
  return (
    <div
      {...props}
      className={clsx('prose prose-theme max-w-none text-body', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
