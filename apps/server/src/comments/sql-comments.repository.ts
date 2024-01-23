import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { HtmlParserPort } from '../infrastructure/html-parser/html-parser.port';
import { Database } from '../persistence/database';
import { comments } from '../persistence/schema';
import { TOKENS } from '../tokens';

import { CommentsRepository } from './comments.repository';
import { Comment, CommentParentType } from './entities';

export class SqlCommentsRepository implements CommentsRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date, TOKENS.htmlParser);

  constructor(
    private readonly database: Database,
    private readonly dateAdapter: DatePort,
    private readonly htmlParser: HtmlParserPort
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
