import React, { useState, useMemo } from 'react';
import { useKoms } from '../context/KomsContext';
import {
  DUN_BY_PAR,
  CLASS_TYPE_BY_DIV,
  ALL_CLASS_TYPES,
  lookupStatusBgn,
  lookupStatusTanah,
  classIdKey,
  isAssignmentActive
} from '../utils/komsConstants';

export const KelasModule: React.FC = () => {
  const {
    classes,
    setSelectedClass,
    setIsAddingClass,
    exportXLSX,
    statusBgn,
    statusTanah,
    kelasExtraFilter,
    setKelasExtraFilter,
    assignments,
    toggleSoftDeleteClass
  } = useKoms();

  const [divisionFilter, setDivisionFilter] = useState('');
  const [classTypeFilter, setClassTypeFilter] = useState('');
  const [parlimenFilter, setParlimenFilter] = useState('');
  const [dunFilter, setDunFilter] = useState('');
  const [statusTanahFilter, setStatusTanahFilter] = useState('');
  const [statusOperasiFilter, setStatusOperasiFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cascading options
  const typeOptions = useMemo(() => {
    if (divisionFilter && CLASS_TYPE_BY_DIV[divisionFilter]) {
      return CLASS_TYPE_BY_DIV[divisionFilter];
    }
    return ALL_CLASS_TYPES;
  }, [divisionFilter]);

  const dunOptions = useMemo(() => {
    if (parlimenFilter && DUN_BY_PAR[parlimenFilter]) {
      return DUN_BY_PAR[parlimenFilter];
    }
    return Object.values(DUN_BY_PAR).flat();
  }, [parlimenFilter]);

  // Status Tanah options list
  const statusTanahOptions = useMemo(() => {
    if (statusTanah && statusTanah.length > 0) {
      return statusTanah.map(s => ({
        id: s['StatusTanah ID'],
        name: s.StatusTanah
      }));
    }
    const set = new Set<string>();
    classes.forEach(c => {
      const raw = c['Status Milik Tanah'] || c.StatusMilikTanah || '';
      if (raw) set.add(raw);
    });
    return Array.from(set).map(id => ({ id, name: id }));
  }, [statusTanah, classes]);

  // Active assignments set for noStaff / hasStaff filters
  const activeClassIds = useMemo(() => {
    const s = new Set<string>();
    assignments.forEach(a => {
      if (isAssignmentActive(a)) {
        const k = classIdKey(a.ClassID);
        if (k) s.add(k);
        if (a.ClassID) s.add(a.ClassID.trim());
      }
    });
    return s;
  }, [assignments]);

  // Filtered dataset
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.ClassName?.toLowerCase().includes(q);
        const matchId = c.ClassID?.toLowerCase().includes(q);
        const matchAddr = c.Address?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchAddr) return false;
      }

      // Dropdown filters
      if (divisionFilter && c.DivisionID !== divisionFilter) return false;
      if (classTypeFilter && c.ClassTypeID !== classTypeFilter) return false;
      if (parlimenFilter && c['Kod Parlimen'] !== parlimenFilter) return false;
      if (dunFilter && !c['Kod DUN']?.startsWith(dunFilter)) return false;

      // Status Tanah filter
      if (statusTanahFilter) {
        const currentTanahName = lookupStatusTanah(c['Status Milik Tanah'], statusTanah);
        const currentTanahId = c['Status Milik Tanah'] || c.StatusMilikTanah || '';
        if (currentTanahName !== statusTanahFilter && currentTanahId !== statusTanahFilter) {
          return false;
        }
      }

      // Status Operasi filter (Soft Delete)
      if (statusOperasiFilter) {
        const isAktif = (c.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
        if (statusOperasiFilter === 'Aktif' && !isAktif) return false;
        if (statusOperasiFilter === 'Tidak Aktif' && isAktif) return false;
      }

      // Dashboard Drill-Down Extra Filter
      if (kelasExtraFilter) {
        if (kelasExtraFilter.type === 'statusBgn') {
          const currentBgn = lookupStatusBgn(c['Status Bangunan'], statusBgn);
          if (currentBgn !== kelasExtraFilter.value && c['Status Bangunan'] !== kelasExtraFilter.value) {
            return false;
          }
        } else if (kelasExtraFilter.type === 'statusTanah') {
          const currentTanah = lookupStatusTanah(c['Status Milik Tanah'], statusTanah);
          if (currentTanah !== kelasExtraFilter.value && c['Status Milik Tanah'] !== kelasExtraFilter.value) {
            return false;
          }
        } else if (kelasExtraFilter.type === 'division') {
          if (c.DivisionID !== kelasExtraFilter.value) return false;
        } else if (kelasExtraFilter.type === 'classType') {
          if (c.ClassTypeID !== kelasExtraFilter.value) return false;
        } else if (kelasExtraFilter.type === 'parlimen') {
          if (c['Kod Parlimen'] !== kelasExtraFilter.value) return false;
        } else if (kelasExtraFilter.type === 'noStaff') {
          const cid = (c.ClassID || '').trim();
          if (activeClassIds.has(cid) || activeClassIds.has(classIdKey(cid))) return false;
        } else if (kelasExtraFilter.type === 'hasStaff') {
          const cid = (c.ClassID || '').trim();
          if (!activeClassIds.has(cid) && !activeClassIds.has(classIdKey(cid))) return false;
        }
      }

      return true;
    });
  }, [classes, searchQuery, divisionFilter, classTypeFilter, parlimenFilter, dunFilter, statusTanahFilter, statusOperasiFilter, kelasExtraFilter, statusBgn, statusTanah, activeClassIds]);

  const clearAllFilters = () => {
    setDivisionFilter('');
    setClassTypeFilter('');
    setParlimenFilter('');
    setDunFilter('');
    setStatusTanahFilter('');
    setStatusOperasiFilter('');
    setSearchQuery('');
    setKelasExtraFilter(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Panel */}
      <div className="appos-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-database"></i> Pangkalan Data Premis Kelas (SSOT)
            </h3>
            <p className="appos-text-muted text-xs mt-0.5">
              <span className="font-mono font-bold text-white">{filteredClasses.length} daripada {classes.length} rekod</span>
              {' '}• Klik mana-mana baris atau kad untuk melihat dossier penuh &amp; galeri
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportXLSX}
              className="btn-action btn-gold text-xs py-1.5 px-3 rounded-lg"
              title="Muat turun fail XLSX pangkalan data"
            >
              <i className="fa-solid fa-file-excel"></i> XLSX
            </button>
            <button
              onClick={() => setIsAddingClass(true)}
              className="btn-action text-xs py-1.5 px-3 rounded-lg"
            >
              <i className="fa-solid fa-plus"></i> Tambah Premis
            </button>
          </div>
        </div>

        {/* Search Bar & Cascading Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search Query */}
          <div>
            <input
              type="text"
              placeholder="Cari premis / ID / alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setClassTypeFilter('');
              }}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Bahagian</option>
              <option value="PAK">PAK — Pendidikan Awal Kanak-kanak</option>
              <option value="PKEM">PKEM — Pendidikan Kemahiran</option>
              <option value="PKOM">PKOM — Pembangunan Komuniti</option>
            </select>
          </div>

          {/* Class Type Filter */}
          <div>
            <select
              value={classTypeFilter}
              onChange={(e) => setClassTypeFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Jenis Kelas</option>
              {typeOptions.map(t => (
                <option key={t} value={t}>{t === 'Dandanan DIri' ? 'Dandanan Diri' : t}</option>
              ))}
            </select>
          </div>

          {/* Parlimen Filter */}
          <div>
            <select
              value={parlimenFilter}
              onChange={(e) => {
                setParlimenFilter(e.target.value);
                setDunFilter('');
              }}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Parlimen</option>
              <option value="P.001">P.001 Padang Besar</option>
              <option value="P.002">P.002 Kangar</option>
              <option value="P.003">P.003 Arau</option>
            </select>
          </div>

          {/* DUN Filter */}
          <div>
            <select
              value={dunFilter}
              onChange={(e) => setDunFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua DUN</option>
              {dunOptions.map(d => (
                <option key={d.kod} value={d.kod}>{d.kod} {d.nama}</option>
              ))}
            </select>
          </div>

          {/* Status Tanah Filter */}
          <div>
            <select
              value={statusTanahFilter}
              onChange={(e) => setStatusTanahFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer font-medium"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Status Tanah</option>
              {statusTanahOptions.map(st => (
                <option key={st.id} value={st.name}>{st.name}</option>
              ))}
            </select>
          </div>

          {/* Status Operasi Filter (Soft Delete) */}
          <div>
            <select
              value={statusOperasiFilter}
              onChange={(e) => setStatusOperasiFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer font-bold"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Status Operasi</option>
              <option value="Aktif">Aktif Sahaja</option>
              <option value="Tidak Aktif">Tidak Aktif (Soft Deleted)</option>
            </select>
          </div>
        </div>

        {/* Active Drilldown Banner */}
        {kelasExtraFilter && (
          <div
            className="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
            style={{
              background: 'rgba(197,160,89,0.1)',
              borderColor: 'var(--accent-color)'
            }}
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-filter" style={{ color: 'var(--accent-color)' }}></i>
              <span>
                Penapis Aktif:{' '}
                <b className="text-white">
                  {kelasExtraFilter.type === 'noStaff' && 'Kelas Tiada Staf Penempatan'}
                  {kelasExtraFilter.type === 'hasStaff' && 'Kelas Sudah Ditempatkan Staf'}
                  {kelasExtraFilter.type === 'statusBgn' && `Status Bangunan = ${kelasExtraFilter.value}`}
                  {kelasExtraFilter.type === 'statusTanah' && `Status Tanah = ${kelasExtraFilter.value}`}
                  {kelasExtraFilter.type === 'division' && `Bahagian = ${kelasExtraFilter.value}`}
                  {kelasExtraFilter.type === 'classType' && `Jenis Kelas = ${kelasExtraFilter.value}`}
                  {kelasExtraFilter.type === 'parlimen' && `Parlimen = ${kelasExtraFilter.value}`}
                </b>
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="btn-action text-[11px] py-1 px-2.5 rounded-lg text-rose-400 border-rose-800/40"
            >
              <i className="fa-solid fa-xmark"></i> Kosongkan Penapis
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View (visible md and up) */}
      <div className="appos-card rounded-2xl overflow-hidden shadow-lg hidden md:block">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24">ClassID</th>
                <th>Nama Premis Kelas</th>
                <th>Jenis</th>
                <th>Bahagian</th>
                <th>Parlimen</th>
                <th>DUN</th>
                <th>Status Bangunan</th>
                <th>Status Tanah</th>
                <th>Status Operasi</th>
                <th className="text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">
                    Tiada premis kelas dijumpai untuk padanan penapis ini.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c, idx) => {
                  const isAktif = (c.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
                  return (
                    <tr
                      key={`tr-${c.ClassID}-${c.ClassName}-${idx}`}
                      onClick={() => setSelectedClass(c)}
                      className={`cursor-pointer transition-colors ${!isAktif ? 'opacity-60 bg-rose-950/10' : ''}`}
                    >
                      <td className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                        {c.ClassID}
                      </td>
                      <td>
                        <b className="text-white block hover:underline" style={{ textDecorationColor: 'var(--accent-color)' }}>
                          {c.ClassName}
                        </b>
                        <span className="appos-text-muted text-[10.5px] line-clamp-1">
                          {c.Address || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge-status bg-blue-500/15 text-blue-400">
                          {c.ClassTypeID || '—'}
                        </span>
                      </td>
                      <td className="font-bold text-slate-300">{c.DivisionID || '—'}</td>
                      <td className="font-mono text-slate-300 text-xs">{c['Kod Parlimen'] || '—'}</td>
                      <td className="font-mono text-slate-300 text-xs">{c['Kod DUN'] || '—'}</td>
                      <td>
                        <span className="badge-status badge-live">
                          {lookupStatusBgn(c['Status Bangunan'], statusBgn)}
                        </span>
                      </td>
                      <td>
                        <span className="badge-status bg-amber-500/15 text-amber-300 font-semibold">
                          {lookupStatusTanah(c['Status Milik Tanah'], statusTanah)}
                        </span>
                      </td>
                      <td>
                        {isAktif ? (
                          <span className="badge-status bg-emerald-500/20 text-emerald-400 font-bold inline-flex items-center gap-1">
                            <i className="fa-solid fa-circle-check text-[9px]"></i> Aktif
                          </span>
                        ) : (
                          <span className="badge-status bg-rose-500/20 text-rose-400 font-bold inline-flex items-center gap-1">
                            <i className="fa-solid fa-ban text-[9px]"></i> Tidak Aktif
                          </span>
                        )}
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        {isAktif ? (
                          <button
                            onClick={() => toggleSoftDeleteClass(c.ClassID)}
                            className="btn-action text-[11px] py-1 px-2.5 rounded-lg text-rose-400 border-rose-800/40 hover:bg-rose-500/20 inline-flex items-center gap-1"
                            title="Soft delete premis (maklumat kekal simpan dalam pangkalan data)"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i> Nyahaktif
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSoftDeleteClass(c.ClassID)}
                            className="btn-action text-[11px] py-1 px-2.5 rounded-lg text-emerald-400 border-emerald-800/40 hover:bg-emerald-500/20 inline-flex items-center gap-1"
                            title="Aktifkan semula premis"
                          >
                            <i className="fa-solid fa-rotate-left text-[10px]"></i> Aktifkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View (visible on small screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:hidden">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full appos-card p-6 text-center text-slate-400 rounded-2xl">
            Tiada premis kelas dijumpai.
          </div>
        ) : (
          filteredClasses.map((c, idx) => {
            const isAktif = (c.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
            return (
              <div
                key={`card-${c.ClassID}-${c.ClassName}-${idx}`}
                onClick={() => setSelectedClass(c)}
                className={`appos-card-subtle p-4 sm:p-5 rounded-2xl cursor-pointer hover:border-[var(--accent-color)] flex flex-col justify-between gap-3 shadow-sm min-h-[165px] transition-all ${!isAktif ? 'opacity-60 border-rose-900/50' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                      {c.ClassID}
                    </span>
                    <span className="badge-status bg-blue-500/15 text-blue-400">{c.ClassTypeID}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{c.ClassName}</h4>
                  <p className="appos-text-muted text-[10.5px] mt-1 line-clamp-1">{c.Address || '—'}</p>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-color)] text-[10px]">
                  <div className="flex items-center justify-between text-slate-300 font-mono">
                    <span>{c['Kod DUN'] || c.DUN || ''}</span>
                    <span className="text-[9.5px] text-slate-400">{c.DivisionID}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="badge-status badge-live text-[9px]">
                      {lookupStatusBgn(c['Status Bangunan'], statusBgn)}
                    </span>
                    <span className="badge-status bg-amber-500/15 text-amber-300 font-semibold text-[9px]">
                      {lookupStatusTanah(c['Status Milik Tanah'], statusTanah)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]/50" onClick={(e) => e.stopPropagation()}>
                    {isAktif ? (
                      <span className="badge-status bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                        <i className="fa-solid fa-circle-check mr-1"></i>Aktif
                      </span>
                    ) : (
                      <span className="badge-status bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                        <i className="fa-solid fa-ban mr-1"></i>Tidak Aktif
                      </span>
                    )}
                    {isAktif ? (
                      <button
                        onClick={() => toggleSoftDeleteClass(c.ClassID)}
                        className="btn-action text-[10px] py-0.5 px-2 rounded text-rose-400 border-rose-800/40 hover:bg-rose-500/20"
                      >
                        <i className="fa-solid fa-trash-can mr-1"></i>Nyahaktif
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSoftDeleteClass(c.ClassID)}
                        className="btn-action text-[10px] py-0.5 px-2 rounded text-emerald-400 border-emerald-800/40 hover:bg-emerald-500/20"
                      >
                        <i className="fa-solid fa-rotate-left mr-1"></i>Aktifkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
