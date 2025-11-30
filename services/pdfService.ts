import { PDFDocument } from 'pdf-lib';
import { PDFPage, PDFFile } from '../types';

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const renderPDFPages = async (
  arrayBuffer: ArrayBuffer,
  onProgress: (progress: number) => void
): Promise<PDFPage[]> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not loaded");
  }

  // Clone the buffer to prevent PDF.js from detaching the original ArrayBuffer
  // when transferring data to its worker.
  const bufferClone = arrayBuffer.slice(0);

  const loadingTask = window.pdfjsLib.getDocument({ data: bufferClone });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: PDFPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.5 }); // Thumbnail scale
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      pages.push({
        id: i,
        originalIndex: i - 1, // 0-based for pdf-lib
        imageUrl: canvas.toDataURL('image/jpeg', 0.8),
        isSelected: false,
        width: viewport.width,
        height: viewport.height,
      });
    }
    
    onProgress(Math.round((i / numPages) * 100));
  }

  return pages;
};

export const createNewPDF = async (
  originalFileBuffer: ArrayBuffer,
  keptPageIndices: number[]
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(originalFileBuffer);
  
  // Create a new document
  const newPdfDoc = await PDFDocument.create();
  
  // Copy pages from original
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, keptPageIndices);
  
  // Add pages to new document
  copiedPages.forEach((page) => newPdfDoc.addPage(page));
  
  const pdfBytes = await newPdfDoc.save();
  return pdfBytes;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};