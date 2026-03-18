"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ResultsGaugeProps {
  data: {
    percentage: number;
    category: string;
    scale_used: string;
    clinical_cutoff_met?: boolean;
    score_raw?: string;
    traits_found?: string[]; // Included for the enhanced summary
  };
  onReset: () => void;
}

export default function ResultsGauge({ data, onReset }: ResultsGaugeProps) {
  if (!data) return null;

  const getColor = (category: string) => {
    switch (category) {
      case 'Low': return '#22c55e'; // Success Green
      case 'Middle': return '#eab308'; // Amber
      case 'High': return '#f97316'; // Orange
      case 'Extreme': return '#ef4444'; // Red
      default: return '#6366f1';
    }
  };

  const statusColor = getColor(data.category);

  const getDetailedFeedback = (category: string) => {
    const feedbackMap: Record<string, string> = {
      'Low': "Observations suggest behavioral patterns are within typical developmental ranges.",
      'Middle': "Notable markers detected. While sub-clinical, these patterns may benefit from monitoring.",
      'High': "Significant pattern match detected. Alignment with ASD clinical thresholds is observed.",
      'Extreme': "Highly consistent behavioral markers identified. Formal diagnostic assessment is recommended."
    };
    return feedbackMap[category] || feedbackMap['Low'];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-6xl mx-auto"
    >
      {/* Left Column: Visual Gauge */}
      <div className="md:col-span-7 lg:col-span-8 relative flex flex-col items-center justify-center p-10 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center overflow-hidden">
        {/* Decorative Background Glow */}
        <div 
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: statusColor }}
        />
        
        <div className="relative z-10 mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Screening Complete</h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Neural Assessment Analytics</p>
        </div>

        <div className="relative flex items-center justify-center my-10">
          <svg className="w-72 h-72 transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <circle 
              cx="144" cy="144" r="130" 
              stroke="currentColor" strokeWidth="16" 
              fill="transparent" className="text-white/5" 
            />
            <motion.circle
              cx="144" cy="144" r="130"
              stroke={statusColor}
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={816}
              initial={{ strokeDashoffset: 816 }}
              animate={{ strokeDashoffset: 816 - (816 * data.percentage) / 100 }}
              transition={{ duration: 2, ease: "circOut" }}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${statusColor}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="text-center"
            >
              <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                {Math.round(data.percentage)}%
              </span>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold mt-1">Likelihood</p>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl text-left max-w-lg transition-colors hover:bg-white/10">
          <AlertCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            <span className="text-slate-200 font-bold">Disclaimer:</span> This AI-powered screening is a preliminary tool and does not constitute a clinical diagnosis. Please consult a licensed healthcare professional for a formal assessment.
          </p>
        </div>
      </div>

      {/* Right Column: Insights & Actions */}
      <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
        <div className="flex-1 p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Info size={14} className="text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Executive Summary</h3>
            </div>
            <span 
              className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border animate-pulse"
              style={{ 
                backgroundColor: `${statusColor}15`, 
                color: statusColor, 
                borderColor: `${statusColor}40` 
              }}
            >
              {data.category}
            </span>
          </div>

          <div className="space-y-8 flex-1">
            {/* Probability Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Detection Confidence</p>
                <span className="text-sm font-bold text-white tabular-nums">{Math.round(data.percentage)}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full p-0.5 overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.percentage}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full rounded-full relative shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  style={{ backgroundColor: statusColor }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent" />
                </motion.div>
              </div>
            </div>

            {/* Insight Text */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {getDetailedFeedback(data.category)}
                </p>
              </div>

              {/* Trait Tags */}
              <div className="space-y-3 px-1">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Identified Markers</p>
                <div className="flex flex-wrap gap-2">
                  {(data.traits_found || ["Sensory", "Social", "Routine"]).map((trait, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold hover:bg-white/10 transition-colors cursor-default"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Methodology Context */}
            <div className="pt-6 border-t border-white/5 mt-auto">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Scale: {data.scale_used}</span>
                </div>
                {data.score_raw && (
                   <span className="text-[10px] font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                   RAW {data.score_raw}
                 </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            className="w-full bg-white text-slate-950 hover:bg-slate-200 font-black h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98] cursor-pointer group"
          >
            <FileText size={18} className="mr-3 transition-transform group-hover:rotate-6" /> 
            Generate Clinical PDF
          </Button>
          <Button 
            variant="ghost" 
            onClick={onReset}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold h-14 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCcw size={18} className="mr-3 text-slate-400" /> 
            New Assessment
          </Button>
        </div>
      </div>
    </motion.div>
  );
}