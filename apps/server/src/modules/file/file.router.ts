import { AsyncResource } from 'node:async_hooks';

import * as shared from '@sel/shared';
import { assert, pick } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { RequestHandler, Router } from 'express';
import multer from 'multer';

import { container } from 'src/infrastructure/container';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db } from 'src/persistence';
import { files } from 'src/persistence/schema';
import { TOKENS } from 'src/tokens';

import { FileInsert } from './file.entity';
import { insertFile } from './file.persistence';

// cspell:word originalname

export const router = Router();

const upload = multer({
  // 10 MB
  limits: { fileSize: 1024 * 1024 * 10 },
});

// https://github.com/expressjs/multer/issues/814#issuecomment-1218998366
function ensureAsyncContext(middleware: RequestHandler): RequestHandler {
  return (req, res, next) => middleware(req, res, AsyncResource.bind(next));
}

router.get('/:name', async (req, res, next) => {
  const storage = container.resolve(TOKENS.storage);

  const file = await db.query.files.findFirst({
    where: eq(files.name, req.params.name),
  });

  if (!file) {
    return next();
  }

  const stream = await storage.getFile('userUploads', file.name);

  res.set('Content-Type', file.mimetype);
  res.set('Cache-Control', ['private', `max-age=${7 * 24 * 60 * 60}`, 'immutable'].join(', '));

  stream.pipe(res);
});

router.post('/upload', ensureAsyncContext(upload.single('file')), async (req, res) => {
  const generator = container.resolve(TOKENS.generator);
  const storage = container.resolve(TOKENS.storage);
  const member = getAuthenticatedMember();

  assert(req.file);

  const id = generator.id();
  const ext = getExtension(req.file);
  const name = `${id}.${ext}`;

  await storage.storeFile('userUploads', name, req.file.buffer, req.file.mimetype);

  const file: FileInsert = {
    id,
    name,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedBy: member.id,
  };

  await insertFile(file);

  res
    .status(HttpStatus.created)
    .send(pick(file, ['id', 'name', 'originalName', 'mimetype']) satisfies shared.File);
});

function getExtension(file: Express.Multer.File) {
  const { mimetype, originalname } = file;

  if (mimetype in mimetypeExtensionMap) {
    return mimetypeExtensionMap[mimetype];
  }

  if (originalname.includes('.')) {
    return originalname.split('.').pop();
  }

  return 'data';
}

const mimetypeExtensionMap: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
  'text/plain': 'txt',
};
