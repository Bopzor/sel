import type { File as UploadedFile } from '@sel/shared';
import { assert, createId } from '@sel/utils';

import { localFileUrls } from 'src/app/api';

import { demo } from '../demo';
import { demoStorage } from '../storage';

export const demoFileRoutes = [
  demo.route('POST', '/files/upload', async ({ state, body }) => {
    assert(body instanceof FormData);

    const blob = body.get('file');

    assert(blob instanceof File);

    const id = createId();
    // The name is only the key of the file in the browser's storage.
    const file: UploadedFile = {
      id,
      name: id,
      originalName: blob.name,
      mimetype: blob.type,
    };

    await demoStorage.addFile({ name: file.name, blob });

    state.files.push(file);
    localFileUrls.set(file.name, URL.createObjectURL(blob));

    return demo.json(file, { status: 201 });
  }),
];
