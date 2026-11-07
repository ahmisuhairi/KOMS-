import React from 'react';
import { useKoms, KomsModule, KomsTheme } from '../context/KomsContext';

export const Drawer: React.FC = () => {
  const {
    isDrawerOpen,
    toggleDrawer,
    tukarModul,
    tukarTema,
    currentTheme,
    exportXLSX,
    setShowGasCodeModal,
    resetAllData,
    classes,
    staff,
    assignments,
    issues
  } = useKoms();

  if (!isDrawerOpen) return null;

  const themes: Array<{ id: KomsTheme; label: string; icon: string; bg?: string; text?: string }> = [
    { id: 'theme-dark', label: 'Dark Mode', icon: '🌙', bg: '#0B0F19', text: '#F8FAFC' },
    { id: 'theme-ocean', label: 'Dark Blue', icon: '🔷', bg: '#0A192F', text: '#38BDF8' },
    { id: 'theme-light', label: 'Minimalist', icon: '☀️', bg: '#FFFFFF', text: '#0F172A' }
  ];

  const handleNav = (mod: KomsModule) => {
    tukarModul(mod);
    toggleDrawer(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={() => toggleDrawer(false)}
      />

      {/* Drawer Panel */}
      <div
        className="relative w-80 max-w-[85vw] h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-4"
        style={{
          background: 'var(--bg-header)',
          borderRight: '1px solid var(--accent-color)',
          color: 'var(--text-main)'
        }}
      >
        <div className="flex flex-col gap-4">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-blue-600 text-sm">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div>
                <b className="text-xs text-white block">Menu Konsol KOMS</b>
                <span className="text-[10px] font-mono" style={{ color: 'var(--accent-color)' }}>
                  Live Field Hub
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleDrawer(false)}
              className="text-gray-400 hover:text-white p-1 text-lg"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* User Profile Info Card */}
          <div className="appos-card-subtle p-3 rounded-xl border border-[var(--border-color)]">
            <div className="flex justify-between items-center mb-1">
              <b className="text-xs text-white">Ku Ahmisuhairi Bin Ku Ahmad</b>
              <span className="badge-status badge-live">LIVE</span>
            </div>
            <span className="appos-text-muted font-mono text-[9.5px]">
              Sovereign Architect • MyGovUC
            </span>
            <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[10.5px]">
              <span className="appos-text-muted">Pangkalan Data SSOT</span>
              <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                {classes.length} premis • {staff.length} staf
              </span>
            </div>
          </div>

          {/* Theme Palette Chooser */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9.5px] uppercase font-bold tracking-wider" style={{ color: 'var(--accent-color)' }}>
              Pilihan Tema Visual (3):
            </span>
            <div className="grid grid-template-columns grid-cols-3 gap-1.5">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => tukarTema(t.id)}
                  className={`btn-action text-[10.5px] py-1.5 px-1 justify-center rounded-lg ${
                    currentTheme === t.id ? 'ring-2 ring-[var(--accent-color)] font-extrabold' : ''
                  }`}
                  style={{
                    backgroundColor: t.bg || undefined,
                    color: t.text || undefined
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[9.5px] uppercase font-bold tracking-wider" style={{ color: 'var(--accent-color)' }}>
              Navigasi Modul:
            </span>
            <button
              onClick={() => handleNav('utama')}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-house w-5 text-blue-400"></i>
              <span>Utama • Dashboard</span>
            </button>
            <button
              onClick={() => handleNav('kelas')}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-school w-5 text-blue-400"></i>
              <span>Kelas • {classes.length} Premis SSOT</span>
            </button>
            <button
              onClick={() => handleNav('staff')}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-users w-5 text-emerald-400"></i>
              <span>Staff • {staff.length} Kakitangan</span>
            </button>
            <button
              onClick={() => handleNav('penugasan')}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-link w-5 text-amber-400"></i>
              <span>Tugas • {assignments.length} Penugasan</span>
            </button>
            <button
              onClick={() => handleNav('kerosakan')}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-wrench w-5 text-rose-400"></i>
              <span>Kerosakan • {issues.length} Isu</span>
            </button>
            <button
              onClick={() => handleNav('peta')}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-map-location-dot w-5 text-cyan-400"></i>
              <span>Peta GIS • 15 DUN Perlis</span>
            </button>
          </div>

          {/* Quick Tools & Downloads */}
          <div className="flex flex-col gap-1.5 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="text-[9.5px] uppercase font-bold tracking-wider" style={{ color: 'var(--accent-color)' }}>
              Alat &amp; Muat Turun:
            </span>
            <button
              onClick={() => {
                setShowGasCodeModal(true);
                toggleDrawer(false);
              }}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-code w-5 text-amber-400"></i>
              <span>Lihat &amp; Salin Fail GAS (Code.gs, dll)</span>
            </button>
            <button
              onClick={() => {
                exportXLSX();
                toggleDrawer(false);
              }}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg"
            >
              <i className="fa-solid fa-file-excel w-5 text-emerald-400"></i>
              <span>Eksport Excel (.xlsx) Lengkap</span>
            </button>
            <button
              onClick={() => {
                resetAllData();
                toggleDrawer(false);
              }}
              className="btn-action w-full justify-start text-left py-2 px-3 rounded-lg text-rose-400 border-rose-900/40 hover:bg-rose-950/40"
            >
              <i className="fa-solid fa-rotate-left w-5"></i>
              <span>Set Semula Data Asal SSOT</span>
            </button>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="pt-3 mt-4 text-[9.5px] font-mono leading-tight appos-text-muted" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="font-bold text-white">KOMS v1.0 • Production Ready</p>
          <p style={{ color: 'var(--accent-color)' }}>Created by: AppOS • Ku Ahmisuhairi</p>
        </div>
      </div>
    </div>
  );
};
