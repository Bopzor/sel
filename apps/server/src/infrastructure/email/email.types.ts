import emails from '@sel/emails';

type Emails = typeof emails;
export type EmailKind = keyof Emails;

type CommonEmailVariables = 'appBaseUrl';

export type EmailVariables = {
  [Kind in EmailKind]: Omit<Parameters<Emails[Kind]>[0], CommonEmailVariables>;
};

export type Email<Kind extends EmailKind = EmailKind> = {
  to: string;
  subject: string;
  kind: Kind;
  variables: EmailVariables[Kind];
};
