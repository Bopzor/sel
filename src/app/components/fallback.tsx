import { Spinner } from './spinner';

type FallbackProps = {
  children: React.ReactNode;
};

export const Fallback = ({ children }: FallbackProps) => {
  // eslint-disable-next-line tailwindcss/no-arbitrary-value
  return <div className="col min-h-[16rem] items-center justify-center">{children}</div>;
};

export const FallbackSpinner = () => (
  <Fallback>
    <Spinner className="h-4 w-4" />
  </Fallback>
);
