// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-[#060d1a] text-slate-200 selection:bg-teal-500/30">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(100,210,200,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(100,210,200,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <Component {...pageProps} />
    </div>
  );
}