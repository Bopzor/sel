import clsx from 'clsx';
import { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  width?: 'full';
  start?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ width, start, className, ...props }, ref) => (
    <div
      className={clsx(
        'row items-center gap-1 rounded bg-neutral px-1 focus-within:shadow',
        width === 'full' && 'w-full'
      )}
    >
      {start}
      <input ref={ref} className={clsx('h-full w-full py-1 outline-none', className)} {...props} />
    </div>
  )
);

Input.displayName = 'Input';
