export type GetRequestResult = {
  id: string;
  requester: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  title: string;
  description: string;
  creationDate: string;
  lastEditionDate: string;
};
