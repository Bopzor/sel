import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { Comment, CommentParentType } from '../../../comments/comment.entity';
import { DatePort } from '../../../infrastructure/date/date.port';
import { HtmlParserPort } from '../../../infrastructure/html-parser/html-parser.port';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { comments } from '../../schema';

import { CommentRepository } from './comment.repository';

export class SqlCommentRepository implements CommentRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date, TOKENS.htmlParser);

  constructor(
    private readonly database: Database,
    private readonly dateAdapter: DatePort,
    private readonly htmlParser: HtmlParserPort,
  ) {}

  async getComment(commentId: string): Promise<Comment | undefined> {
    const [sqlComment] = await this.database.db.select().from(comments).where(eq(comments.id, commentId));

    if (!sqlComment) {
      return;
    }

    return {
      id: sqlComment.id,
      authorId: sqlComment.authorId,
      entityId: sqlComment.requestId as string,
      date: sqlComment.date,
      text: sqlComment.text,
    };
  }

  async insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(comments).values({
      id: comment.id,
      authorId: comment.authorId,
      [`${parentType}Id`]: parentId,
      date: comment.date,
      html: comment.text,
      text: this.htmlParser.getTextContent(comment.text),
      createdAt: now,
      updatedAt: now,
    });
  }
}
