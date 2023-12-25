import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { HtmlParserPort } from '../infrastructure/html-parser/html-parser.port';
import { Database } from '../infrastructure/persistence/database';
import { comments } from '../infrastructure/persistence/schema';
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

  async insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(comments).values({
      id: comment.id,
      authorId: comment.authorId,
      [`${parentType}Id`]: parentId,
      date: comment.date,
      html: comment.body,
      text: this.htmlParser.getTextContent(comment.body),
      createdAt: now,
      updatedAt: now,
    });
  }
}
