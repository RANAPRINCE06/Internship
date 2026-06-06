import React from 'react';

/**
 * Footer Component (Dark Theme Only)
 */
export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full mt-auto py-8 px-6 border-t border-slate-200/50 bg-slate-100/55 text-slate-500 text-xs transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left info */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-sans font-medium text-slate-700">
            © {currentYear} GlobalSpeak Translation Hub. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500">
            Powered by RapidAPI & Advanced Web Speech Systems
          </p>
        </div>

        {/* Right developer info */}
        <div className="text-center md:text-right">
          <p className="text-[11px] text-slate-500">
            Designed for high performance & accessibility.
          </p>
        </div>

      </div>
    </footer>
  );
}
