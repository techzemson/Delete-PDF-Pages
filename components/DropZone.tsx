import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  }, [disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    // Optional: Size check, e.g., 100MB
    if (file.size > 100 * 1024 * 1024) {
      setError('File is too large. Max 100MB supported for browser performance.');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-3xl mx-auto h-80 rounded-3xl border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-8
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-102 shadow-2xl' 
          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        accept="application/pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      <div className={`p-6 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-6 transition-transform duration-500 ${isDragging ? 'scale-110 rotate-12' : ''}`}>
        <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
        {isDragging ? 'Drop it like it\'s hot!' : 'Drop PDF here or click to upload'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
        Secure client-side processing. Your files never leave your device.
        Supports large files up to 100MB.
      </p>

      <div className="flex gap-4 text-sm text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> PDF Documents</span>
      </div>

      {error && (
        <div className="absolute bottom-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};
