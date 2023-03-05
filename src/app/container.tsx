import { Container } from 'brandi';
import { ContainerProvider as BrandiContainerProvider } from 'brandi-react';

export const container = new Container();

type ContainerProviderProps = {
  children: React.ReactNode;
};

export const ContainerProvider = ({ children }: ContainerProviderProps) => (
  <BrandiContainerProvider container={container}>{children}</BrandiContainerProvider>
);
