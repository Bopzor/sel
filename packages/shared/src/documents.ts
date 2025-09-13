export type DocumentsGroup = {
  name: string;
  documents: Document[];
};

export type Document = {
  url: string;
  name: string;
  size: number;
  updated: string;
};
