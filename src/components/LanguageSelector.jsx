import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiStar, FiClock, FiCheck, FiChevronDown, FiGlobe } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '../utils/languages';

/**
 * LanguageSelector Component (Dark theme with Framer Motion)
 */
export default function LanguageSelector({
  selectedLang,
  onChange,
  excludeAuto = false,
  favorites = [],
  onToggleFavorite,
  recentLangs = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter languages based on search query
  const filteredLanguages = LANGUAGES.filter((lang) => {
    if (excludeAuto && lang.code === 'auto') return false;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.group.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  // Default tabs if no favorites are set
  const defaultTabCodes = excludeAuto 
    ? ['es', 'fr', 'de', 'hi', 'ja']
    : ['auto', 'en', 'hi', 'es', 'fr'];
  
  const activeTabCodes = favorites.length > 0 
    ? (excludeAuto ? favorites : ['auto', ...favorites]).slice(0, 6)
    : defaultTabCodes;

  // Enforce selected language in tabs
  const displayTabs = [...activeTabCodes];
  if (selectedLang && !displayTabs.includes(selectedLang)) {
    if (displayTabs.length > 5) {
      displayTabs[displayTabs.length - 1] = selectedLang;
    } else {
      displayTabs.push(selectedLang);
    }
  }

  const handleSelectLanguage = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getLanguageLabel = (code) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  // Group languages by region/group
  const groupedLanguages = filteredLanguages.reduce((acc, lang) => {
    if (lang.code === 'auto') return acc;
    if (!acc[lang.group]) {
      acc[lang.group] = [];
    }
    acc[lang.group].push(lang);
    return acc;
  }, {});

  return (
    <div className="w-full" ref={dropdownRef}>
      
      {/* Selector Header Bar with Quick Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/40 pb-3">
        {displayTabs.map((code) => {
          const isTabActive = selectedLang === code;
          const langObj = LANGUAGES.find(l => l.code === code);
          if (!langObj) return null;

          return (
            <button
              key={code}
              type="button"
              onClick={() => handleSelectLanguage(code)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
                isTabActive
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {langObj.code === 'auto' ? 'Auto Detect' : langObj.name}
            </button>
          );
        })}

        {/* More Languages Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium border border-slate-700/50 bg-slate-900/40 text-slate-300 hover:bg-slate-900/80 hover:border-slate-650 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
              isOpen ? 'border-sky-500 ring-2 ring-sky-500/10' : ''
            }`}
          >
            <FiGlobe className="w-3.5 h-3.5 text-slate-500" />
            <span>More Languages</span>
            <FiChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Popover Animate Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 mt-2 w-72 md:w-80 rounded-xl border border-slate-700/60 shadow-2xl shadow-black/50 bg-slate-900 z-50 overflow-hidden glass-dropdown max-h-[420px] flex flex-col"
              >
                
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-800/40 flex items-center gap-2 bg-slate-900/40">
                  <FiSearch className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:ring-0"
                    autoFocus
                  />
                </div>

                {/* Scrollable Language List */}
                <div className="overflow-y-auto flex-grow p-2 space-y-3">
                  {/* Recent Languages */}
                  {recentLangs.length > 0 && !searchQuery && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <FiClock className="w-3 h-3" />
                        <span>Recently Used</span>
                      </div>
                      {recentLangs
                        .filter(code => !excludeAuto || code !== 'auto')
                        .slice(0, 3)
                        .map((code) => {
                          const lang = LANGUAGES.find(l => l.code === code);
                          if (!lang) return null;
                          return renderLanguageRow(lang);
                        })}
                    </div>
                  )}

                  {/* Auto Detect (if source selector) */}
                  {!excludeAuto && !searchQuery && (
                    <div className="space-y-1">
                      {renderLanguageRow(LANGUAGES.find(l => l.code === 'auto'))}
                    </div>
                  )}

                  {/* Grouped Regions */}
                  {filteredLanguages.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No languages found
                    </div>
                  ) : (
                    Object.keys(groupedLanguages).map((groupName) => (
                      <div key={groupName} className="space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {groupName}
                        </div>
                        {groupedLanguages[groupName].map((lang) => renderLanguageRow(lang))}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  function renderLanguageRow(lang) {
    if (!lang) return null;
    const isSelected = selectedLang === lang.code;
    const isFavorite = favorites.includes(lang.code);

    return (
      <div
        key={lang.code}
        className={`group/row flex items-center justify-between px-2.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:bg-slate-800 ${
          isSelected
            ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-500 pl-1.5'
            : 'text-slate-350 hover:bg-slate-800/60 hover:text-slate-100'
        }`}
        onClick={() => handleSelectLanguage(lang.code)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isSelected ? (
            <FiCheck className="w-4 h-4 text-sky-450 flex-shrink-0" />
          ) : (
            <div className="w-4" />
          )}
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="truncate">{lang.name}</span>
            {lang.code !== 'auto' && (
              <span className="text-[10px] text-slate-550 font-normal truncate">
                {lang.nativeName}
              </span>
            )}
          </div>
        </div>

        {/* Star icon */}
        {lang.code !== 'auto' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(lang.code);
            }}
            className={`p-1.5 rounded-md hover:bg-slate-700/50 transition-colors ${
              isFavorite
                ? 'text-amber-500 opacity-100'
                : 'text-slate-600 opacity-0 group-hover/row:opacity-100 hover:text-slate-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiStar className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>
        )}
      </div>
    );
  }
}
