import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Header Component with Logo + Dark/Light Mode Toggle
 * @param {object} props
 * @param {boolean} props.isDemo       Indicates if the app is running in simulated Demo Mode
 * @param {boolean} props.darkMode     Current theme state
 * @param {function} props.onToggleTheme Callback to toggle theme
 */
export default function Header({ isDemo, darkMode, onToggleTheme }) {
  return (
    <header className={`w-full py-4 px-6 md:px-12 flex items-center justify-between border-b sticky top-0 z-40 transition-all duration-300 backdrop-blur-md
      ${darkMode
        ? 'border-slate-700/50 bg-slate-900/80'
        : 'border-slate-200/50 bg-white/60'
      }`}
    >
      {/* Branding */}
      <div className="flex items-center gap-3">
        {/* Logo Image */}
        <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-amber-400/20 bg-white transform hover:scale-105 transition-transform duration-300">
          <img
            src="/logo.png"
            alt="GlobalSpeak logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* App Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className={`font-display font-bold text-xl md:text-2xl leading-none tracking-tight m-0 select-none
              ${darkMode ? 'text-white' : 'text-slate-900'}`}
            >
              GlobalSpeak
            </h1>
            {isDemo && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse-subtle">
                Demo
              </span>
            )}
          </div>
          <p className={`text-[10px] md:text-xs font-sans m-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            SaaS Multilingual AI Translator
          </p>
        </div>
      </div>

      {/* Dark / Light Mode Toggle */}
      <button
        id="theme-toggle-btn"
        onClick={onToggleTheme}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none
          ${darkMode
            ? 'bg-slate-800 border-slate-600 text-amber-400 hover:bg-slate-700 shadow-lg shadow-slate-900/30'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-md shadow-slate-200/60'
          }`}
      >
        {darkMode ? (
          <>
            <FiSun className="w-4 h-4" />
            <span className="hidden sm:inline">Light</span>
          </>
        ) : (
          <>
            <FiMoon className="w-4 h-4" />
            <span className="hidden sm:inline">Dark</span>
          </>
        )}
      </button>
    </header>
  );
}
