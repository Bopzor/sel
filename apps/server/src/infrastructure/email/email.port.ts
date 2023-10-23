export type Email = {
  to: string;
  subject: string;
  body: {
    text: string;
    html: string;
  };
};

export interface EmailPort {
  send(email: Email): Promise<void>;
}
