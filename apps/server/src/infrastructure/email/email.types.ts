export enum EmailKind {
  test = 'test',
  authentication = 'authentication',
  notification = 'notification',
}

export type EmailVariables = {
  [EmailKind.test]: {
    variable: string;
  };

  [EmailKind.authentication]: {
    firstName: string;
    authenticationUrl: string;
  };

  [EmailKind.notification]: {
    firstName: string;
    title: string;
    content: string;
  };
};

export type Email<Kind extends EmailKind = EmailKind> = {
  to: string;
  subject: string;
  kind: Kind;
  variables: EmailVariables[Kind];
};
