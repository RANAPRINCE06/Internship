import React from 'react';
import { FiGlobe } from 'react-icons/fi';

/**
 * Header Component (Dark Theme Only)
 * @param {object} props
 * @param {boolean} props.isDemo Indicates if the app is running in simulated Demo Mode
 */
export default function Header({ isDemo }) {
  return (
    <header className="w-full py-5 px-6 md:px-12 flex items-center justify-between border-b border-slate-800/40 bg-slate-900/20 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      
      {/* Branding Info */}
      <div className="flex items-center gap-3">
        {/* Glowing Globe Logo Icon */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-650 shadow-md shadow-sky-500/10 text-white transform hover:rotate-12 transition-transform duration-300">
          <FiGlobe className="w-5 h-5 animate-pulse-subtle" />
        </div>
        
        {/* App Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl md:text-2xl leading-none text-white tracking-tight m-0 select-none">
              GlobalSpeak
            </h1>
            <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15">
              v1.0
            </span>
            {isDemo && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse-subtle">
                Demo
              </span>
            )}
          </div>
          <p className="text-[10px] md:text-xs font-sans text-slate-400 m-0">
            SaaS Multilingual AI Translator
          </p>
        </div>
      </div>

    </header>
  );
}
