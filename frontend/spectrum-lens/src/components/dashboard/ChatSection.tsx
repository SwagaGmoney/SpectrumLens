"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import ResultsGauge from '@/components/dashboard/ResultsGauge';


interface ChatSectionProps {
  onAnalysisUpdate?: (data: {
    percentage: number;
    recommendation: string;
    age: number | null;
    name: string | null;
  }) => void;
}

export default function ChatSection({ onAnalysisUpdate }: ChatSectionProps) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello, I'm Aria. I'm here to help you navigate and understand behavioral patterns. How can I assist you today?" }
  ]);
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [screeningResults, setScreeningResults] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const formattedHistory = newHistory.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch("https://spectrumlens.onrender.com/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedHistory,
          age: currentAge || 0,
          user_type: "self"
        }),
      });

      if (!response.ok) throw new Error("Agent connection failed");

      const data = await response.json();

      // 2. LOGIC: Update Local Age
      if (data.detected_age) {
        setCurrentAge(data.detected_age);
      }
      if (data.detected_name) {
        setUserName(data.detected_name);
      }

      // 3. LOGIC: Push updates to the Dashboard Sidebar
      if (onAnalysisUpdate) {
        onAnalysisUpdate({
          percentage: data.screening_results?.percentage || 0,
          recommendation: data.content, 
          age: data.detected_age || currentAge,
          name: data.detected_name || userName
        });
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.content }]);

      if (data.is_complete && data.screening_results) {
        setTimeout(() => {
          setScreeningResults(data.screening_results);
        }, 1200);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "System connection error. Please verify the backend is active." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {screeningResults && typeof screeningResults.percentage === 'number' ? (
          <ResultsGauge 
            key="results"
            data={screeningResults} 
            onReset={() => {
                setScreeningResults(null);
                // Optional: Reset dashboard sidebar too
                if(onAnalysisUpdate) onAnalysisUpdate({ percentage: 0, recommendation: "Starting new session...", age: null, name: null  });
            }} 
          />
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col w-full max-h-[80vh] h-150 rounded-2xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#64d2c8]/20 flex items-center justify-center">
                  <Bot size={18} className="text-[#64d2c8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Aria Assistant</h3>
                  <p className="text-[10px] text-[#64d2c8] uppercase tracking-widest font-bold">Neural Engine v1.0</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 w-full overflow-y-auto" ref={scrollRef}>
              <div className="p-6 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-white/10' : 'bg-[#64d2c8]/10 border border-[#64d2c8]/20'
                    }`}>
                      {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-[#64d2c8]" />}
                    </div>
                    <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                      ? 'bg-[#64d2c8] text-[#060d1a] font-semibold' 
                      : 'bg-white/5 border border-white/10 text-slate-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-[#64d2c8]/10 border border-[#64d2c8]/20 flex items-center justify-center">
                      <Loader2 size={14} className="text-[#64d2c8] animate-spin" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs italic">
                      Aria is analyzing patterns...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="shrink-0 p-4 bg-black/40 border-t border-white/10">
              <div className="flex gap-2">
                <Input 
                  placeholder={isLoading ? "Aria is thinking..." : "Type your observations..."}
                  value={input}
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-white/5 border-white/10 focus:border-[#64d2c8]/50 focus:ring-0 text-white placeholder:text-slate-500"
                />
                <Button 
                  disabled={isLoading || !input.trim()}
                  onClick={handleSend} 
                  className="bg-[#64d2c8] hover:bg-[#52b3ab] text-[#060d1a]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}