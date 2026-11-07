import React from 'react';
import { useKoms, KomsTheme } from '../context/KomsContext';

export const Header: React.FC = () => {
  const { toggleDrawer, currentTheme, tukarTema } = useKoms();

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ background: 'var(--bg-header)', borderBottom: '2px solid var(--accent-color)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-3">
        {/* Left Side Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => toggleDrawer(true)}
            className="btn-action p-2 text-base rounded-lg"
            title="Buka Menu KOMS"
            aria-label="Menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
          >
            <i className="fa-solid fa-graduation-cap text-lg"></i>
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-white truncate tracking-tight">
              KEMAS OPERATIVE MANAGEMENT SYSTEM (KOMS)
            </h1>
          </div>
        </div>

        {/* Right Side Theme Selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentTheme}
            onChange={(e) => tukarTema(e.target.value as KomsTheme)}
            className="filter-select text-xs py-1.5 px-3 rounded-lg cursor-pointer font-medium"
            style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            title="Pilih tema visual"
          >
            <option value="theme-dark">🌙 Dark Mode</option>
            <option value="theme-ocean">🔷 Elegant Dark Blue</option>
            <option value="theme-light">☀️ Minimalist White</option>
          </select>
        </div>
      </div>
    </header>
  );
};
