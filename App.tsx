
import React, { useState, useRef } from 'react';
import { analyzePoem } from './services/geminiService';
import { AnalysisResult, AnalysisStatus } from './types';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setStatus(AnalysisStatus.PROCESSING);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const analysis = await analyzePoem(base64);
      setResult(analysis);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze the poem. Please try again with a clearer image.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <i className="fas fa-quill-pen text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent uppercase italic">Poetique</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">CIE Examiner Module</span>
            {status !== AnalysisStatus.IDLE && (
              <button 
                onClick={reset}
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        {status === AnalysisStatus.IDLE && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 max-w-2xl serif-font">
              Unlock Deep Literary Insights with <span className="text-indigo-600">AI-Powered</span> Analysis
            </h2>
            <p className="text-lg text-slate-500 mb-10 max-w-xl leading-relaxed">
              Upload an image of a poem. Our system evaluates language, structure, tone, and context against CIE marking standards to provide expert-level analysis.
            </p>

            <div 
              onClick={triggerUpload}
              className="group relative cursor-pointer w-full max-w-lg bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
                  <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 group-hover:text-indigo-500"></i>
                </div>
                <p className="font-bold text-slate-700 mb-1">Upload Poem Image</p>
                <p className="text-sm text-slate-400">Supports PNG, JPG, or PDF snippets</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden" 
              />
            </div>

            <div className="mt-12 flex gap-8 items-center justify-center text-slate-400">
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span className="text-xs font-bold uppercase tracking-wider">CIE Mark Scheme</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span className="text-xs font-bold uppercase tracking-wider">AO1-AO4 Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Tone & Context</span>
              </div>
            </div>
          </div>
        )}

        {status === AnalysisStatus.PROCESSING && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 mb-8 relative">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-search text-indigo-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Literary Structures...</h3>
            <p className="text-slate-500 max-w-md">Our AI examiner is scanning the poem, identifying literary devices, and evaluating against CIE standards. This usually takes 10-15 seconds.</p>
            
            <div className="mt-12 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 animate-pulse">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                   <div className="flex-1 space-y-2 py-1">
                     <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                     <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500 text-3xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Analysis Failed</h3>
            <p className="text-slate-500 mb-8 max-w-sm">{error}</p>
            <button 
              onClick={reset}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Try Another Image
            </button>
          </div>
        )}

        {status === AnalysisStatus.COMPLETED && result && (
          <AnalysisView data={result} />
        )}
      </main>

      {/* Floating Action Button for mobile */}
      {status === AnalysisStatus.COMPLETED && (
        <button 
          onClick={reset}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all z-50 md:hidden"
        >
          <i className="fas fa-redo"></i>
        </button>
      )}

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  );
};

export default App;
