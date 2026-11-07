import React from 'react';
import { useKoms } from '../context/KomsContext';
import {
  lookupStatusBgn,
  lookupStatusTanah,
  classIdKey,
  isAssignmentActive,
  PAR_NAMES
} from '../utils/komsConstants';

export const UtamaDashboard: React.FC = () => {
  const {
    classes,
    staff,
    assignments,
    issues,
    statusBgn,
    statusTanah,
    tukarModul,
    setKelasExtraFilter,
    setStaffExtraFilter
  } = useKoms();

  // Active assignment set
  const activeAssignments = assignments.filter(isAssignmentActive);
  const activeClassIdSet = new Set<string>();
  activeAssignments.forEach(a => {
    const k = classIdKey(a.ClassID);
    if (k) activeClassIdSet.add(k);
    if (a.ClassID) activeClassIdSet.add(a.ClassID.trim());
  });

  const kelasAdaStafCount = classes.filter(c => {
    const cid = (c.ClassID || '').trim();
    return activeClassIdSet.has(cid) || activeClassIdSet.has(classIdKey(cid));
  }).length;

  const kelasTiadaStafCount = classes.length - kelasAdaStafCount;

  // Staf tanpa penempatan kelas
  const assignedStaffIdSet = new Set<string>();
  activeAssignments.forEach(a => {
    if (a.StaffID) assignedStaffIdSet.add(String(a.StaffID).trim());
  });
  const stafTanpaKelasCount = staff.filter(s => !assignedStaffIdSet.has(String(s.StaffID || '').trim())).length;

  const openIssuesCount = issues.filter(i => i.Status !== 'Selesai').length;

  // Breakdown by division for KPI subtext
  const pakCount = classes.filter(c => c.DivisionID === 'PAK').length;
  const pkemCount = classes.filter(c => c.DivisionID === 'PKEM').length;
  const pkomCount = classes.filter(c => c.DivisionID === 'PKOM').length;

  // Helper count reducer
  const countBy = <T,>(arr: T[], keyFn: (item: T) => string): Record<string, number> => {
    const res: Record<string, number> = {};
    arr.forEach(item => {
      const k = keyFn(item) || '—';
      res[k] = (res[k] || 0) + 1;
    });
    return res;
  };

  // Status Bangunan counts
  const bgnCounts = countBy(classes, c => lookupStatusBgn(c['Status Bangunan'], statusBgn));

  // Status Tanah counts
  const tanahCounts = countBy(classes, c => lookupStatusTanah(c['Status Milik Tanah'], statusTanah));

  // Parlimen Kelas counts
  const parKelasCounts = countBy(classes, c => {
    const code = c['Kod Parlimen'] || (c.Parlimen ? c.Parlimen.split(' ')[0] : '');
    return code || 'Lain-lain';
  });

  // Parlimen Staff counts
  const parStaffCounts = countBy(staff, s => {
    const p = s.ParlimenID || '';
    if (p.startsWith('P.001')) return 'P.001';
    if (p.startsWith('P.002')) return 'P.002';
    if (p.startsWith('P.003')) return 'P.003';
    return p || 'Lain-lain';
  });

  // Status Lantikan counts
  const lantikanKontrakCount = staff.filter(s => {
    const st = String(s['Status Lantikan'] || s.StatusLantikan || '').trim().toLowerCase();
    return st === 'kontrak';
  }).length;

  const lantikanJsktCount = staff.filter(s => {
    const st = String(s['Status Lantikan'] || s.StatusLantikan || '').trim().toLowerCase();
    return st === 'jskt';
  }).length;

  // Action handlers
  const handleFilterClasses = (type: any, value?: string) => {
    setKelasExtraFilter({ type, value });
    tukarModul('kelas');
  };

  const handleFilterStaff = (type: any, value?: string) => {
    setStaffExtraFilter({ type, value });
    tukarModul('staff');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ============================================================== */}
      {/* 0. EXECUTIVE OPERATIONAL HERO BANNER                           */}
      {/* ============================================================== */}
      <div
        className="appos-card p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16,32,59,0.92) 0%, rgba(10,25,47,0.98) 100%)',
          borderLeft: '4px solid var(--accent-color)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg text-xl"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
            >
              <i className="fa-solid fa-gauge-high"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="badge-status badge-live text-[9px]">LIVE FIELD HUB</span>
                <span className="text-[11px] font-bold text-amber-400 font-mono">NEGERI PERLIS • 15 DUN</span>
                <span className="text-[11px] text-slate-400">SSOT Operations Platform</span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight leading-snug">
                Pusat Kawalan &amp; Pemantauan Operasi Premis KEMAS
              </h2>
              <p className="appos-text-muted text-xs mt-1">
                Pengurusan bersepadu pangkalan data kelas SSOT, penugasan kakitangan, pemantauan aduan kerosakan, dan pemetaan spatial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => tukarModul('peta')}
              className="btn-action text-xs py-2 px-3 rounded-xl flex items-center gap-2 bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25"
            >
              <i className="fa-solid fa-map-location-dot"></i>
              <span>Peta GIS Spatial</span>
            </button>
            <button
              onClick={() => tukarModul('kerosakan')}
              className="btn-action text-xs py-2 px-3 rounded-xl flex items-center gap-2 bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25"
            >
              <i className="fa-solid fa-wrench"></i>
              <span>Isu Kerosakan ({openIssuesCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SEKTOR UTAMA: 6 KAD METRIK KPI HUD (SUSUNAN WAJIB DIKEKALKAN) */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-slate-200">
              Metrik Operasi Utama Lapangan (HUD KPI)
            </h3>
          </div>
          <span className="text-[10.5px] appos-text-muted hidden sm:inline">
            Klik mana-mana kad untuk pintasan modul atau penapis automatik
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {/* 1. Fasiliti Kelas */}
          <div
            onClick={() => {
              setKelasExtraFilter(null);
              tukarModul('kelas');
            }}
            className="appos-card hud-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer shadow-md border-t-2 border-t-blue-500"
          >
            <div className="flex items-center justify-between">
              <span className="appos-text-muted text-[10px] font-bold uppercase tracking-wider">
                1. Fasiliti Kelas
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue-accent)' }}
              >
                <i className="fa-solid fa-school"></i>
              </div>
            </div>
            <div>
              <b className="font-mono text-2xl sm:text-3xl text-white block leading-none">
                {classes.length} <span className="text-xs font-normal text-slate-400">Premis</span>
              </b>
              <span className="text-[10px] block mt-1.5 font-semibold text-emerald-400 truncate">
                PAK {pakCount} • PKEM {pkemCount} • PKOM {pkomCount}
              </span>
            </div>
          </div>

          {/* 2. Staff */}
          <div
            onClick={() => {
              setStaffExtraFilter(null);
              tukarModul('staff');
            }}
            className="appos-card hud-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer shadow-md border-t-2 border-t-emerald-500"
          >
            <div className="flex items-center justify-between">
              <span className="appos-text-muted text-[10px] font-bold uppercase tracking-wider">
                2. Staff
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-accent)' }}
              >
                <i className="fa-solid fa-users"></i>
              </div>
            </div>
            <div>
              <b className="font-mono text-2xl sm:text-3xl text-white block leading-none">
                {staff.length} <span className="text-xs font-normal text-slate-400">Staf</span>
              </b>
              <span className="text-[10px] block mt-1.5 font-semibold text-emerald-400">
                Direktori kakitangan
              </span>
            </div>
          </div>

          {/* 3. Tugas Aktif */}
          <div
            onClick={() => tukarModul('penugasan')}
            className="appos-card hud-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer shadow-md border-t-2 border-t-amber-500"
          >
            <div className="flex items-center justify-between">
              <span className="appos-text-muted text-[10px] font-bold uppercase tracking-wider">
                3. Tugas Aktif
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber-accent)' }}
              >
                <i className="fa-solid fa-link"></i>
              </div>
            </div>
            <div>
              <b className="font-mono text-2xl sm:text-3xl text-white block leading-none">
                {activeAssignments.length}
              </b>
              <span className="text-[10px] block mt-1.5 font-semibold text-amber-400">
                Penugasan aktif staf
              </span>
            </div>
          </div>

          {/* 4. Kelas Ada Staf */}
          <div
            onClick={() => handleFilterClasses('hasStaff')}
            className="appos-card hud-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer shadow-md border-t-2 border-t-teal-400"
            title="Klik untuk senarai kelas yang telah berpenempatan staf"
          >
            <div className="flex items-center justify-between">
              <span className="appos-text-muted text-[10px] font-bold uppercase tracking-wider">
                4. Kelas Ada Staf
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                style={{ background: 'rgba(20,184,166,0.15)', color: '#2DD4BF' }}
              >
                <i className="fa-solid fa-user-check"></i>
              </div>
            </div>
            <div>
              <b className="font-mono text-2xl sm:text-3xl block leading-none text-teal-400">
                {kelasAdaStafCount}
              </b>
              <span className="text-[10px] block mt-1.5 font-semibold text-teal-400">
                Sudah ditempatkan
              </span>
            </div>
          </div>

          {/* 5. Kelas Tanpa Staf */}
          <div
            onClick={() => handleFilterClasses('noStaff')}
            className="appos-card hud-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer shadow-md border-t-2 border-t-rose-500"
            title="Klik untuk senarai kelas tanpa penempatan staf"
          >
            <div className="flex items-center justify-between">
              <span className="appos-text-muted text-[10px] font-bold uppercase tracking-wider">
                5. Kelas Tanpa Staf
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--rose-accent)' }}
              >
                <i className="fa-solid fa-user-slash"></i>
              </div>
            </div>
            <div>
              <b className="font-mono text-2xl sm:text-3xl block leading-none text-rose-400">
                {kelasTiadaStafCount}
              </b>
              <span className="text-[10px] block mt-1.5 font-semibold text-rose-400">
                Tiada penempatan
              </span>
            </div>
          </div>

          {/* 6. Staf Tanpa Kelas */}
          <div
            onClick={() => handleFilterStaff('noClass')}
            className="appos-card hud-card p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer shadow-md border-t-2 border-t-rose-500"
            title="Klik untuk senarai staf tanpa penempatan kelas"
          >
            <div className="flex items-center justify-between">
              <span className="appos-text-muted text-[10px] font-bold uppercase tracking-wider">
                6. Staf Tanpa Kelas
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--rose-accent)' }}
              >
                <i className="fa-solid fa-person-circle-exclamation"></i>
              </div>
            </div>
            <div>
              <b className="font-mono text-2xl sm:text-3xl block leading-none text-rose-400">
                {stafTanpaKelasCount}
              </b>
              <span className="text-[10px] block mt-1.5 font-semibold text-rose-400">
                Tiada penempatan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SEKTOR PROGRAM: MENGIKUT BAHAGIAN & JENIS KELAS             */}
      {/* ============================================================== */}
      <div className="appos-card p-4 sm:p-5 rounded-2xl shadow-lg border border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-color)] gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-layer-group"></i> Mengikut Bahagian &amp; Jenis Kelas
            </h3>
            <p className="appos-text-muted text-xs mt-0.5">
              Struktur pembahagian 266 premis kelas mengikut program pendidikan dan pembangunan KEMAS
            </p>
          </div>
          <span className="text-[10.5px] appos-text-muted font-medium bg-white/5 py-1 px-2.5 rounded-lg border border-[var(--border-color)] self-start sm:self-auto">
            Klik mana-mana kad untuk menapis rekod
          </span>
        </div>

        {/* 3 Main Division Flagship Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          {/* PAK Card */}
          <div
            onClick={() => handleFilterClasses('division', 'PAK')}
            className="appos-card hud-card p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(15,23,42,0.4) 100%)',
              borderColor: 'rgba(59,130,246,0.35)'
            }}
          >
            <div className="min-w-0 flex-1">
              <span className="text-blue-300 text-[10.5px] font-bold uppercase block tracking-wider truncate">
                PAK — Pendidikan Awal Kanak-kanak
              </span>
              <b className="font-mono text-2xl sm:text-3xl text-blue-400 block mt-1 leading-none">
                {pakCount} <span className="text-xs font-normal text-slate-300">premis</span>
              </b>
              <span className="text-[10px] text-slate-400 block mt-1.5">
                Tabika (144) • Taska (16)
              </span>
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-md"
              style={{ background: 'rgba(59,130,246,0.2)', color: 'var(--blue-accent)' }}
            >
              <i className="fa-solid fa-children"></i>
            </div>
          </div>

          {/* PKEM Card */}
          <div
            onClick={() => handleFilterClasses('division', 'PKEM')}
            className="appos-card hud-card p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(6,78,59,0.25) 0%, rgba(15,23,42,0.4) 100%)',
              borderColor: 'rgba(16,185,129,0.35)'
            }}
          >
            <div className="min-w-0 flex-1">
              <span className="text-emerald-300 text-[10.5px] font-bold uppercase block tracking-wider truncate">
                PKEM — Pendidikan Kemahiran
              </span>
              <b className="font-mono text-2xl sm:text-3xl text-emerald-400 block mt-1 leading-none">
                {pkemCount} <span className="text-xs font-normal text-slate-300">premis</span>
              </b>
              <span className="text-[10px] text-slate-400 block mt-1.5">
                Jahitan, Masakan, Komputer, dll
              </span>
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-md"
              style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald-accent)' }}
            >
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
          </div>

          {/* PKOM Card */}
          <div
            onClick={() => handleFilterClasses('division', 'PKOM')}
            className="appos-card hud-card p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(120,53,15,0.25) 0%, rgba(15,23,42,0.4) 100%)',
              borderColor: 'rgba(245,158,11,0.35)'
            }}
          >
            <div className="min-w-0 flex-1">
              <span className="text-amber-300 text-[10.5px] font-bold uppercase block tracking-wider truncate">
                PKOM — Pembangunan Komuniti
              </span>
              <b className="font-mono text-2xl sm:text-3xl text-amber-400 block mt-1 leading-none">
                {pkomCount} <span className="text-xs font-normal text-slate-300">premis</span>
              </b>
              <span className="text-[10px] text-slate-400 block mt-1.5">
                P. Insan, P. Sumber, PKK, Desa
              </span>
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-md"
              style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--amber-accent)' }}
            >
              <i className="fa-solid fa-users-line"></i>
            </div>
          </div>
        </div>

        {/* Sub-Category Breakdowns Organized by Division */}
        <div className="flex flex-col gap-4">
          {/* 1. PAK Sub-Classes */}
          <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)]">
            <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: 'var(--blue-accent)' }}>
              <i className="fa-solid fa-child"></i>
              <span>Kelas Pendidikan Awal Kanak-kanak (PAK)</span>
              <span className="text-[10px] font-mono text-slate-400">({pakCount} premis)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Tabika', name: 'Tabika', icon: 'fa-solid fa-child-reaching' },
                { id: 'Taska', name: 'Taska', icon: 'fa-solid fa-baby' }
              ].map(item => {
                const cCount = classes.filter(c => c.ClassTypeID === item.id).length;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleFilterClasses('classType', item.id)}
                    className="appos-card hud-card p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer bg-slate-900/60"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="appos-text-muted text-[10px] sm:text-[11px] font-bold uppercase block tracking-wider truncate">
                        {item.name}
                      </span>
                      <b className="font-mono text-xl sm:text-2xl text-blue-400 block mt-1 leading-none">
                        {cCount}
                      </b>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                      style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue-accent)' }}
                    >
                      <i className={item.icon}></i>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PKEM Sub-Classes */}
          <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)]">
            <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: 'var(--emerald-accent)' }}>
              <i className="fa-solid fa-gears"></i>
              <span>Kelas Pendidikan Kemahiran (PKEM)</span>
              <span className="text-[10px] font-mono text-slate-400">({pkemCount} premis)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { id: 'Jahitan', name: 'Jahitan', icon: 'fa-solid fa-scissors' },
                { id: 'Masakan', name: 'Masakan', icon: 'fa-solid fa-utensils' },
                { id: 'Komputer', name: 'Komputer', icon: 'fa-solid fa-laptop' },
                { id: 'Dandanan DIri', name: 'Dandanan Diri', icon: 'fa-solid fa-spray-can-sparkles' },
                { id: 'Seni Tangan', name: 'Seni Tangan', icon: 'fa-solid fa-palette' }
              ].map(item => {
                const cCount = classes.filter(c => c.ClassTypeID === item.id).length;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleFilterClasses('classType', item.id)}
                    className="appos-card hud-card p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer bg-slate-900/60"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="appos-text-muted text-[10px] sm:text-[11px] font-bold uppercase block tracking-wider truncate">
                        {item.name}
                      </span>
                      <b className="font-mono text-xl sm:text-2xl text-emerald-400 block mt-1 leading-none">
                        {cCount}
                      </b>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                      style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-accent)' }}
                    >
                      <i className={item.icon}></i>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PKOM Sub-Classes */}
          <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)]">
            <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: 'var(--amber-accent)' }}>
              <i className="fa-solid fa-users"></i>
              <span>Kelas Pembangunan Komuniti (PKOM)</span>
              <span className="text-[10px] font-mono text-slate-400">({pkomCount} premis)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Pembangunan Insan', name: 'Pembangunan Insan', icon: 'fa-solid fa-hands-holding-child' },
                { id: 'Pusat Sumber', name: 'Pusat Sumber', icon: 'fa-solid fa-book-open' },
                { id: 'PKK', name: 'PKK', icon: 'fa-solid fa-people-roof' },
                { id: 'Ekonomi Desa', name: 'Ekonomi Desa', icon: 'fa-solid fa-store' }
              ].map(item => {
                const cCount = classes.filter(c => c.ClassTypeID === item.id).length;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleFilterClasses('classType', item.id)}
                    className="appos-card hud-card p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer bg-slate-900/60"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="appos-text-muted text-[10px] sm:text-[11px] font-bold uppercase block tracking-wider truncate">
                        {item.name}
                      </span>
                      <b className="font-mono text-xl sm:text-2xl text-amber-400 block mt-1 leading-none">
                        {cCount}
                      </b>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                      style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber-accent)' }}
                    >
                      <i className={item.icon}></i>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SEKTOR FIZIKAL PREMIS: STATUS BANGUNAN & STATUS TANAH       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status Bangunan Card */}
        <div className="appos-card p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-md border border-[var(--border-color)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                <i className="fa-solid fa-building"></i> Status Bangunan
              </h3>
              <p className="appos-text-muted text-[11px]">Jenis penempatan fizikal fasiliti premis</p>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 font-bold bg-white/5 py-1 px-2 rounded-lg">
              {classes.length} premis
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(bgnCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => {
                const percent = Math.round((count / (classes.length || 1)) * 100);
                return (
                  <div
                    key={name}
                    onClick={() => handleFilterClasses('statusBgn', name)}
                    className="appos-card-subtle dash-tile p-3 rounded-xl cursor-pointer flex flex-col justify-between hover:border-[var(--accent-color)]"
                    title={`Klik untuk lihat ${count} premis (${percent}%)`}
                  >
                    <div>
                      <span className="appos-text-muted text-[10.5px] leading-tight line-clamp-2">{name}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline justify-between mb-1">
                        <b className="font-mono text-lg text-white">{count}</b>
                        <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Status Tanah Card */}
        <div className="appos-card p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-md border border-[var(--border-color)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                <i className="fa-solid fa-map"></i> Status Milik Tanah
              </h3>
              <p className="appos-text-muted text-[11px]">Klasifikasi pemilikan tapak tanah premis</p>
            </div>
            <span className="text-[10.5px] font-mono text-slate-300 font-bold bg-white/5 py-1 px-2 rounded-lg">
              {classes.length} premis
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(tanahCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => {
                const percent = Math.round((count / (classes.length || 1)) * 100);
                return (
                  <div
                    key={name}
                    onClick={() => handleFilterClasses('statusTanah', name)}
                    className="appos-card-subtle dash-tile p-3 rounded-xl cursor-pointer flex flex-col justify-between hover:border-[var(--accent-color)]"
                    title={`Klik untuk lihat ${count} premis (${percent}%)`}
                  >
                    <div>
                      <span className="appos-text-muted text-[10.5px] leading-tight line-clamp-2">{name}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline justify-between mb-1">
                        <b className="font-mono text-lg text-white">{count}</b>
                        <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SEKTOR GEOPOLITIK & MODAL INSAN (2 KAD DALAM 1 BARIS)       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Kad 1: Taburan Mengikut Parlimen */}
        <div className="appos-card p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-md border border-[var(--border-color)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                <i className="fa-solid fa-landmark"></i> Taburan Mengikut Parlimen
              </h3>
              <p className="appos-text-muted text-[11px]">Agihan premis kelas dan staf mengikut 3 Parlimen</p>
            </div>
            <span className="text-[10.5px] text-slate-300 font-bold bg-white/5 py-1 px-2 rounded-lg font-mono">
              3 Parlimen
            </span>
          </div>

          <div className="flex flex-col gap-2.5 justify-between flex-1">
            {['P.001', 'P.002', 'P.003'].map(parCode => (
              <div
                key={parCode}
                className="appos-card-subtle p-2.5 sm:p-3 rounded-xl flex items-center justify-between border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-mono font-bold text-[10.5px]" style={{ color: 'var(--accent-color)' }}>
                    {parCode}
                  </span>
                  <b className="text-xs sm:text-sm text-white block truncate">
                    {PAR_NAMES[parCode]?.replace(/P\.\d+\s*/, '') || parCode}
                  </b>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div
                    onClick={() => handleFilterClasses('parlimen', parCode)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 cursor-pointer border border-blue-500/25 transition-colors"
                    title="Klik untuk senarai kelas di parlimen ini"
                  >
                    <i className="fa-solid fa-school text-[10px] text-blue-400"></i>
                    <span className="text-[10px] text-blue-300 font-medium">Kelas</span>
                    <b className="font-mono text-xs sm:text-sm text-white">{parKelasCounts[parCode] || 0}</b>
                  </div>
                  <div
                    onClick={() => handleFilterStaff('parlimen', parCode)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 cursor-pointer border border-emerald-500/25 transition-colors"
                    title="Klik untuk senarai staf di parlimen ini"
                  >
                    <i className="fa-solid fa-users text-[10px] text-emerald-400"></i>
                    <span className="text-[10px] text-emerald-300 font-medium">Staf</span>
                    <b className="font-mono text-xs sm:text-sm text-white">{parStaffCounts[parCode] || 0}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kad 2: Status Lantikan Kakitangan */}
        <div className="appos-card p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-md border border-[var(--border-color)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                <i className="fa-solid fa-id-card-clip"></i> Status Lantikan Kakitangan
              </h3>
              <p className="appos-text-muted text-[11px]">Profil lantikan jawatan perkhidmatan kakitangan KEMAS</p>
            </div>
            <span className="text-[10.5px] text-slate-300 font-bold bg-white/5 py-1 px-2 rounded-lg font-mono">
              {staff.length} staf
            </span>
          </div>

          <div className="flex flex-col gap-2.5 justify-between flex-1">
            {/* Lantikan Kontrak */}
            <div
              onClick={() => handleFilterStaff('lantikan', 'Kontrak')}
              className="appos-card-subtle hud-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between cursor-pointer border border-[var(--border-color)] hover:border-amber-500 transition-colors flex-1"
            >
              <div>
                <span className="text-amber-400 text-[10.5px] font-bold uppercase tracking-wider block">
                  Lantikan Kontrak
                </span>
                <b className="font-mono text-2xl sm:text-3xl text-white block mt-0.5 leading-none">{lantikanKontrakCount}</b>
                <span className="text-[10.5px] block mt-1 text-slate-400">
                  Status: Kontrak Pelantikan
                </span>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber-accent)' }}
              >
                <i className="fa-solid fa-file-contract"></i>
              </div>
            </div>

            {/* Lantikan JSKT */}
            <div
              onClick={() => handleFilterStaff('lantikan', 'JSKT')}
              className="appos-card-subtle hud-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between cursor-pointer border border-[var(--border-color)] hover:border-blue-500 transition-colors flex-1"
            >
              <div>
                <span className="text-blue-400 text-[10.5px] font-bold uppercase tracking-wider block">
                  Lantikan JSKT
                </span>
                <b className="font-mono text-2xl sm:text-3xl text-white block mt-0.5 leading-none">{lantikanJsktCount}</b>
                <span className="text-[10.5px] block mt-1 text-slate-400">
                  Status: Jawatan Skim Khas (JSKT)
                </span>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue-accent)' }}
              >
                <i className="fa-solid fa-id-badge"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
