import { AsyncResource } from 'node:async_hooks';
import fs from 'node:fs/promises';
import path from 'node:path';

import { assert } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { RequestHandler, Router } from 'express';
import multer from 'multer';

import { container } from 'src/infrastructure/container';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { files } from 'src/persistence/schema';
import { TOKENS } from 'src/tokens';

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
  const config = container.resolve(TOKENS.config);

  const file = await db.query.files.findFirst({
    where: eq(files.name, req.params.name),
  });

  if (!file) {
    return next();
  }

  const buffer = await fs.readFile(path.join(config.files.uploadDir, file.name));

  res.set('Content-Type', file.mimetype).send(buffer);
});

router.post('/upload', ensureAsyncContext(upload.single('file')), async (req, res) => {
  const generator = container.resolve(TOKENS.generator);
  const config = container.resolve(TOKENS.config);
  const member = getAuthenticatedMember();

  assert(req.file);

  const id = generator.id();
  const ext = getExtension(req.file);
  const name = `${id}.${ext}`;

  await fs.mkdir(config.files.uploadDir, { recursive: true });
  await fs.writeFile(path.join(config.files.uploadDir, name), req.file.buffer);

  await db.insert(schema.files).values({
    id,
    name,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedBy: member.id,
  });

  res.status(HttpStatus.created).send(name);
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
