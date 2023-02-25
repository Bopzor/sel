import { PageHeader } from './page-header';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => (
  <>
    <PageHeader />
    <main className="content col gap-2 py-2">{children}</main>
  </>
);
