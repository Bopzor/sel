import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  start?: React.ReactNode;
};

export const Input = ({ start, className, ...props }: InputProps) => (
  <div className="row items-center gap-1 rounded bg-neutral px-1 focus-within:shadow">
    {start}
    <input className={clsx('h-full w-full py-1 outline-none', className)} {...props} />
  </div>
);
