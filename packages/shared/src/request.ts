import { Comment } from './comment';
import { PhoneNumber } from './phone-number';

export enum RequestStatus {
  pending = 'pending',
  fulfilled = 'fulfilled',
  canceled = 'canceled',
}

export type Request = {
  id: string;
  status: RequestStatus;
  date: string;
  requester: Requester;
  title: string;
  body: string;
  answers: RequestAnswer[];
  comments: Comment[];
};

export type Requester = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumbers: PhoneNumber[];
};

export type RequestAnswer = {
  id: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
  };
  answer: 'positive' | 'negative';
};
