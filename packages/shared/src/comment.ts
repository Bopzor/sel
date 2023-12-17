import { Member } from './member';

export type Comment = {
  id: string;
  author: Member;
  date: string;
  body: string;
};
