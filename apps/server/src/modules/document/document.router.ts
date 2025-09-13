import * as shared from '@sel/shared';
import { Response, Router } from 'express';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

export const router = Router();

router.get('/', async (req, res: Response<shared.DocumentsGroup[]>) => {
  const storage = container.resolve(TOKENS.storage);
  const root = await storage.listFiles('documents');

  res.json(
    root.files
      .filter((entry) => 'files' in entry)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((directory) => ({
        name: directory.name.replace(/\d+/, '').trim(),
        documents: directory.files
          .filter((entry) => 'size' in entry)
          .map((file) => ({
            url: ['', 'documents', directory.name, file.name].map(encodeURIComponent).join('/'),
            ...file,
          })),
      })),
  );
});

router.get('/*path', async (req, res: Response<shared.Document>) => {
  const storage = container.resolve(TOKENS.storage);
  const params = req.params as { path: string[] };

  const stream = await storage.getFile('documents', ['', ...params.path].join('/'));

  res.set('Cache-Control', ['private', 'max-age=0', 'must-revalidate'].join(', '));

  stream.pipe(res);
});
