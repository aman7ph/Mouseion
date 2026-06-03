export type BookFormat = 'pdf' | 'epub';

export interface BookMeta {
  id: string;
  title: string;
  filePath: string;
  format: BookFormat;
  lastOpenedAt: number;
  addedAt: number;
}
