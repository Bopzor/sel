import { Member } from '../../../members';

export type GetRequestResult = {
  id: string;
  requester: Member;
  title: string;
  description: string;
  creationDate: string;
  lastEditionDate: string;
};
