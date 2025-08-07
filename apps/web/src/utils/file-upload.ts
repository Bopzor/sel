import { File } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';

import { api } from 'src/application/api';

export function createFileUploadHandler(onSuccess: (file: File) => void) {
  const fileUpload = useMutation(() => ({
    async mutationFn(file: globalThis.File) {
      return api.uploadFile({ files: { file } });
    },
    onSuccess,
  }));

  return [
    (event: { target: HTMLInputElement }) => {
      const [file] = event.target.files ?? [];

      if (file) {
        fileUpload.mutateAsync(file);
      }
    },
    () => fileUpload.isPending,
  ] as const;
}
