import { createDate, createFactory, createId } from '@sel/utils';

export type CommentParentType = 'request' | 'event';

export type Comment = {
  id: string;
  authorId: string;
  entityId: string;
  date: Date;
  text: string;
};

export const createComment = createFactory<Comment>(() => ({
  id: createId(),
  authorId: '',
  entityId: '',
  date: createDate(),
  text: '',
}));
