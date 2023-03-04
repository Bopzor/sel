export type ListRequestsResult = Array<ListRequestsItem>;

export type ListRequestsItem = {
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
