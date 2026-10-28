import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationToast: React.FC = () => {
  const { toastMessage, showToast } = useApp();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const bgColors = {
    success: 'bg-slate-900 border-emerald-500/40 text-emerald-100',
    error: 'bg-slate-900 border-red-500/40 text-red-100',
    info: 'bg-slate-900 border-sky-500/40 text-sky-100',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-xl ${bgColors[toastMessage.type]}`}>
        {icons[toastMessage.type]}
        <p className="text-xs font-medium text-slate-200">{toastMessage.text}</p>
        <button
          onClick={() => showToast('', 'info')}
          className="text-slate-400 hover:text-slate-200 ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
