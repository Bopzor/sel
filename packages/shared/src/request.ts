import { Comment } from './comment';
import { Member } from './member';

export type Request = {
  id: string;
  date: string;
  author: Member;
  title: string;
  message: string;
  comments: Comment[];
};
