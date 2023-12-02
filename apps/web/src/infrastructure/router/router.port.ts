export interface RouterPort {
  location: {
    pathname: string;
  };

  navigate(href: string): void;
}
