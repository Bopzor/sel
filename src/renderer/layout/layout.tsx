import { PageHeader } from './page-header';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => (
  <>
    <PageHeader />
    <main className="content col gap-4 py-4">{children}</main>
  </>
);
