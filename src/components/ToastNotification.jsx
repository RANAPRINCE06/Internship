import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

/**
 * ToastNotification Component (Light Theme)
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
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <FiXCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-800',
      icon: <FiInfo className="w-5 h-5 text-sky-500 flex-shrink-0" />
    }
  };

  const current = config[type] || config.info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl ${current.bg} shadow-lg shadow-slate-200/60 min-w-[280px] max-w-sm`}>
        <div className="flex-shrink-0">{current.icon}</div>
        <div className="flex-grow font-sans text-sm font-medium pr-1 leading-relaxed">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-slate-500 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
