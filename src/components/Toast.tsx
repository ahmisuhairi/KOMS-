import React from 'react';
import { useKoms } from '../context/KomsContext';

export const Toast: React.FC = () => {
  const { toast } = useKoms();

  if (!toast.visible) return null;

  return (
    <div
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl transition-all duration-300 animate-slide-up"
      style={{
        background: 'var(--bg-header)',
        border: '1px solid var(--accent-color)',
        color: 'var(--text-main)'
      }}
    >
      <i className="fa-solid fa-circle-check text-emerald-400 text-base"></i>
      <div>
        <b className="block text-xs font-bold leading-tight">{toast.title || 'KOMS Hub'}</b>
        <span className="appos-text-muted text-[11px] block">{toast.message}</span>
      </div>
    </div>
  );
};
