export type Message = {
  body: string;
  attachments: Attachment[];
};

export type Attachment = {
  fileId: string;
  name: string;
  originalName: string;
  mimetype: string;
};

export function isImage({ mimetype }: Attachment) {
  return mimetype.startsWith('image/');
}
