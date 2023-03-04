export type GetRequestResult = {
  id: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  creationDate: string;
  lastEditionDate: string;
};
