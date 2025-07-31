export type Message = {
  body: string;
  attachements: Attachement[];
};

export type Attachement = {
  fileId: string;
  name: string;
  originalName: string;
  mimetype: string;
};

export function isImage({ mimetype }: Attachement) {
  return mimetype.startsWith('image/');
}
