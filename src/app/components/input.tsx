import clsx from 'clsx';
import { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  start?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({ start, className, ...props }, ref) => (
  <div className="row items-center gap-1 rounded bg-neutral px-1 focus-within:shadow">
    {start}
    <input ref={ref} className={clsx('h-full w-full py-1 outline-none', className)} {...props} />
  </div>
));

Input.displayName = 'Input';
