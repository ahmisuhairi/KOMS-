import React, { useState, useMemo } from 'react';
import { useKoms } from '../context/KomsContext';
import { isAssignmentActive, classIdKey } from '../utils/komsConstants';
import { AssignmentRecord } from '../types/koms';

export const PenugasanModule: React.FC = () => {
  const {
    assignments,
    staff,
    classes,
    upsertAssignment,
    toggleAssignmentStatus,
    setSelectedStaff,
    setSelectedClass
  } = useKoms();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [searchStaff, setSearchStaff] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New assignment form state
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [role, setRole] = useState('Pendidik Masyarakat');

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const isAct = isAssignmentActive(a);
      if (statusFilter === 'ACTIVE' && !isAct) return false;
      if (statusFilter === 'INACTIVE' && isAct) return false;

      const matchedStaff = staff.find(s => s.StaffID === a.StaffID);
      const matchedClass = classes.find(c => {
        return classIdKey(c.ClassID) === classIdKey(a.ClassID) || c.ClassID === a.ClassID || String(a.ClassID).includes(c.ClassID);
      });

      // Carian Nama Staff
      if (searchStaff.trim()) {
        const qStaff = searchStaff.toLowerCase().trim();
        const staffName = (matchedStaff?.StaffName || '').toLowerCase();
        const staffId = String(a.StaffID || '').toLowerCase();
        if (!staffName.includes(qStaff) && !staffId.includes(qStaff)) {
          return false;
        }
      }

      // Carian Nama Kelas
      if (searchClass.trim()) {
        const qClass = searchClass.toLowerCase().trim();
        const className = (matchedClass?.ClassName || '').toLowerCase();
        const classId = String(a.ClassID || '').toLowerCase();
        const classAddr = (matchedClass?.Address || '').toLowerCase();
        if (!className.includes(qClass) && !classId.includes(qClass) && !classAddr.includes(qClass)) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, statusFilter, searchStaff, searchClass, staff, classes]);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !selectedClassId) {
      alert('Sila pilih kakitangan dan kelas premis.');
      return;
    }

    const newRec: AssignmentRecord = {
      AssignmentID: `ASN-${Date.now().toString(36).toUpperCase()}`,
      StaffID: selectedStaffId,
      ClassID: selectedClassId,
      Peranan: role.trim() || 'Pendidik Masyarakat',
      AssignmentDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
      StatusPenugasan: 'TRUE',
      StatusTugasan: 'Aktif'
    };

    upsertAssignment(newRec);
    setIsAdding(false);
    setSelectedStaffId('');
    setSelectedClassId('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header and Toolbar */}
      <div className="appos-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-link"></i> Penugasan Kakitangan ↔ Kelas Premis
            </h3>
            <p className="appos-text-muted text-xs mt-0.5">
              Junction StaffAssignments (M:N) • Status Penugasan Aktif (TRUE) &amp; Tidak Aktif (FALSE)
            </p>
          </div>
          <button
            onClick={() => setIsAdding(prev => !prev)}
            className="btn-action btn-gold text-xs py-1.5 px-3 rounded-lg"
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
            <span>{isAdding ? 'Tutup Borang' : 'Tambah Penugasan'}</span>
          </button>
        </div>

        {/* Add Assignment Accordion Form */}
        {isAdding && (
          <form
            onSubmit={handleSaveNew}
            className="appos-card-subtle p-4 rounded-xl border border-[var(--border-color)] flex flex-col gap-3 text-xs"
          >
            <b className="text-xs text-white" style={{ color: 'var(--accent-color)' }}>
              Daftar Penugasan Staf Baharu
            </b>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Select Staff */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-slate-300">
                  Pilih Staf *
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                >
                  <option value="">— Pilih Kakitangan —</option>
                  {staff.map(s => (
                    <option key={s.StaffID} value={s.StaffID}>
                      {s.StaffName} ({s.StaffID})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Class */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-slate-300">
                  Pilih Kelas Premis *
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                >
                  <option value="">— Pilih Premis Kelas —</option>
                  {classes.map((c, idx) => (
                    <option key={`cls-${c.ClassID}-${c.ClassName}-${idx}`} value={c.ClassID}>
                      {c.ClassName} ({c.ClassID})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-slate-300">
                  Peranan / Jawatan Penugasan
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="cth: Pendidik Masyarakat Hakiki"
                  className="w-full filter-select py-2 px-3 rounded-lg text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-action text-xs py-1.5 px-3 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-action btn-gold text-xs py-1.5 px-4 rounded-lg font-bold"
              >
                <i className="fa-solid fa-floppy-disk"></i> Simpan Penugasan
              </button>
            </div>
          </form>
        )}

        {/* Dual Search Toolbar: Carian Nama Staff & Carian Nama Kelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Carian Nama Staff */}
          <div className="relative">
            <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-emerald-400 flex items-center gap-1.5">
              <i className="fa-solid fa-user"></i> Carian Nama Staff
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Taip nama staf (cth: Zaleha, Jamal, Rohani)..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="w-full filter-select py-2 pl-9 pr-8 rounded-xl text-xs"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400"></i>
              {searchStaff && (
                <button
                  type="button"
                  onClick={() => setSearchStaff('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
                  title="Padam carian staf"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Carian Nama Kelas */}
          <div className="relative">
            <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-blue-400 flex items-center gap-1.5">
              <i className="fa-solid fa-school"></i> Carian Nama Kelas / Premis
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Taip nama kelas (cth: Tabika Felda, Taska, Surau)..."
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
                className="w-full filter-select py-2 pl-9 pr-8 rounded-xl text-xs"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400"></i>
              {searchClass && (
                <button
                  type="button"
                  onClick={() => setSearchClass('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
                  title="Padam carian kelas"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filter Buttons & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`btn-action text-xs py-1 px-3 rounded-lg ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : ''
              }`}
            >
              Aktif ({assignments.filter(isAssignmentActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`btn-action text-xs py-1 px-3 rounded-lg ${
                statusFilter === 'INACTIVE' ? 'bg-slate-700 text-slate-200 font-bold' : ''
              }`}
            >
              Tidak Aktif ({assignments.length - assignments.filter(isAssignmentActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`btn-action text-xs py-1 px-3 rounded-lg ${
                statusFilter === 'ALL' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold' : ''
              }`}
            >
              Semua ({assignments.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-300">
              Hasil: <b className="text-white">{filteredAssignments.length}</b> rekod
            </span>
            {(searchStaff || searchClass) && (
              <button
                type="button"
                onClick={() => {
                  setSearchStaff('');
                  setSearchClass('');
                }}
                className="btn-action text-[10.5px] py-1 px-2.5 rounded-lg text-rose-400 border-rose-800/40 hover:bg-rose-500/20"
              >
                <i className="fa-solid fa-xmark"></i> Kosongkan Carian
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="flex flex-col gap-2.5">
        {filteredAssignments.length === 0 ? (
          <div className="appos-card p-8 text-center text-slate-400 rounded-2xl">
            Tiada rekod penugasan dijumpai.
          </div>
        ) : (
          filteredAssignments.map((a, idx) => {
            const matchedStaff = staff.find(s => s.StaffID === a.StaffID);
            const matchedClass = classes.find(c => {
              return classIdKey(c.ClassID) === classIdKey(a.ClassID) || c.ClassID === a.ClassID || String(a.ClassID).includes(c.ClassID);
            });
            const isActive = isAssignmentActive(a);

            return (
              <div
                key={`asg-${a.AssignmentID}-${idx}`}
                className="appos-card-subtle p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4 shadow-sm min-h-[96px] hover:border-[var(--accent-color)] transition-all"
                style={{ opacity: isActive ? 1 : 0.65 }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{a.AssignmentID}</span>
                    <span className={`badge-status ${isActive ? 'badge-live' : 'bg-slate-800 text-slate-400'}`}>
                      {isActive ? 'TRUE • Aktif' : 'FALSE • Tamat'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5">
                    {/* Staff link */}
                    <div
                      className="cursor-pointer hover:underline text-xs"
                      onClick={() => matchedStaff && setSelectedStaff(matchedStaff)}
                    >
                      <span className="text-[10px] appos-text-muted block">Staf</span>
                      <b className="text-white text-xs">{matchedStaff ? matchedStaff.StaffName : a.StaffID}</b>
                    </div>

                    <span className="text-slate-500 hidden sm:inline">→</span>

                    {/* Class link */}
                    <div
                      className="cursor-pointer hover:underline text-xs"
                      onClick={() => matchedClass && setSelectedClass(matchedClass)}
                    >
                      <span className="text-[10px] appos-text-muted block">Premis Kelas</span>
                      <b className="text-white text-xs">{matchedClass ? matchedClass.ClassName : a.ClassID}</b>
                    </div>
                  </div>

                  <span className="text-[10px] appos-text-muted block mt-1.5">
                    {a.Peranan || 'Penugasan'} • {a.AssignmentDate || '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAssignmentStatus(a.AssignmentID)}
                    className="btn-action text-[10.5px] py-1.5 px-3 rounded-lg"
                  >
                    {isActive ? (
                      <>
                        <i className="fa-solid fa-user-xmark text-rose-400"></i>
                        <span>Tamat Penugasan</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-user-check text-emerald-400"></i>
                        <span>Aktifkan (TRUE)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
