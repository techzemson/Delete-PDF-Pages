import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DropZone } from './components/DropZone';
import { readFileAsArrayBuffer, renderPDFPages, createNewPDF, formatFileSize } from './services/pdfService';
import { PDFPage, PDFFile, ProcessStatus, ProcessingStats } from './types';
import { AIReport } from './components/AIReport';
import { 
  Trash2, Download, RotateCcw, ZoomIn, ZoomOut, Grid, List, 
  CheckSquare, Square, FileOutput, ShieldCheck, Zap, 
  ChevronRight, Home, Menu, X, Sun, Moon, Upload
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- Constants ---
const MAX_ZOOM = 300;
const MIN_ZOOM = 100;
const ZOOM_STEP = 25;

const App: React.FC = () => {
  // --- State ---
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(150); // px width
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectionHistory, setSelectionHistory] = useState<number[][]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [rangeInput, setRangeInput] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Handlers ---

  const handleFileSelect = async (uploadedFile: File) => {
    try {
      setStatus(ProcessStatus.LOADING);
      setLoadingProgress(0);
      const arrayBuffer = await readFileAsArrayBuffer(uploadedFile);
      
      // Load pages
      const renderedPages = await renderPDFPages(arrayBuffer, (progress) => {
        setLoadingProgress(progress);
      });

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        lastModified: uploadedFile.lastModified,
        pageCount: renderedPages.length,
        data: arrayBuffer
      });
      setPages(renderedPages);
      setSelectionHistory([[]]); // Initial history
      setStatus(ProcessStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(ProcessStatus.ERROR);
      alert("Failed to load PDF. It might be password protected or corrupted.");
    }
  };

  const togglePageSelection = (id: number) => {
    setPages(prev => {
      const newPages = prev.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p);
      addToHistory(newPages);
      return newPages;
    });
  };

  const addToHistory = (currentPages: PDFPage[]) => {
    const selectedIds = currentPages.filter(p => p.isSelected).map(p => p.id);
    setSelectionHistory(prev => [...prev.slice(-9), selectedIds]); // Keep last 10
  };

  const handleSelectAll = () => {
    setPages(prev => {
      const newPages = prev.map(p => ({ ...p, isSelected: true }));
      addToHistory(newPages);
      return newPages;
    });
  };

  const handleDeselectAll = () => {
    setPages(prev => {
      const newPages = prev.map(p => ({ ...p, isSelected: false }));
      addToHistory(newPages);
      return newPages;
    });
  };

  const handleInvertSelection = () => {
    setPages(prev => {
      const newPages = prev.map(p => ({ ...p, isSelected: !p.isSelected }));
      addToHistory(newPages);
      return newPages;
    });
  };

  const handleSelectOdd = () => {
    setPages(prev => {
      const newPages = prev.map(p => ({ ...p, isSelected: p.id % 2 !== 0 }));
      addToHistory(newPages);
      return newPages;
    });
  };

  const handleSelectEven = () => {
    setPages(prev => {
      const newPages = prev.map(p => ({ ...p, isSelected: p.id % 2 === 0 }));
      addToHistory(newPages);
      return newPages;
    });
  };

  const handleRangeSelect = () => {
    if (!rangeInput) return;
    
    // Parse range string "1-5, 8"
    const idsToSelect = new Set<number>();
    const parts = rangeInput.split(',');
    
    parts.forEach(part => {
      const range = part.trim().split('-');
      if (range.length === 2) {
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            idsToSelect.add(i);
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num)) idsToSelect.add(num);
      }
    });

    setPages(prev => {
      const newPages = prev.map(p => ({ 
        ...p, 
        isSelected: idsToSelect.has(p.id) || p.isSelected 
      }));
      addToHistory(newPages);
      return newPages;
    });
    setRangeInput('');
  };

  const handleDelete = async () => {
    if (!file) return;
    
    const keptPages = pages.filter(p => !p.isSelected);
    if (keptPages.length === 0) {
      alert("You cannot delete all pages!");
      return;
    }

    setStatus(ProcessStatus.ANALYZING);
    
    // Simulate processing time for better UX
    setTimeout(async () => {
      try {
        const keptIndices = keptPages.map(p => p.originalIndex);
        // Create a copy of the buffer to avoid any detachment issues during processing
        const bufferCopy = file.data.slice(0);
        const newPdfBytes = await createNewPDF(bufferCopy, keptIndices);
        
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        
        setStats({
          originalPages: file.pageCount,
          deletedPages: pages.filter(p => p.isSelected).length,
          keptPages: keptPages.length,
          savedSizeRatio: 1 - (keptPages.length / file.pageCount) // Approximate
        });

        setStatus(ProcessStatus.SUCCESS);
      } catch (err) {
        console.error(err);
        setStatus(ProcessStatus.ERROR);
      }
    }, 800);
  };

  const resetTool = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPages([]);
    setStatus(ProcessStatus.IDLE);
    setStats(null);
    setDownloadUrl(null);
  };

  // --- Render Helpers ---

  const selectedCount = pages.filter(p => p.isSelected).length;

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Kept', value: stats.keptPages, color: '#22c55e' }, // green-500
      { name: 'Deleted', value: stats.deletedPages, color: '#ef4444' }, // red-500
    ];
  }, [stats]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileOutput className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Delete or Remove PDF Pages
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {status === ProcessStatus.SUCCESS && (
               <button 
                 onClick={resetTool}
                 className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
               >
                 <Upload className="w-4 h-4" /> Upload Another PDF
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload State */}
        {!file && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
             <div className="text-center mb-8 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                  Delete or Remove PDF Pages <br/>
                  <span className="text-blue-600">Instantly & Securely</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  The most advanced free tool to clean up your documents. 
                  Remove unwanted pages, preview content, and analyze results with AI.
                </p>
             </div>
             
             {status === ProcessStatus.LOADING ? (
               <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-blue-100 dark:border-blue-900 text-center">
                 <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                 <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Analyzing PDF...</h3>
                 <p className="text-gray-500 mb-4">Rendering page previews</p>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
                   <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${loadingProgress}%` }}
                   ></div>
                 </div>
                 <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{loadingProgress}%</span>
               </div>
             ) : (
               <DropZone onFileSelect={handleFileSelect} />
             )}

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center w-full max-w-5xl">
                {[
                  { icon: ShieldCheck, title: "100% Secure", desc: "Files are processed in your browser. No server uploads." },
                  { icon: Zap, title: "Lightning Fast", desc: "Instant rendering and processing for large files." },
                  { icon: Download, title: "High Quality", desc: "Retains original quality of the remaining pages." }
                ].map((feature, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <feature.icon className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Editor State */}
        {file && status !== ProcessStatus.SUCCESS && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-20 z-40">
              <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button onClick={handleSelectAll} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md text-xs font-medium transition-colors" title="Select All">All</button>
                    <button onClick={handleDeselectAll} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md text-xs font-medium transition-colors" title="Clear Selection">None</button>
                    <button onClick={handleInvertSelection} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md text-xs font-medium transition-colors" title="Invert Selection">Invert</button>
                 </div>
                 <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleSelectOdd} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md">Odd</button>
                    <button onClick={handleSelectEven} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md">Even</button>
                 </div>
                 <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                 <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Pages:</span>
                    <input 
                      type="text" 
                      placeholder="e.g. 1-5, 8" 
                      className="w-full px-2 py-1.5 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRangeSelect()}
                    />
                    <button onClick={handleRangeSelect} className="text-blue-600 hover:text-blue-700">
                      <CheckSquare className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                 <div className="flex items-center gap-2">
                    <ZoomOut className="w-4 h-4 text-gray-500 cursor-pointer" onClick={() => setZoomLevel(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP))} />
                    <input 
                      type="range" 
                      min={MIN_ZOOM} 
                      max={MAX_ZOOM} 
                      step={ZOOM_STEP}
                      value={zoomLevel} 
                      onChange={(e) => setZoomLevel(Number(e.target.value))}
                      className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-500 cursor-pointer" onClick={() => setZoomLevel(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))} />
                 </div>
                 
                 <button 
                  onClick={handleDelete}
                  disabled={selectedCount === 0}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95
                    ${selectedCount > 0 
                      ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30' 
                      : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                 >
                   {status === ProcessStatus.ANALYZING ? (
                     <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</span>
                   ) : (
                     <>
                       <Trash2 className="w-4 h-4" />
                       Remove {selectedCount} Pages
                     </>
                   )}
                 </button>
              </div>
            </div>

            {/* Page Grid */}
            <div className="grid gap-6 justify-center pb-20" style={{ 
              gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` 
            }}>
              {pages.map((page) => (
                <div 
                  key={page.id}
                  onClick={() => togglePageSelection(page.id)}
                  className={`
                    relative group cursor-pointer rounded-lg overflow-hidden shadow-md transition-all duration-200
                    ${page.isSelected 
                      ? 'ring-4 ring-red-500 transform scale-95 opacity-75' 
                      : 'hover:ring-4 hover:ring-blue-400 hover:shadow-xl hover:-translate-y-1'
                    }
                  `}
                >
                   {/* Overlay for selected state */}
                   {page.isSelected && (
                     <div className="absolute inset-0 bg-red-900/20 z-10 flex items-center justify-center">
                       <Trash2 className="w-12 h-12 text-red-600 drop-shadow-lg" />
                     </div>
                   )}
                   
                   {/* Page Number Badge */}
                   <div className="absolute top-2 left-2 z-20 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                     Page {page.id}
                   </div>
                   
                   {/* Checkbox for clarity */}
                   <div className={`
                      absolute top-2 right-2 z-20 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                      ${page.isSelected ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}
                   `}>
                      {page.isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                   </div>

                   <img 
                    src={page.imageUrl} 
                    alt={`Page ${page.id}`} 
                    className="w-full h-auto object-contain bg-white"
                    loading="lazy"
                   />
                </div>
              ))}
            </div>
            
            {/* Floating Selection Stats */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-4 z-50 border border-gray-700">
               <span className="text-sm font-medium">
                 {file.name}
               </span>
               <div className="w-px h-4 bg-gray-600"></div>
               <span className="text-sm">
                 <span className="font-bold text-blue-400">{file.pageCount - selectedCount}</span> Kept
               </span>
               <span className="text-sm">
                 <span className="font-bold text-red-400">{selectedCount}</span> Selected
               </span>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === ProcessStatus.SUCCESS && downloadUrl && stats && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
             <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 md:p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckSquare className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PDF Ready!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Your document has been processed successfully.
                  </p>

                  <a 
                    href={downloadUrl} 
                    download={`processed_${file?.name || 'document'}`}
                    className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 mb-12"
                  >
                    <Download className="w-6 h-6" />
                    Download Processed PDF
                  </a>

                  {/* Analytics Section */}
                  <div className="grid md:grid-cols-2 gap-8 items-center border-t border-gray-100 dark:border-gray-700 pt-12 text-left">
                     <div>
                       <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Processing Stats</h3>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Original Pages</span>
                            <span className="font-mono font-bold">{stats.originalPages}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Pages Removed</span>
                            <span className="font-mono font-bold text-red-500">-{stats.deletedPages}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                            <span className="text-gray-800 dark:text-gray-200 font-medium">Final Page Count</span>
                            <span className="font-mono font-bold text-green-600 dark:text-green-400">{stats.keptPages}</span>
                          </div>
                       </div>
                     </div>
                     
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                            />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                        <p className="text-center text-xs text-gray-400 mt-2">Visual Page Distribution</p>
                     </div>
                  </div>

                  {/* Gemini Integration */}
                  <AIReport stats={stats} fileName={file?.name || 'document.pdf'} />

                </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 bg-white dark:bg-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          {/* Footer content removed as requested */}
        </div>
      </footer>
    </div>
  );
};

export default App;