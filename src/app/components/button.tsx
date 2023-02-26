import clsx from 'clsx';

import { Spinner } from './spinner';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export const Button = ({ loading, className, children, ...props }: ButtonProps) => (
  <button
    className={clsx(
      'row items-center gap-0.5 whitespace-nowrap rounded bg-green px-1 py-0.5 font-medium text-white',
      className
    )}
    {...props}
  >
    {children}

    {loading && <Spinner className="h-1 w-1" />}
  </button>
);

type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  loading?: boolean;
};

export const LinkButton = ({ loading, className, children, ...props }: LinkButtonProps) => (
  <a
    className={clsx(
      'row items-center gap-0.5 whitespace-nowrap rounded bg-green px-1 py-0.5 font-medium text-white',
      className
    )}
    {...props}
  >
    {children}

    {loading && <Spinner className="h-1 w-1" />}
  </a>
);
