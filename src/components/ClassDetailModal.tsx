import React from 'react';
import { useKoms } from '../context/KomsContext';
import {
  lookupStatusBgn,
  lookupStatusTanah,
  classIdKey,
  coordsForClass,
  isAssignmentActive,
  formatTahunOperasi
} from '../utils/komsConstants';

export const ClassDetailModal: React.FC = () => {
  const {
    selectedClass,
    setSelectedClass,
    setEditingClass,
    assignments,
    staff,
    issues,
    statusBgn,
    statusTanah,
    toggleAssignmentStatus,
    setSelectedIssue,
    setSelectedStaff,
    setIsAddingIssue,
    toggleSoftDeleteClass,
    showToast
  } = useKoms();

  if (!selectedClass) return null;

  const c = selectedClass;
  const isAktif = (c.StatusOperasi || 'Aktif') !== 'Tidak Aktif';
  const cid = classIdKey(c.ClassID);

  // Assignments for this class
  const classAssignments = assignments.filter(a => {
    return classIdKey(a.ClassID) === cid || a.ClassID === c.ClassID || String(a.ClassID).includes(c.ClassID);
  });

  // Issues for this class
  const classIssues = issues.filter(i => {
    return classIdKey(i.ClassID) === cid || String(i.ClassID).includes(c.ClassID);
  });

  const [lat, lng] = coordsForClass(c);
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.015}%2C${lng + 0.015}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`;
  const osmFullLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  const imageSlots = [
    { title: 'Hadapan Premis', field: 'Class Image 1', key: '1' },
    { title: 'Ruang Dalam', field: 'Class Image 2', key: '2' },
    { title: 'Papan Tanda / Warta', field: 'Class Image 3', key: '3' },
    { title: 'Kemudahan & Kawasan', field: 'Class Image 4', key: '4' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-5"
      onClick={() => setSelectedClass(null)}
    >
      <div
        className="appos-card relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-6"
        style={{
          background: 'var(--bg-card)',
          borderTop: '3px solid var(--accent-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-status badge-live font-mono text-[11px]">{c.ClassID}</span>
            <span className="badge-status bg-blue-500/20 text-blue-400 font-bold">{c.DivisionID}</span>
            <span className="badge-status bg-amber-500/20 text-amber-400 font-bold">{c.ClassTypeID}</span>
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
                onClick={() => toggleSoftDeleteClass(c.ClassID)}
                className="btn-action text-xs py-1.5 px-3 rounded-lg text-rose-400 border-rose-800/40 hover:bg-rose-500/20"
                title="Soft delete (maklumat kekal simpan)"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>Nyahaktif</span>
              </button>
            ) : (
              <button
                onClick={() => toggleSoftDeleteClass(c.ClassID)}
                className="btn-action text-xs py-1.5 px-3 rounded-lg text-emerald-400 border-emerald-800/40 hover:bg-emerald-500/20"
                title="Aktifkan semula premis"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>Aktifkan</span>
              </button>
            )}
            <button
              onClick={() => {
                setEditingClass(c);
                setSelectedClass(null);
              }}
              className="btn-action btn-gold text-xs py-1.5 px-3 rounded-lg"
              title="Kemaskini data premis"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Edit Premis</span>
            </button>
            <button
              onClick={() => setSelectedClass(null)}
              className="text-gray-400 hover:text-white p-1 text-xl leading-none"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">{c.ClassName}</h2>
          <p className="appos-text-muted text-xs mt-1 flex items-center gap-1.5">
            <i className="fa-solid fa-location-dot text-amber-500"></i>
            <span>{c.Address || 'Alamat premis tidak dinyatakan.'}</span>
          </p>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
          {/* Left Column: Administrative Info */}
          <div className="appos-card-subtle p-3.5 rounded-xl flex flex-col gap-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
              Maklumat Lokasi &amp; Pentadbiran
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="appos-text-muted text-[10px] block">Parlimen</span>
                <b className="text-white text-xs">{c.Parlimen || c['Kod Parlimen'] || '—'}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">DUN</span>
                <b className="text-white text-xs">{c.DUN || c['Kod DUN'] || '—'}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">Status Bangunan</span>
                <b className="text-white text-xs">{lookupStatusBgn(c['Status Bangunan'], statusBgn)}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">Status Milik Tanah</span>
                <b className="text-white text-xs">{lookupStatusTanah(c['Status Milik Tanah'], statusTanah)}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">Jenis Bangunan</span>
                <b className="text-white text-xs">{c['Jenis Bangunan'] || '—'}</b>
              </div>
              <div>
                <span className="appos-text-muted text-[10px] block">Tahun Mula Operasi</span>
                <b className="text-white text-xs">{formatTahunOperasi(c['Tahun Mula Operasi'])}</b>
              </div>
              <div className="col-span-2">
                <span className="appos-text-muted text-[10px] block">Waktu Operasi</span>
                <b className="text-white text-xs">{c['Masa Operasi'] || c['Waktu Mula Operasi'] || '8.00 PAGI - 5.00 PETANG'}</b>
              </div>
            </div>
          </div>

          {/* Right Column: Mini GIS Map Preview */}
          <div className="appos-card-subtle p-3.5 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                Pemetaan Spatial (OSM)
              </span>
              <span className="font-mono text-[10px] appos-text-muted">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
            </div>
            <div className="w-full h-36 rounded-lg overflow-hidden border border-[var(--border-color)] bg-slate-900">
              <iframe
                title={c.ClassName}
                src={osmUrl}
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <i className="fa-solid fa-diamond-turn-right text-amber-400"></i> Buka Di Aplikasi Peta &amp; Navigasi:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action text-[10.5px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-blue-400 hover:text-blue-300"
                  title="Buka lokasi dalam Google Maps"
                >
                  <i className="fa-brands fa-google text-xs"></i>
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(c.ClassName)}&ll=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action text-[10.5px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-slate-200 hover:text-white"
                  title="Buka lokasi dalam Apple Maps"
                >
                  <i className="fa-brands fa-apple text-xs"></i>
                  <span>Apple Maps</span>
                </a>
                <a
                  href={`https://earth.google.com/web/search/${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action text-[10.5px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-emerald-400 hover:text-emerald-300"
                  title="Paparan 3D Satelit Google Earth"
                >
                  <i className="fa-solid fa-earth-asia text-xs"></i>
                  <span>Google Earth</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                    }
                    showToast('Koordinat GPS', `${lat.toFixed(5)}, ${lng.toFixed(5)} telah disalin`);
                  }}
                  className="btn-action text-[10.5px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-amber-400 hover:text-amber-300"
                  title="Salin Koordinat GPS"
                >
                  <i className="fa-regular fa-copy text-xs"></i>
                  <span>Salin GPS</span>
                </button>
              </div>
              <a
                href={osmFullLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] hover:underline flex items-center gap-1 text-slate-400 hover:text-slate-200 mt-0.5"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> Buka OpenStreetMap berskala penuh
              </a>
            </div>
          </div>
        </div>

        {/* Section: Active Staff Assignments */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-users"></i> Penugasan Kakitangan ({classAssignments.length})
            </h4>
          </div>
          {classAssignments.length === 0 ? (
            <div className="p-3 rounded-xl border border-dashed border-[var(--border-color)] text-center text-xs appos-text-muted">
              Tiada staf yang ditugaskan ke premis ini buat masa ini.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {classAssignments.map((a, idx) => {
                const assignedStaff = staff.find(s => s.StaffID === a.StaffID);
                const isActive = isAssignmentActive(a);
                return (
                  <div
                    key={`asg-${a.AssignmentID}-${idx}`}
                    className="appos-card-subtle p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2"
                  >
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        if (assignedStaff) {
                          setSelectedStaff(assignedStaff);
                          setSelectedClass(null);
                        }
                      }}
                    >
                      <b className="text-xs text-white block">
                        {assignedStaff ? assignedStaff.StaffName : a.StaffID}
                      </b>
                      <span className="text-[10.5px] appos-text-muted block">
                        {a.Peranan || 'Pendidik / Petugas'} • {a.AssignmentDate || 'Aktif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge-status ${isActive ? 'badge-live' : 'bg-slate-700 text-slate-300'}`}>
                        {isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                      <button
                        onClick={() => toggleAssignmentStatus(a.AssignmentID)}
                        className="btn-action text-[10px] py-1 px-2 rounded-lg"
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

        {/* Section: Open & Past Issues */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
              <i className="fa-solid fa-wrench"></i> Isu / Kerosakan Premis ({classIssues.length})
            </h4>
            <button
              onClick={() => {
                setIsAddingIssue(true, c.ClassID);
                setSelectedClass(null);
              }}
              className="btn-action text-[10.5px] py-1 px-2.5 rounded-lg"
            >
              <i className="fa-solid fa-plus"></i> Laporkan Isu
            </button>
          </div>
          {classIssues.length === 0 ? (
            <div className="p-3 rounded-xl border border-dashed border-[var(--border-color)] text-center text-xs appos-text-muted">
              Tiada rekod kerosakan dilaporkan untuk premis ini.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {classIssues.map((i, idx) => (
                <div
                  key={`iss-${i.IssueID}-${idx}`}
                  onClick={() => {
                    setSelectedIssue(i);
                    setSelectedClass(null);
                  }}
                  className="appos-card-subtle p-2.5 rounded-xl cursor-pointer hover:border-[var(--accent-color)] transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--accent-color)' }}>
                      {i.IssueID}
                    </span>
                    <b className="text-xs text-white block truncate">{i.IssueDescription}</b>
                    <span className="text-[10px] appos-text-muted">{i.DateReported || 'Baru'}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge-status ${i.Severity === 'Kritikal' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {i.Severity}
                    </span>
                    <span className={`badge-status ${i.Status === 'Selesai' ? 'badge-live' : 'bg-rose-500/20 text-rose-400'}`}>
                      {i.Status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Premise Photos Gallery */}
        <div>
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
            <i className="fa-regular fa-images"></i> Galeri Premis (Class Image 1–4)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imageSlots.map(slot => {
              const imgUrl = c[slot.field];
              return (
                <div key={slot.key} className="appos-card-subtle p-2.5 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-white block">{slot.title}</span>
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={slot.title}
                      className="w-full aspect-[1080/720] object-cover rounded-lg border border-[var(--border-color)] bg-slate-950"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[1080/720] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col items-center justify-center gap-1.5 text-center p-3">
                      <i className="fa-regular fa-image text-2xl text-slate-500"></i>
                      <span className="text-xs text-slate-400 font-semibold">{slot.title}</span>
                      <span className="font-mono text-[9px]" style={{ color: 'var(--accent-color)' }}>
                        {slot.field}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-end gap-2">
          <button
            onClick={() => setSelectedClass(null)}
            className="btn-action text-xs py-2 px-4 rounded-xl"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              setIsAddingIssue(true, c.ClassID);
              setSelectedClass(null);
            }}
            className="btn-action btn-gold text-xs py-2 px-4 rounded-xl"
          >
            <i className="fa-solid fa-wrench"></i> Laporkan Isu
          </button>
        </div>
      </div>
    </div>
  );
};
