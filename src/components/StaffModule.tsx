import React, { useState, useMemo } from 'react';
import { useKoms } from '../context/KomsContext';
import { shortPosition, isAssignmentActive } from '../utils/komsConstants';

export const StaffModule: React.FC = () => {
  const {
    staff,
    assignments,
    jawatan,
    setSelectedStaff,
    setIsAddingStaff,
    staffExtraFilter,
    setStaffExtraFilter,
    toggleSoftDeleteStaff
  } = useKoms();

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOperasiFilter, setStatusOperasiFilter] = useState('');

  // Active assignment staff IDs
  const assignedStaffIds = useMemo(() => {
    const s = new Set<string>();
    assignments.forEach(a => {
      if (isAssignmentActive(a) && a.StaffID) {
        s.add(String(a.StaffID).trim());
      }
    });
    return s;
  }, [assignments]);

  const unassignedStaffCount = staff.filter(s => !assignedStaffIds.has(String(s.StaffID || '').trim())).length;

  // Filtered dataset
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.StaffName?.toLowerCase().includes(q);
        const matchId = s.StaffID?.toLowerCase().includes(q);
        const matchIc = s.IC_Number?.toLowerCase().includes(q);
        const matchPhone = s.PhoneNumber?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchIc && !matchPhone) return false;
      }

      // Dropdowns
      if (divisionFilter && s.DivisionID !== divisionFilter) return false;
      if (roleFilter && s.Position !== roleFilter) return false;
      if (statusFilter && s['Status Lantikan'] !== statusFilter) return false;

      // Status Operasi filter (Soft Delete)
      if (statusOperasiFilter) {
        const isAktif = (s.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
        if (statusOperasiFilter === 'Aktif' && !isAktif) return false;
        if (statusOperasiFilter === 'Tidak Aktif' && isAktif) return false;
      }

      // Extra filter from dashboard
      if (staffExtraFilter) {
        if (staffExtraFilter.type === 'noClass') {
          if (assignedStaffIds.has(String(s.StaffID || '').trim())) return false;
        } else if (staffExtraFilter.type === 'parlimen') {
          if (!s.ParlimenID?.startsWith(staffExtraFilter.value || '')) return false;
        } else if (staffExtraFilter.type === 'lantikan') {
          const st = String(s['Status Lantikan'] || s.StatusLantikan || '').trim().toLowerCase();
          if (st !== (staffExtraFilter.value || '').toLowerCase()) return false;
        }
      }

      return true;
    });
  }, [staff, searchQuery, divisionFilter, roleFilter, statusFilter, statusOperasiFilter, staffExtraFilter, assignedStaffIds]);

  // Distinct roles
  const availableRoles = useMemo(() => {
    const roles = Array.from(new Set(staff.map(s => s.Position).filter(Boolean))) as string[];
    return roles.sort();
  }, [staff]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setDivisionFilter('');
    setRoleFilter('');
    setStatusFilter('');
    setStatusOperasiFilter('');
    setStaffExtraFilter(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Unassigned Staff Attention Card */}
      <div
        className="appos-card p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md"
        style={{ borderColor: 'rgba(244,63,94,0.45)', background: 'rgba(244,63,94,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base"
            style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--rose-accent)' }}
          >
            <i className="fa-solid fa-user-slash"></i>
          </div>
          <div>
            <span className="appos-text-muted text-[9.5px] font-bold uppercase tracking-wider block">
              Staf Tiada Penempatan Kelas
            </span>
            <b className="font-mono text-lg text-white">
              {unassignedStaffCount} orang staf
            </b>
            <span className="appos-text-muted text-xs block">
              Belum dipadankan dalam rekod StaffAssignments
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStaffExtraFilter({ type: 'noClass' })}
            className={`btn-action text-xs py-1.5 px-3 rounded-lg ${
              staffExtraFilter?.type === 'noClass' ? 'bg-rose-500 text-white font-bold' : 'border-rose-500/40 text-rose-400'
            }`}
          >
            <i className="fa-solid fa-filter"></i> Papar Staf Tiada Kelas
          </button>
          {staffExtraFilter && (
            <button
              onClick={clearAllFilters}
              className="btn-action text-xs py-1.5 px-3 rounded-lg"
            >
              Semua Staf
            </button>
          )}
        </div>
      </div>

      {/* Main Staff Container */}
      <div className="appos-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-users"></i> Direktori Kakitangan Staf
            </h3>
            <p className="appos-text-muted text-xs mt-0.5">
              <span className="font-mono font-bold text-white">{filteredStaff.length} daripada {staff.length} staf</span>
              {' '}• Klik mana-mana staf untuk melihat butiran &amp; menghubungi
            </p>
          </div>
          <button
            onClick={() => setIsAddingStaff(true)}
            className="btn-action btn-gold text-xs py-1.5 px-3 rounded-lg"
          >
            <i className="fa-solid fa-user-plus"></i> Tambah Staf
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {/* Search Query */}
          <div>
            <input
              type="text"
              placeholder="Cari nama / no. tel / IC..."
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
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Bahagian</option>
              <option value="PAK">PAK</option>
              <option value="PKEM">PKEM</option>
              <option value="PKOM">PKOM</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Jawatan</option>
              {availableRoles.map(r => (
                <option key={r} value={r}>
                  {shortPosition(r, jawatan)} ({r})
                </option>
              ))}
            </select>
          </div>

          {/* Status Lantikan */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full filter-select py-2 px-3 rounded-xl text-xs cursor-pointer"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="">Semua Status Lantikan</option>
              <option value="Kontrak">Kontrak</option>
              <option value="JSKT">JSKT</option>
              <option value="Tetap">Tetap</option>
            </select>
          </div>

          {/* Status Operasi (Soft Delete) */}
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

        {/* Active Filter Banner */}
        {staffExtraFilter && (
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
                  {staffExtraFilter.type === 'noClass' && 'Staf Tiada Penempatan Kelas'}
                  {staffExtraFilter.type === 'parlimen' && `Parlimen = ${staffExtraFilter.value}`}
                  {staffExtraFilter.type === 'lantikan' && `Status Lantikan = ${staffExtraFilter.value}`}
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

      {/* Desktop Table View */}
      <div className="appos-card rounded-2xl overflow-hidden shadow-lg hidden md:block">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24">StaffID</th>
                <th>Nama Kakitangan</th>
                <th>Jawatan / Position</th>
                <th>Bahagian</th>
                <th>No. Telefon</th>
                <th>Status Lantikan</th>
                <th>Status Operasi</th>
                <th className="text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Tiada staf dijumpai untuk padanan penapis ini.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s, idx) => {
                  const isAktif = (s.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
                  return (
                    <tr
                      key={`stf-tr-${s.StaffID}-${idx}`}
                      onClick={() => setSelectedStaff(s)}
                      className={`cursor-pointer transition-colors ${!isAktif ? 'opacity-60 bg-rose-950/10' : ''}`}
                    >
                      <td className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                        {s.StaffID}
                      </td>
                      <td>
                        <b className="text-white block hover:underline" style={{ textDecorationColor: 'var(--accent-color)' }}>
                          {s.StaffName}
                        </b>
                        <span className="appos-text-muted text-[10.5px]">
                          {s.Email || '—'}
                        </span>
                      </td>
                      <td>
                        <b className="text-slate-200 block text-xs">{shortPosition(s.Position, jawatan)}</b>
                        <span className="font-mono text-[10px] appos-text-muted">{s.Position}</span>
                      </td>
                      <td className="font-bold text-slate-300">{s.DivisionID || '—'}</td>
                      <td className="font-mono text-slate-300 text-xs">{s.PhoneNumber || '—'}</td>
                      <td>
                        <span className={`badge-status ${s['Status Lantikan'] === 'JSKT' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {s['Status Lantikan'] || '—'}
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
                            onClick={() => toggleSoftDeleteStaff(s.StaffID)}
                            className="btn-action text-[11px] py-1 px-2.5 rounded-lg text-rose-400 border-rose-800/40 hover:bg-rose-500/20 inline-flex items-center gap-1"
                            title="Soft delete staf (maklumat kekal simpan dalam pangkalan data)"
                          >
                            <i className="fa-solid fa-user-slash text-[10px]"></i> Nyahaktif
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSoftDeleteStaff(s.StaffID)}
                            className="btn-action text-[11px] py-1 px-2.5 rounded-lg text-emerald-400 border-emerald-800/40 hover:bg-emerald-500/20 inline-flex items-center gap-1"
                            title="Aktifkan semula staf"
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

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:hidden">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full appos-card p-6 text-center text-slate-400 rounded-2xl">
            Tiada staf dijumpai.
          </div>
        ) : (
          filteredStaff.map((s, idx) => {
            const isAktif = (s.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
            return (
              <div
                key={`stf-card-${s.StaffID}-${idx}`}
                onClick={() => setSelectedStaff(s)}
                className={`appos-card-subtle p-4 sm:p-5 rounded-2xl cursor-pointer hover:border-[var(--accent-color)] flex flex-col justify-between gap-3 shadow-sm min-h-[165px] transition-all ${!isAktif ? 'opacity-60 border-rose-900/50' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                      {s.StaffID}
                    </span>
                    <span className="badge-status bg-slate-800 text-slate-300">{s.DivisionID}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">{s.StaffName}</h4>
                  <p className="text-[11px] font-semibold text-amber-400 mt-0.5 line-clamp-1">
                    {shortPosition(s.Position, jawatan)}
                  </p>
                  <p className="appos-text-muted font-mono text-[10px] mt-1">{s.PhoneNumber || 'Tiada No. Tel'}</p>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-color)] text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{s.ClassTypeID || ''}</span>
                    <span className={`badge-status ${s['Status Lantikan'] === 'JSKT' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {s['Status Lantikan'] || '—'}
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
                        onClick={() => toggleSoftDeleteStaff(s.StaffID)}
                        className="btn-action text-[10px] py-0.5 px-2 rounded text-rose-400 border-rose-800/40 hover:bg-rose-500/20"
                      >
                        <i className="fa-solid fa-user-slash mr-1"></i>Nyahaktif
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSoftDeleteStaff(s.StaffID)}
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
