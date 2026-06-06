import React from 'react';
import { FiTrash2, FiClock, FiCornerDownLeft, FiDownload, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getLanguageName } from '../utils/languages';
import { formatTimestamp } from '../utils/helpers';

/**
 * TranslationHistory Component (Light Theme with Framer Motion)
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
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-200/60 bg-white/60">
        <div className="flex flex-col items-center gap-2 py-4">
          <FiClock className="w-8 h-8 text-slate-300 animate-pulse-subtle" />
          <h3 className="font-sans font-semibold text-slate-500 text-sm">
            No translation history
          </h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
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
          <h2 className="font-display font-semibold text-slate-800 text-base md:text-lg m-0">
            Translation History
          </h2>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
            {history.length}/20
          </span>
        </div>
        <div className="flex items-center gap-2">
          
          {/* Export JSON logs */}
          <button
            onClick={handleExportHistory}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-500 hover:text-sky-600 transition-colors cursor-pointer focus:outline-none"
            title="Export history logs to JSON"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          
          <span className="text-slate-300">|</span>

          {/* Delete all logs */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your translation history?")) {
                onClearAll();
                onShowToast("Translation history cleared.", "info");
              }
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-500 transition-colors cursor-pointer focus:outline-none"
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
              whileHover={{ y: -5, scale: 1.02, boxShadow: '0 16px 40px -12px rgba(14,165,233,0.18)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="group glass-panel rounded-2xl p-4 flex flex-col gap-3 relative border border-slate-200/60 bg-white/70 hover:border-sky-400/40 transition-colors duration-300"
            >
              
              {/* Card Meta */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-medium text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold uppercase text-[10px] text-slate-600">
                    {item.sourceLang.startsWith('auto') ? 'Auto' : item.sourceLang}
                  </span>
                  <FiChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200/60 text-sky-600 font-semibold uppercase text-[10px]">
                    {item.targetLang}
                  </span>
                </div>
                <span className="font-sans font-normal text-slate-400">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Translation Content */}
              <div className="space-y-2.5">
                <div className="text-xs font-normal text-slate-400 line-clamp-2 italic pr-6 break-words">
                  "{item.originalText}"
                </div>
                <div className="text-sm font-semibold text-slate-700 line-clamp-3 break-words">
                  {item.translatedText}
                </div>
              </div>

              {/* Hover Actions Panel */}
              <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-2.5 mt-auto">
                {/* Restore / Apply */}
                <button
                  onClick={() => {
                    onReuse(item);
                    onShowToast("Translation restored to workspace.", "success");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-sky-500 hover:text-white border border-slate-200 hover:border-sky-500 transition-colors text-[11px] font-semibold text-slate-600 cursor-pointer focus:outline-none"
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
                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-200/60 transition-all cursor-pointer focus:outline-none"
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
