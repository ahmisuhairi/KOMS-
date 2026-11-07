import React from 'react';
import { useKoms } from '../context/KomsContext';
import { shortPosition, isAssignmentActive, classIdKey } from '../utils/komsConstants';

export const StaffDetailModal: React.FC = () => {
  const {
    selectedStaff,
    setSelectedStaff,
    setEditingStaff,
    assignments,
    classes,
    jawatan,
    toggleAssignmentStatus,
    setSelectedClass,
    toggleSoftDeleteStaff
  } = useKoms();

  if (!selectedStaff) return null;

  const s = selectedStaff;
  const isAktif = (s.StatusOperasi || 'Aktif') !== 'Tidak Aktif';

  const staffAssignments = assignments.filter(a => a.StaffID === s.StaffID);

  const cleanPhone = (s.PhoneNumber || '').replace(/[^\d]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-5"
      onClick={() => setSelectedStaff(null)}
    >
      <div
        className="appos-card relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-6"
        style={{
          background: 'var(--bg-card)',
          borderTop: '3px solid var(--accent-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-status badge-live font-mono text-[11px]">{s.StaffID}</span>
            <span className="badge-status bg-emerald-500/20 text-emerald-400 font-bold">
              {s['Status Lantikan'] || 'Staf'}
            </span>
            {isAktif ? (
              <span className="badge-status bg-emerald-500/20 text-emerald-400 font-bold">
                <i className="fa-solid fa-circle-check mr-1"></i>Aktif
              </span>
            ) : (
              <span className="badge-status bg-rose-500/20 text-rose-400 font-bold">
                <i className="fa-solid fa-ban mr-1"></i>Tidak Aktif
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAktif ? (
              <button
                onClick={() => toggleSoftDeleteStaff(s.StaffID)}
                className="btn-action text-xs py-1.5 px-3 rounded-lg text-rose-400 border-rose-800/40 hover:bg-rose-500/20"
                title="Soft delete staf (maklumat kekal simpan)"
              >
                <i className="fa-solid fa-user-slash"></i>
                <span>Nyahaktif</span>
              </button>
            ) : (
              <button
                onClick={() => toggleSoftDeleteStaff(s.StaffID)}
                className="btn-action text-xs py-1.5 px-3 rounded-lg text-emerald-400 border-emerald-800/40 hover:bg-emerald-500/20"
                title="Aktifkan semula staf"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>Aktifkan</span>
              </button>
            )}
            <button
              onClick={() => {
                setEditingStaff(s);
                setSelectedStaff(null);
              }}
              className="btn-action btn-gold text-xs py-1.5 px-3 rounded-lg"
              title="Kemaskini data staf"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Edit Staf</span>
            </button>
            <button
              onClick={() => setSelectedStaff(null)}
              className="text-gray-400 hover:text-white p-1 text-xl leading-none"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start mb-5">
          {/* Avatar / Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[var(--border-color)] bg-slate-900 shrink-0 flex items-center justify-center">
            {s['Gambar Profil'] ? (
              <img
                src={s['Gambar Profil']}
                alt={s.StaffName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <i className="fa-solid fa-user text-3xl"></i>
                <span className="text-[9px] mt-1 font-mono">Tiada Gambar</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">{s.StaffName}</h2>
            <div className="text-xs font-semibold text-amber-400 mt-1">
              {shortPosition(s.Position, jawatan)}
              {s.Position && <span className="text-[10px] font-mono text-slate-400 ml-1.5">({s.Position})</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <span className="appos-text-muted text-[10px] block">Bahagian</span>
                <b className="text-white">{s.DivisionID || '—'}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">Jenis Kelas</span>
                <b className="text-white">{s.ClassTypeID || '—'}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">No. Kad Pengenalan</span>
                <b className="font-mono text-white text-[11px]">{s.IC_Number || '—'}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">Tarikh Lapor Diri</span>
                <b className="text-white text-[11px]">{s.DateJoined || '—'}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Quick Action Bar */}
        <div className="appos-card-subtle p-3 rounded-xl mb-5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            {s.PhoneNumber && (
              <a
                href={`tel:${s.PhoneNumber}`}
                className="btn-action text-xs py-1.5 px-3 rounded-lg"
                title="Panggilan telefon"
              >
                <i className="fa-solid fa-phone text-emerald-400"></i>
                <span>{s.PhoneNumber}</span>
              </a>
            )}
            {cleanPhone && (
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-emerald-600/20 text-emerald-300 border-emerald-600/40 hover:bg-emerald-600/30"
                title="Hantar WhatsApp"
              >
                <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                <span>WhatsApp</span>
              </a>
            )}
            {s.Email && (
              <a
                href={`mailto:${s.Email}`}
                className="btn-action text-xs py-1.5 px-3 rounded-lg"
                title="Hantar e-mel"
              >
                <i className="fa-solid fa-envelope text-blue-400"></i>
                <span>{s.Email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Section: Assigned Premises */}
        <div className="mb-4">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
            <i className="fa-solid fa-school"></i> Penempatan Kelas Premis ({staffAssignments.length})
          </h4>
          {staffAssignments.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-rose-800/40 bg-rose-950/10 text-center text-xs text-rose-300">
              <i className="fa-solid fa-user-slash text-lg mb-1 block"></i>
              Staf ini belum mempunyai rekod penempatan kelas aktif dalam StaffAssignments.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {staffAssignments.map((a, idx) => {
                const assignedClass = classes.find(c => {
                  return classIdKey(c.ClassID) === classIdKey(a.ClassID) || c.ClassID === a.ClassID || String(a.ClassID).includes(c.ClassID);
                });
                const isActive = isAssignmentActive(a);
                return (
                  <div
                    key={`staff-asg-${a.AssignmentID}-${idx}`}
                    className="appos-card-subtle p-3 rounded-xl flex flex-wrap items-center justify-between gap-2"
                  >
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        if (assignedClass) {
                          setSelectedClass(assignedClass);
                          setSelectedStaff(null);
                        }
                      }}
                    >
                      <b className="text-xs text-white block">
                        {assignedClass ? assignedClass.ClassName : a.ClassID}
                      </b>
                      <span className="text-[10.5px] appos-text-muted block mt-0.5">
                        {a.Peranan || 'Pendidik / Petugas'} • {assignedClass?.DUN || ''} • {a.AssignmentDate || ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge-status ${isActive ? 'badge-live' : 'bg-slate-700 text-slate-300'}`}>
                        {isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                      <button
                        onClick={() => toggleAssignmentStatus(a.AssignmentID)}
                        className="btn-action text-[10px] py-1 px-2.5 rounded-lg"
                      >
                        {isActive ? 'Tamat Penugasan' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-end gap-2">
          <button
            onClick={() => setSelectedStaff(null)}
            className="btn-action text-xs py-2 px-4 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
