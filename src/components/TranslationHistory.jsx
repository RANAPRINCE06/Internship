import React from 'react';
import { FiTrash2, FiClock, FiCornerDownLeft, FiDownload, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getLanguageName } from '../utils/languages';
import { formatTimestamp } from '../utils/helpers';

/**
 * TranslationHistory Component (Dark Theme with Framer Motion)
 */
export default function TranslationHistory({
  history = [],
  onReuse,
  onDelete,
  onClearAll,
  onShowToast
}) {
  const handleExportHistory = () => {
    if (history.length === 0) return;
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `globalspeak_history_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast("History exported successfully!", "success");
    } catch (error) {
      onShowToast("Failed to export history.", "error");
    }
  };

  if (history.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800/40 bg-slate-900/30">
        <div className="flex flex-col items-center gap-2 py-4">
          <FiClock className="w-8 h-8 text-slate-700 animate-pulse-subtle" />
          <h3 className="font-sans font-semibold text-slate-350 text-sm">
            No translation history
          </h3>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Your translations will appear here so you can access and restore them later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-sky-500" />
          <h2 className="font-display font-semibold text-white text-base md:text-lg m-0">
            Translation History
          </h2>
          <span className="text-[11px] font-bold bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md">
            {history.length}/20
          </span>
        </div>
        <div className="flex items-center gap-2">
          
          {/* Export JSON logs */}
          <button
            onClick={handleExportHistory}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer focus:outline-none"
            title="Export history logs to JSON"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          
          <span className="text-slate-700">|</span>

          {/* Delete all logs */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your translation history?")) {
                onClearAll();
                onShowToast("Translation history cleared.", "info");
              }
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-455 hover:text-rose-400 transition-colors cursor-pointer focus:outline-none"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Grid of history cards with Framer Motion animate exit and layout shift */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1"
      >
        <AnimatePresence initial={false}>
          {history.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="group glass-panel rounded-2xl p-4 flex flex-col gap-3 relative border border-slate-800/40 hover:border-sky-500/20 hover:shadow-md transition-all duration-300"
            >
              
              {/* Card Meta */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/30 pb-2">
                <div className="flex items-center gap-1.5 font-medium text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 font-semibold uppercase text-[10px]">
                    {item.sourceLang.startsWith('auto') ? 'Auto' : item.sourceLang}
                  </span>
                  <FiChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold uppercase text-[10px]">
                    {item.targetLang}
                  </span>
                </div>
                <span className="font-sans font-normal text-slate-500">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Translation Content */}
              <div className="space-y-2.5">
                <div className="text-xs font-normal text-slate-450 line-clamp-2 italic pr-6 break-words">
                  "{item.originalText}"
                </div>
                <div className="text-sm font-semibold text-slate-200 line-clamp-3 break-words">
                  {item.translatedText}
                </div>
              </div>

              {/* Hover Actions Panel */}
              <div className="flex items-center justify-end gap-1 border-t border-slate-800/30 pt-2.5 mt-auto">
                {/* Restore / Apply */}
                <button
                  onClick={() => {
                    onReuse(item);
                    onShowToast("Translation restored to workspace.", "success");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-sky-550 hover:text-white transition-colors text-[11px] font-semibold text-slate-350 cursor-pointer focus:outline-none"
                  title="Restore text to editor"
                >
                  <FiCornerDownLeft className="w-3 h-3" />
                  <span>Restore</span>
                </button>

                {/* Single Delete */}
                <button
                  onClick={() => {
                    onDelete(item.id);
                    onShowToast("History item removed.", "info");
                  }}
                  className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all cursor-pointer focus:outline-none"
                  title="Delete item"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}
