import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { ProcessingStats } from '../types';

interface AIReportProps {
  stats: ProcessingStats | null;
  fileName: string;
}

export const AIReport: React.FC<AIReportProps> = ({ stats, fileName }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateReport = async () => {
      if (!stats || !process.env.API_KEY) return;
      
      setLoading(true);
      setError(null);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          I just processed a PDF file named "${fileName}".
          Original pages: ${stats.originalPages}.
          Pages deleted: ${stats.deletedPages}.
          Pages kept: ${stats.keptPages}.
          
          Write a short, witty, and professional summary of this action. 
          Mention how much cleaner the document is now. 
          Keep it under 50 words. Use emojis.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        setReport(response.text || 'Document optimized successfully! 🚀');
      } catch (err) {
        console.error("AI Generation Error:", err);
        setReport("Your document has been successfully optimized! 🚀 (AI brain freeze)");
      } finally {
        setLoading(false);
      }
    };

    if (stats) {
      generateReport();
    }
  }, [stats, fileName]);

  if (!stats && !loading) return null;

  return (
    <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-blue-600" />
      </div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md">
          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            AI Summary
            {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {loading ? "Analyzing your changes..." : report}
          </p>
        </div>
      </div>
    </div>
  );
};
