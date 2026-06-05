import React from 'react';

/**
 * LoadingSpinner Component (Dark Theme Only)
 * Displays a premium loading indicator with a rotating circular track and animated skeleton lines.
 */
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 space-y-5 h-full min-h-[220px]">
      {/* Circular Spinner */}
      <div className="relative animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800/60"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      
      {/* SaaS skeleton loading blocks */}
      <div className="w-full max-w-[280px] space-y-3 animate-pulse-subtle">
        <div className="h-2 bg-slate-800 rounded-full w-full"></div>
        <div className="h-2 bg-slate-800 rounded-full w-11/12"></div>
        <div className="h-2 bg-slate-800 rounded-full w-3/4"></div>
      </div>
      
      <p className="text-xs font-semibold text-slate-500 font-sans tracking-wide select-none">
        Translating text...
      </p>
    </div>
  );
}
