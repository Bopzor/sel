import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

export class MembersController {
  readonly router = Router();

  static inject = injectableClass(this);

  constructor() {
    this.router.get('/', this.listMembers);
    this.router.get('/:memberId', this.getMember);
  }

  listMembers: RequestHandler = (req, res) => {
    res.json([]);
  };

  getMember: RequestHandler = (req, res) => {
    res.json({});
  };
}
