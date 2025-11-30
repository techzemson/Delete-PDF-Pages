// Global types for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export interface PDFPage {
  id: number;
  originalIndex: number;
  imageUrl: string;
  isSelected: boolean;
  width: number;
  height: number;
}

export interface PDFFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  pageCount: number;
  data: ArrayBuffer;
}

export enum ProcessStatus {
  IDLE,
  LOADING,
  ANALYZING,
  SUCCESS,
  ERROR
}

export interface HistoryState {
  selectedIds: number[];
}

export interface ProcessingStats {
  originalPages: number;
  deletedPages: number;
  keptPages: number;
  savedSizeRatio: number; // Estimated
}
