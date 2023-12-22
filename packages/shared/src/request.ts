import { Comment } from './comment';
import { PhoneNumber } from './phone-number';

export type Request = {
  id: string;
  date: string;
  requester: Requester;
  title: string;
  body: string;
  comments: Comment[];
};

export type Requester = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumbers: PhoneNumber[];
};
