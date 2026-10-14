import { ListObjectsV2CommandOutput, S3Client, _Object as S3Object } from '@aws-sdk/client-s3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TOKENS } from '../tokens';

import { container } from './container';
import { S3Storage } from './storage';

describe('S3Storage', () => {
  let storage: S3Storage;

  beforeEach(() => {
    storage = new S3Storage(container.resolve(TOKENS.config));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockPages = (...pages: Array<Partial<ListObjectsV2CommandOutput>>) => {
    const send = vi.spyOn(S3Client.prototype, 'send');

    for (const page of pages) {
      send.mockResolvedValueOnce(page as never);
    }

    return send;
  };

  const object = (key: string, size = 1): S3Object => ({
    Key: key,
    Size: size,
    LastModified: new Date('2026-01-01T00:00:00.000Z'),
  });

  it('lists the files as a directory tree', async () => {
    mockPages({ Contents: [object('root.pdf'), object('dir/a.pdf'), object('dir/sub/b.pdf')] });

    expect(await storage.listFiles('documents')).toEqual({
      name: '.',
      files: [
        { name: 'root.pdf', size: 1, updated: '2026-01-01T00:00:00.000Z' },
        {
          name: 'dir',
          files: [
            { name: 'a.pdf', size: 1, updated: '2026-01-01T00:00:00.000Z' },
            { name: 'sub', files: [{ name: 'b.pdf', size: 1, updated: '2026-01-01T00:00:00.000Z' }] },
          ],
        },
      ],
    });
  });

  it('ignores folder markers', async () => {
    mockPages({ Contents: [object('dir/', 0), object('dir/a.pdf')] });

    expect(await storage.listFiles('documents')).toEqual({
      name: '.',
      files: [{ name: 'dir', files: [{ name: 'a.pdf', size: 1, updated: '2026-01-01T00:00:00.000Z' }] }],
    });
  });

  it('lists empty files', async () => {
    mockPages({ Contents: [object('dir/empty.txt', 0)] });

    expect(await storage.listFiles('documents')).toEqual({
      name: '.',
      files: [{ name: 'dir', files: [{ name: 'empty.txt', size: 0, updated: '2026-01-01T00:00:00.000Z' }] }],
    });
  });

  it('lists the files across several pages', async () => {
    const send = mockPages(
      { Contents: [object('a.pdf')], NextContinuationToken: 'token' },
      { Contents: [object('b.pdf')] },
    );

    const root = await storage.listFiles('documents');

    expect(root.files.map((file) => file.name)).toEqual(['a.pdf', 'b.pdf']);
    expect(send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ input: expect.objectContaining({ ContinuationToken: 'token' }) }),
    );
  });
});
