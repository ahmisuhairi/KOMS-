import React from 'react';
import { useKoms } from '../context/KomsContext';
import { classIdKey } from '../utils/komsConstants';

export const IssueDetailModal: React.FC = () => {
  const {
    selectedIssue,
    setSelectedIssue,
    setEditingIssue,
    classes,
    setSelectedClass,
    advanceIssueStatus
  } = useKoms();

  if (!selectedIssue) return null;

  const i = selectedIssue;
  const matchedClass = classes.find(c => {
    return classIdKey(c.ClassID) === classIdKey(i.ClassID) || c.ClassID === i.ClassID || String(i.ClassID).includes(c.ClassID);
  });

  const img1 = i['Issue Image 1'] || i.PhotoAttachment;
  const img2 = i['Issue Image 2'];
  const compImg1 = i['Completion Image 1'];
  const compImg2 = i['Completion Image 2'];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-5"
      onClick={() => setSelectedIssue(null)}
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
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="badge-status badge-live font-mono text-[11px]">{i.IssueID}</span>
            <span
              className={`badge-status ${
                i.Status === 'Selesai'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : i.Status === 'Sedang Dibaiki'
                  ? 'bg-blue-500/20 text-blue-400'
                  : i.Status === 'Dalam Tindakan'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {i.Status || 'Baharu'}
            </span>
            <span
              className={`badge-status ${
                i.Severity === 'Kritikal'
                  ? 'bg-red-500/20 text-red-400'
                  : i.Severity === 'Penting'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {i.Severity || 'Biasa'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingIssue(i);
                setSelectedIssue(null);
              }}
              className="btn-action btn-gold text-xs py-1.5 px-3 rounded-lg"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Edit Isu</span>
            </button>
            <button
              onClick={() => setSelectedIssue(null)}
              className="text-gray-400 hover:text-white p-1 text-xl leading-none"
              aria-label="Tutup"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Title & Premis */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">{i.IssueDescription}</h2>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="appos-text-muted">Premis Terlibat:</span>
            <button
              onClick={() => {
                if (matchedClass) {
                  setSelectedClass(matchedClass);
                  setSelectedIssue(null);
                }
              }}
              className="font-bold hover:underline flex items-center gap-1"
              style={{ color: 'var(--accent-color)' }}
            >
              <i className="fa-solid fa-school"></i>
              <span>{matchedClass ? matchedClass.ClassName : i.ClassID}</span>
            </button>
          </div>
        </div>

        {/* Workflow Advance Action Buttons */}
        <div className="appos-card-subtle p-3 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-300">
            Kemajuan Tindakan Isu:
          </span>
          <div className="flex items-center gap-2">
            {i.Status === 'Baharu' && (
              <button
                onClick={() => advanceIssueStatus(i.IssueID, 'Dalam Tindakan')}
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
              >
                <i className="fa-solid fa-play"></i> Mula Tindakan
              </button>
            )}
            {i.Status === 'Dalam Tindakan' && (
              <button
                onClick={() => advanceIssueStatus(i.IssueID, 'Sedang Dibaiki')}
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold"
              >
                <i className="fa-solid fa-screwdriver-wrench"></i> Sedang Dibaiki
              </button>
            )}
            {i.Status === 'Sedang Dibaiki' && (
              <button
                onClick={() => advanceIssueStatus(i.IssueID, 'Selesai')}
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
              >
                <i className="fa-solid fa-circle-check"></i> Tanda Selesai
              </button>
            )}
            {i.Status === 'Selesai' && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <i className="fa-solid fa-check-double"></i> Isu telah selesai sepenuhnya
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
          <div className="appos-card-subtle p-3 rounded-xl flex flex-col gap-2">
            <div>
              <span className="appos-text-muted text-[10px] block">Tarikh Dilaporkan</span>
              <b className="text-white text-xs">{i.DateReported || '—'}</b>
            </div>
            <div>
              <span className="appos-text-muted text-[10px] block">Pelapor</span>
              <b className="text-white text-xs">{i.ReportedByStaffID || 'Pegawai Pemantau'}</b>
            </div>
          </div>
          <div className="appos-card-subtle p-3 rounded-xl flex flex-col gap-2">
            <div>
              <span className="appos-text-muted text-[10px] block">Tarikh Selesai</span>
              <b className="text-white text-xs">{i.DateResolved || 'Belum selesai'}</b>
            </div>
            <div>
              <span className="appos-text-muted text-[10px] block">Pegawai Penyelesai</span>
              <b className="text-white text-xs">{i.ResolvedByStaffID || '—'}</b>
            </div>
          </div>
        </div>

        {/* Ulasan & Penyelesaian */}
        {(i.Ulasan || i.Penyelesaian || i.Resolution) && (
          <div className="appos-card-subtle p-3 rounded-xl mb-4 text-xs flex flex-col gap-2">
            {i.Ulasan && (
              <div>
                <span className="appos-text-muted text-[10px] block font-bold">Ulasan Pemantau:</span>
                <p className="text-slate-200 mt-0.5">{i.Ulasan}</p>
              </div>
            )}
            {(i.Penyelesaian || i.Resolution) && (
              <div>
                <span className="appos-text-muted text-[10px] block font-bold">Penyelesaian / Tindakan:</span>
                <p className="text-slate-200 mt-0.5">{i.Penyelesaian || i.Resolution}</p>
              </div>
            )}
          </div>
        )}

        {/* Section: Gambar Laporan Isu */}
        <div className="mb-4">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-color)' }}>
            <i className="fa-regular fa-images"></i> Gambar Laporan Kerosakan (2)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="appos-card-subtle p-2.5 rounded-xl">
              <span className="text-[10.5px] font-bold text-white block mb-1">Gambar Isu 1</span>
              {img1 ? (
                <img src={img1} alt="Isu 1" className="w-full aspect-[16/10] object-cover rounded-lg border border-[var(--border-color)]" />
              ) : (
                <div className="w-full aspect-[16/10] rounded-lg border border-dashed border-[var(--border-color)] flex items-center justify-center text-slate-500 text-xs">
                  Tiada gambar dilampirkan
                </div>
              )}
            </div>
            <div className="appos-card-subtle p-2.5 rounded-xl">
              <span className="text-[10.5px] font-bold text-white block mb-1">Gambar Isu 2</span>
              {img2 ? (
                <img src={img2} alt="Isu 2" className="w-full aspect-[16/10] object-cover rounded-lg border border-[var(--border-color)]" />
              ) : (
                <div className="w-full aspect-[16/10] rounded-lg border border-dashed border-[var(--border-color)] flex items-center justify-center text-slate-500 text-xs">
                  Tiada gambar dilampirkan
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Bukti Selesai (Completion Proof) */}
        {(compImg1 || compImg2 || i.Status === 'Selesai') && (
          <div className="mb-4">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider mb-2 text-emerald-400">
              <i className="fa-solid fa-check-circle"></i> Bukti Penutupan Isu (2)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="appos-card-subtle p-2.5 rounded-xl border-emerald-500/20">
                <span className="text-[10.5px] font-bold text-emerald-400 block mb-1">Gambar Selesai 1</span>
                {compImg1 ? (
                  <img src={compImg1} alt="Selesai 1" className="w-full aspect-[16/10] object-cover rounded-lg border border-emerald-500/40" />
                ) : (
                  <div className="w-full aspect-[16/10] rounded-lg border border-dashed border-emerald-500/30 flex items-center justify-center text-slate-500 text-xs">
                    Tiada gambar bukti selesai
                  </div>
                )}
              </div>
              <div className="appos-card-subtle p-2.5 rounded-xl border-emerald-500/20">
                <span className="text-[10.5px] font-bold text-emerald-400 block mb-1">Gambar Selesai 2</span>
                {compImg2 ? (
                  <img src={compImg2} alt="Selesai 2" className="w-full aspect-[16/10] object-cover rounded-lg border border-emerald-500/40" />
                ) : (
                  <div className="w-full aspect-[16/10] rounded-lg border border-dashed border-emerald-500/30 flex items-center justify-center text-slate-500 text-xs">
                    Tiada gambar bukti selesai
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-end gap-2">
          <button
            onClick={() => setSelectedIssue(null)}
            className="btn-action text-xs py-2 px-4 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
