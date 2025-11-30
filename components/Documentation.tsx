import React from 'react';
import { BookOpen, Shield, Zap, FileOutput, Brain, LayoutGrid, Download, MousePointerClick, Layers } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="text-center mb-12 pt-8">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          How to Use PDF Page Remover
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A professional guide to cleaning up your PDF documents securely, efficiently, and for free.
        </p>
      </div>

      <div className="space-y-12">
        {/* Quick Start Guide */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Step-by-Step Guide
            </h3>
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">1</div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Upload Your PDF</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Drag & drop your file into the designated area or click to browse. We support large files up to 100MB with instant loading.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">2</div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Select Pages to Remove</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Click on any page thumbnail to mark it for deletion. Selected pages will turn red with a trash icon overlay.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                    <MousePointerClick className="w-3 h-3" /> Manual Click
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                    <Layers className="w-3 h-3" /> Range Selection
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">3</div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Process & Download</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Click the "Remove Pages" button. In seconds, view your analytics, AI summary, and download your optimized PDF.
                            </p>
                        </div>
                    </div>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                    <LayoutGrid className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Visual Grid Interface</h5>
                    <p className="text-sm text-gray-500 max-w-xs">
                        Our tool renders every page of your PDF so you can see exactly what you are deleting. Zoom in/out for better control.
                    </p>
                 </div>
            </div>
        </section>

        {/* Features Grid */}
        <section>
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Power-Packed Features</h3>
             <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard 
                    icon={Shield} 
                    title="100% Client-Side Secure" 
                    desc="Your files never leave your browser. Processing happens locally on your device, ensuring maximum privacy for sensitive documents." 
                />
                <FeatureCard 
                    icon={Zap} 
                    title="Lightning Fast" 
                    desc="Since there are no server uploads, large files are analyzed and processed instantly using advanced WebAssembly technology." 
                />
                <FeatureCard 
                    icon={Brain} 
                    title="AI-Powered Summary" 
                    desc="Get intelligent insights about your document changes powered by the latest Gemini AI models." 
                />
                <FeatureCard 
                    icon={LayoutGrid} 
                    title="Smart Selection Tools" 
                    desc="Use advanced range selectors (e.g., '1-5, 10'), select odd/even pages, or invert selection with a single click." 
                />
                <FeatureCard 
                    icon={Download} 
                    title="Detailed Analytics" 
                    desc="Visualize your optimization with interactive charts showing pages kept vs. deleted." 
                />
                <FeatureCard 
                    icon={FileOutput} 
                    title="High Quality Output" 
                    desc="We preserve the original quality, formatting, and metadata of your remaining pages." 
                />
             </div>
        </section>

        {/* Benefits Section */}
         <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Why Professionals Choose This Tool</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="bg-white/20 p-1 rounded-full mt-1">
                                <Shield className="w-4 h-4" />
                            </div>
                            <span><strong>No Data Leakage:</strong> Perfect for legal, medical, or financial documents where privacy is paramount.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="bg-white/20 p-1 rounded-full mt-1">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span><strong>Zero Wait Time:</strong> No queuing for server processing. It works as fast as your computer allows.</span>
                        </li>
                    </ul>
                     <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="bg-white/20 p-1 rounded-full mt-1">
                                <Download className="w-4 h-4" />
                            </div>
                            <span><strong>Free Forever:</strong> Access enterprise-grade PDF manipulation features without subscriptions or watermarks.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="bg-white/20 p-1 rounded-full mt-1">
                                <Brain className="w-4 h-4" />
                            </div>
                            <span><strong>Modern Experience:</strong> A beautiful, responsive interface that works great on desktop and mobile.</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);