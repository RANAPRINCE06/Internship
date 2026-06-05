import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

/**
 * ToastNotification Component (Dark SaaS Theme)
 * @param {object} props
 * @param {{message: string, type: 'success'|'error'|'info'}|null} props.toast
 * @param {Function} props.onClose
 */
export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast && toast.message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast || !toast.message) return null;

  const { message, type = 'success' } = toast;

  const config = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-800/40 text-emerald-200',
      icon: <FiCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-800/40 text-rose-200',
      icon: <FiXCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
    },
    info: {
      bg: 'bg-sky-950/90 border-sky-800/40 text-sky-200',
      icon: <FiInfo className="w-5 h-5 text-sky-450 flex-shrink-0" />
    }
  };

  const current = config[type] || config.info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl ${current.bg} shadow-2xl shadow-black/40 min-w-[280px] max-w-sm`}>
        <div className="flex-shrink-0">{current.icon}</div>
        <div className="flex-grow font-sans text-sm font-medium pr-1 leading-relaxed">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-400 hover:text-slate-200"
          aria-label="Dismiss notification"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
