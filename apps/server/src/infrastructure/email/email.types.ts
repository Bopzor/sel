export enum EmailKind {
  test = 'test',
  authentication = 'authentication',
}

export type EmailVariables = {
  [EmailKind.test]: {
    variable: string;
  };

  [EmailKind.authentication]: {
    firstName: string;
    authenticationUrl: string;
  };
};

export type Email<Kind extends EmailKind = EmailKind> = {
  to: string;
  subject: string;
  kind: Kind;
  variables: EmailVariables[Kind];
};
