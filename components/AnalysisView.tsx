
import React, { useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisViewProps {
  data: AnalysisResult;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (index: number) => {
    setVisibleAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Temporarily show all answers for export
      const originalVisibility = { ...visibleAnswers };
      const allVisible = data.examQuestions.reduce((acc, _, idx) => ({ ...acc, [idx]: true }), {});
      setVisibleAnswers(allVisible);

      // Wait for re-render to ensure all answers are expanded
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        windowWidth: reportRef.current.offsetWidth,
      });

      const imgWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'pt', 'a4');
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CIE_Literature_Report_${data.title.replace(/\s+/g, '_')}.pdf`);
      
      // Restore original visibility state
      setVisibleAnswers(originalVisibility);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to generate PDF. You can also try printing the page (Ctrl+P) and selecting "Save as PDF".');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={reportRef} className="max-w-4xl mx-auto space-y-8 pb-20 pt-4 px-4">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <div className="absolute top-6 right-6 no-print">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isExporting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            {isExporting ? (
              <><i className="fas fa-spinner animate-spin"></i> Generating...</>
            ) : (
              <><i className="fas fa-file-pdf"></i> Export A4 PDF</>
            )}
          </button>
        </div>

        <div className="pt-8 sm:pt-0">
          <h1 className="text-3xl font-bold text-slate-900 serif-font mb-2 uppercase tracking-tight">"{data.title}"</h1>
          <p className="text-xl text-slate-500 italic mb-4">Examining the works of {data.author}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs border border-indigo-100 uppercase tracking-widest">
              CIE GRADE: {data.cieEvaluation.grade}
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-100 uppercase tracking-widest">
              SCORE: {data.cieEvaluation.totalMark} / {data.cieEvaluation.maxMark}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: The Poem */}
        <div className="md:col-span-5">
          <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100 md:sticky md:top-24 shadow-inner">
            <h3 className="text-xs font-black text-amber-800 uppercase tracking-[0.2em] mb-6 border-b border-amber-200 pb-2">Poem Text</h3>
            <pre className="whitespace-pre-wrap serif-font text-lg text-slate-800 leading-relaxed italic">
              {data.ocrContent}
            </pre>
          </div>
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="md:col-span-7 space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-eye text-indigo-500"></i> Critical Reading
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-1">Explicit Meaning</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{data.meaning.explicit}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-1">Implicit Meaning</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{data.meaning.implicit}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-music text-rose-500"></i> Tone & Atmosphere
            </h3>
            <p className="text-slate-600 italic border-l-4 border-rose-200 pl-4 py-2 bg-rose-50/20 rounded-r-lg mb-4">
              {data.tone.description}
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-2">Effectiveness</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{data.tone.effects}</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-feather text-amber-500"></i> AO2: Literary Devices
            </h3>
            <div className="space-y-4">
              {data.literaryDevices.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-indigo-600 text-xs uppercase tracking-wider">{item.device}</span>
                    <span className="text-[10px] italic text-slate-400 font-serif">"{item.example}"</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.effect}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                Structure
              </h4>
              <p className="text-slate-600 text-[13px] leading-relaxed">{data.structure}</p>
            </section>
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                AO4: Context
              </h4>
              <p className="text-slate-600 text-[13px] leading-relaxed">{data.context}</p>
            </section>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-user-edit text-violet-500"></i> AO3: Personal Response
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{data.personalResponse}</p>
          </section>
        </div>
      </div>

      {/* Exam Practice Section */}
      <section className="bg-slate-50 rounded-3xl border-2 border-slate-200 p-10 mt-12">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-slate-200">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <i className="fas fa-pen-nib"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 serif-font">CIE Literature Practice Paper</h3>
        </div>

        <div className="space-y-10">
          {data.examQuestions.map((eq, idx) => (
            <div key={idx} className="relative group">
              <div className="flex gap-4">
                <span className="text-lg font-bold text-indigo-600 serif-font">{idx + 1}.</span>
                <div className="flex-1">
                  <p className="text-lg text-slate-900 serif-font leading-relaxed mb-4">
                    {eq.question} <span className="text-slate-400 text-sm font-sans ml-2">[{eq.marks}]</span>
                  </p>
                  
                  <div className="no-print">
                    <button 
                      onClick={() => toggleAnswer(idx)}
                      className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-all"
                    >
                      {visibleAnswers[idx] ? 'Hide Model Answer' : 'View Model Answer'}
                      <i className={`fas fa-chevron-${visibleAnswers[idx] ? 'up' : 'down'}`}></i>
                    </button>
                  </div>

                  {(visibleAnswers[idx] || isExporting) && (
                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Level 6 Model Response</h5>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap serif-font italic">
                          {eq.modelAnswer}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eq.keyPoints.map((kp, kidx) => (
                          <span key={kidx} className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200">
                            {kp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CIE Grading Deep Dive */}
      <section className="bg-slate-900 text-white rounded-3xl shadow-xl p-10 border border-slate-800">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-slate-700 pb-6">
          <i className="fas fa-graduation-cap text-yellow-400"></i> Summative Examiner Feedback
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">AO1: Knowledge & Context</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{data.cieEvaluation.ao1}</p>
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">AO2: Analysis of Form</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{data.cieEvaluation.ao2}</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">AO3: Evaluation</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{data.cieEvaluation.ao3}</p>
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">AO4: Historical Links</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{data.cieEvaluation.ao4}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h4 className="font-black text-yellow-400 mb-3 uppercase text-[10px] tracking-[0.4em]">Final Assessment Notes</h4>
          <p className="text-slate-300 text-sm italic leading-relaxed font-serif">"{data.cieEvaluation.examinerComments}"</p>
        </div>
        
        <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">
          <span>POETIQUE CIE ADVISORY PANEL</span>
          <span>SYSTEM VERIFIED {new Date().toLocaleDateString()}</span>
        </div>
      </section>
    </div>
  );
};

export default AnalysisView;
