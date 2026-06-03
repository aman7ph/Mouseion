export interface PdfProgress {
  format: 'pdf';
  currentPage: number;
  totalPages: number;
}

export interface EpubProgress {
  format: 'epub';
  cfi: string;
  percentage: number;
}

export type ReadingProgress = PdfProgress | EpubProgress;
