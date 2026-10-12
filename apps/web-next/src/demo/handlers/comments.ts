import { createCommentBodySchema, getCommentsQuerySchema, type Comment } from '@sel/shared';
import { createId } from '@sel/utils';

import { demo } from '../demo';

export const demoCommentRoutes = [
  demo.route('GET', '/comment', ({ state, query }) => {
    const { entityType, entityId } = getCommentsQuerySchema.parse(query);

    const comments = state.comments
      .filter((comment) => comment.entityType === entityType && comment.entityId === entityId)
      .toSorted((a, b) => a.date.localeCompare(b.date));

    return demo.json(
      comments.map((comment): Comment => ({
        id: comment.id,
        author: demo.serializeLightMember(demo.findMember(state, comment.authorId)),
        date: comment.date,
        message: comment.message,
      })),
    );
  }),

  demo.route('POST', '/comment', ({ state, body, member }) => {
    const { entityType, entityId, body: text, fileIds } = createCommentBodySchema.parse(body);
    const id = createId();

    state.comments.push({
      id,
      entityType,
      entityId,
      authorId: member().id,
      date: new Date().toISOString(),
      message: demo.createMessage(state, text, fileIds),
    });

    return demo.created(id);
  }),
];
