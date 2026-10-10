import { isImage, type Attachment, type Message } from '@sel/shared';
import { Icon, RichText } from '@sel/ui';
import clsx from 'clsx';
import DOMPurify from 'dompurify';

import { fileUrl } from 'src/app/api';

type ImageSize = 'medium' | 'small';

// The server stores the HTML as the member's browser sent it.
export function MessageContent({ message, imageSize }: { message: Message; imageSize?: ImageSize }) {
  const images = message.attachments.filter(isImage);
  const files = message.attachments.filter((attachment) => !isImage(attachment));

  return (
    <div className="stack gap-4">
      <RichText unsafeHtml={DOMPurify.sanitize(message.body)} />
      {images.length > 0 && <ImagesList images={images} size={imageSize} />}
      {files.length > 0 && <FilesList files={files} />}
    </div>
  );
}

function ImagesList({ images, size = 'medium' }: { images: Attachment[]; size?: ImageSize }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {images.map((image) => (
        <li key={image.fileId}>
          <a href={fileUrl(image.name)} target="_blank" rel="noreferrer" className="block">
            <img
              src={fileUrl(image.name)}
              alt={image.originalName}
              className={clsx('rounded-md border object-cover', {
                'size-24': size === 'small',
                'size-48': size === 'medium',
              })}
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
