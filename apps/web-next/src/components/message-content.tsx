import { isImage, type Attachment, type Message } from '@sel/shared';
import { Icon, RichText } from '@sel/ui';
import DOMPurify from 'dompurify';

import { fileUrl } from 'src/app/api';

// The server stores the HTML as the member's browser sent it.
export function MessageContent({ message }: { message: Message }) {
  const images = message.attachments.filter(isImage);
  const files = message.attachments.filter((attachment) => !isImage(attachment));

  return (
    <div className="stack gap-4">
      <RichText unsafeHtml={DOMPurify.sanitize(message.body)} />
      {images.length > 0 && <ImagesList images={images} />}
      {files.length > 0 && <FilesList files={files} />}
    </div>
  );
}

function ImagesList({ images }: { images: Attachment[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((image) => (
        <li key={image.fileId}>
          <a href={fileUrl(image.name)} target="_blank" rel="noreferrer" className="block">
            <img
              src={fileUrl(image.name)}
              alt={image.originalName}
              className="aspect-square w-full rounded-md border object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

function FilesList({ files }: { files: Attachment[] }) {
  return (
    <ul className="stack gap-2">
      {files.map((file) => (
        <li key={file.fileId}>
          <a
            href={fileUrl(file.name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-body-sm text-primary underline"
          >
            <Icon name="attachment" size="sm" />
            {file.originalName}
          </a>
        </li>
      ))}
    </ul>
  );
}
