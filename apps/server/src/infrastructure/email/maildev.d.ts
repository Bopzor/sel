declare module 'maildev' {
  type MailDevOptions = {
    web: number;
    smtp: number;
    silent: boolean;
  };

  export type Email = {
    from: Array<{ address: string; name: string }>;
    to: Array<{ address: string; name: string }>;
    subject: string;
    date: string;
    headers: Record<string, string>;
    text?: string;
    html?: string;
  };

  export default class MaliDev {
    constructor(options: MailDevOptions);

    listen(callback: (err?: Error) => void): void;
    close(callback: (err?: Error) => void): void;

    on(event: 'new', callback: (email: Email) => void): void;
  }
}
