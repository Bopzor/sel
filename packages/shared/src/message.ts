export type Message = {
  body: string;
  attachements: Attachement[];
};

export type Attachement = {
  name: string;
  mimetype: string;
};
