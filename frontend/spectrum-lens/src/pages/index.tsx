"use client";

import Head from 'next/head';
import { useState } from 'react';
import ChatSection from '@/components/dashboard/ChatSection';

export default function Dashboard() {
 
  const [activeAnalysis, setActiveAnalysis] = useState<{
    percentage: number;
    recommendation: string;
    age: number | null;
    name: string | null;
  }>({
    percentage: 0,
    recommendation: "Aria is currently listening for behavioral patterns. Start chatting to see the analysis.",
    age: null,
    name: null
  });

  return (
    <div className="relative z-10 p-6 max-w-7xl mx-auto">
      <Head>
        <title>SpectrumLens | Insights</title>
      </Head>

      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            Spectrum<span className="text-[#64d2c8]">Lens</span>
          </h1>
          <p className="text-slate-400 text-sm">Behavioral Pattern Analysis</p>
        </div>
        <div className="px-4 py-2 rounded-full border border-[#64d2c8]/20 bg-[#64d2c8]/5 text-[#64d2c8] text-xs font-bold uppercase tracking-widest">
            {activeAnalysis.name !== null || activeAnalysis.age !== null ? (
              <>
                Session: {activeAnalysis.name || "Patient"} 
                {activeAnalysis.age !== null ? `, ${activeAnalysis.age}yr old` : ""}
              </>
            ) : (
              "Aria Active"
            )}
          </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Chat Area - Left side */}
        <div className="md:col-span-8">
          {/* We pass setActiveAnalysis so the chat can update the dashboard */}
          <ChatSection onAnalysisUpdate={setActiveAnalysis} />
        </div>

        {/* Intelligence Sidebar - Right side */}
        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl border-t-[#64d2c8]/20">
            <h3 className="text-sm font-semibold mb-6 text-[#64d2c8] uppercase tracking-wider">Live Recommendation</h3>
            
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <p className="text-[10px] text-slate-500 uppercase">Analysis Confidence</p>
                   <span className="text-xs font-bold text-white">{activeAnalysis.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#64d2c8] transition-all duration-1000 ease-out shadow-[0_0_10px_#64d2c8]" 
                    style={{ width: `${activeAnalysis.percentage}%` }} 
                  />
                </div>
              </div>

              {/* Dynamic Recommendation Text */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-slate-300 leading-relaxed italic antialiased">
                  "{activeAnalysis.recommendation}"
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 pt-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeAnalysis.percentage > 0 ? 'bg-[#64d2c8]' : 'bg-slate-600'}`} />
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                  {activeAnalysis.percentage > 70 ? "High Likelihood Detected" : "Processing Neural Input..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}