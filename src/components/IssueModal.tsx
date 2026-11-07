import React, { useState, useEffect, useMemo } from 'react';
import { useKoms } from '../context/KomsContext';
import { IssueRecord } from '../types/koms';
import { DUN_BY_PAR, PAR_NAMES, CLASS_TYPE_BY_DIV } from '../utils/komsConstants';

export const IssueModal: React.FC = () => {
  const {
    isAddingIssue,
    setIsAddingIssue,
    prefilledClassIdForIssue,
    editingIssue,
    setEditingIssue,
    upsertIssue,
    classes
  } = useKoms();

  const isEditing = !!editingIssue;
  const isOpen = isEditing || isAddingIssue;

  // Cascading filters for selecting class premise
  const [filterPar, setFilterPar] = useState('P.001');
  const [filterDun, setFilterDun] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState<Partial<IssueRecord>>({});

  useEffect(() => {
    if (editingIssue) {
      setFormData({ ...editingIssue });
      // auto set filters if premise is found
      const matched = classes.find(c => c.ClassID === editingIssue.ClassID);
      if (matched) {
        if (matched['Kod Parlimen']) setFilterPar(matched['Kod Parlimen']);
        if (matched['Kod DUN']) setFilterDun(matched['Kod DUN']);
        if (matched.DivisionID) setFilterDiv(matched.DivisionID);
        if (matched.ClassTypeID) setFilterType(matched.ClassTypeID);
      }
    } else if (isAddingIssue) {
      let initialClassId = '';
      if (prefilledClassIdForIssue) {
        initialClassId = prefilledClassIdForIssue;
        const matched = classes.find(c => c.ClassID === prefilledClassIdForIssue);
        if (matched) {
          if (matched['Kod Parlimen']) setFilterPar(matched['Kod Parlimen']);
          if (matched['Kod DUN']) setFilterDun(matched['Kod DUN']);
          if (matched.DivisionID) setFilterDiv(matched.DivisionID);
          if (matched.ClassTypeID) setFilterType(matched.ClassTypeID);
        }
      }

      setFormData({
        IssueID: `ISS-${Date.now().toString(36).toUpperCase()}`,
        ClassID: initialClassId,
        Severity: 'Biasa',
        Status: 'Baharu',
        IssueDescription: '',
        Ulasan: '',
        Penyelesaian: '',
        DateReported: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    }
  }, [editingIssue, isAddingIssue, prefilledClassIdForIssue, classes]);

  if (!isOpen) return null;

  const dunList = DUN_BY_PAR[filterPar] || [];
  const typeList = filterDiv ? (CLASS_TYPE_BY_DIV[filterDiv] || []) : [];

  // Filter available classes based on cascade
  const availableClasses = classes.filter(c => {
    if (filterPar && c['Kod Parlimen'] !== filterPar) return false;
    if (filterDun && !c['Kod DUN']?.startsWith(filterDun)) return false;
    if (filterDiv && c.DivisionID !== filterDiv) return false;
    if (filterType && c.ClassTypeID !== filterType) return false;
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: event.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setIsAddingIssue(false);
    setEditingIssue(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ClassID) {
      alert('Sila pilih premis kelas yang mengalami isu.');
      return;
    }
    if (!formData.IssueDescription?.trim()) {
      alert('Sila masukkan keterangan isu / kerosakan.');
      return;
    }

    // Validation if status is Selesai
    if (formData.Status === 'Selesai') {
      const comp1 = formData['Completion Image 1'];
      const comp2 = formData['Completion Image 2'];
      if (!comp1 && !comp2) {
        alert('Status "Selesai" memerlukan sekurang-kurangnya 1 atau 2 gambar bukti penutupan isu sebelum disimpan.');
        return;
      }
      if (!formData.DateResolved) {
        formData.DateResolved = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
    }

    upsertIssue(formData as IssueRecord);
    handleClose();
  };

  const isStatusSelesai = formData.Status === 'Selesai';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-5"
      onClick={handleClose}
    >
      <div
        className="appos-card relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-6"
        style={{
          background: 'var(--bg-card)',
          borderTop: '3px solid var(--accent-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-color)]">
          <div>
            <span className="badge-status bg-rose-500/20 text-rose-400 font-bold">
              {isEditing ? 'Kemaskini Isu' : 'Daftar Laporan Isu Baharu'}
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              {isEditing ? `Isu ${formData.IssueID}` : 'Borang Laporan Kerosakan Premis'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1 text-xl leading-none"
            aria-label="Tutup"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Cascading selectors for Premise selection (if adding or changing) */}
          <div className="appos-card-subtle p-3 rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-2 text-[var(--accent-color)]">
              Alur Pemilihan Premis (Parlimen → DUN → Bahagian → Jenis Kelas → Premis)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
              <div>
                <label className="text-[9.5px] appos-text-muted block mb-0.5 font-bold">Parlimen</label>
                <select
                  value={filterPar}
                  onChange={(e) => {
                    setFilterPar(e.target.value);
                    setFilterDun('');
                  }}
                  className="w-full filter-select py-1.5 px-2 rounded-lg text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                >
                  <option value="P.001">P.001 Padang Besar</option>
                  <option value="P.002">P.002 Kangar</option>
                  <option value="P.003">P.003 Arau</option>
                </select>
              </div>

              <div>
                <label className="text-[9.5px] appos-text-muted block mb-0.5 font-bold">DUN</label>
                <select
                  value={filterDun}
                  onChange={(e) => setFilterDun(e.target.value)}
                  className="w-full filter-select py-1.5 px-2 rounded-lg text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                >
                  <option value="">Semua DUN</option>
                  {dunList.map(d => (
                    <option key={d.kod} value={d.kod}>{d.kod} {d.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9.5px] appos-text-muted block mb-0.5 font-bold">Bahagian</label>
                <select
                  value={filterDiv}
                  onChange={(e) => {
                    setFilterDiv(e.target.value);
                    setFilterType('');
                  }}
                  className="w-full filter-select py-1.5 px-2 rounded-lg text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                >
                  <option value="">Semua Bahagian</option>
                  <option value="PAK">PAK</option>
                  <option value="PKEM">PKEM</option>
                  <option value="PKOM">PKOM</option>
                </select>
              </div>

              <div>
                <label className="text-[9.5px] appos-text-muted block mb-0.5 font-bold">Jenis</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full filter-select py-1.5 px-2 rounded-lg text-xs"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                >
                  <option value="">Semua Jenis</option>
                  {typeList.map(t => (
                    <option key={t} value={t}>{t === 'Dandanan DIri' ? 'Dandanan Diri' : t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Premise Select */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-white">
                Pilih Premis Kelas Terlibat ({availableClasses.length} pilihan) *
              </label>
              <select
                required
                value={formData.ClassID || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ClassID: e.target.value }))}
                className="w-full filter-select font-bold py-2 px-3 rounded-lg text-xs cursor-pointer"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="">— Pilih Premis Kelas —</option>
                {availableClasses.map((c, idx) => (
                  <option key={`opt-${c.ClassID}-${c.ClassName}-${idx}`} value={c.ClassID}>
                    {c.ClassName} ({c.ClassID} • {c['Kod DUN']})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Severity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Tahap Keterukan (Severity)
              </label>
              <select
                value={formData.Severity || 'Biasa'}
                onChange={(e) => setFormData(prev => ({ ...prev, Severity: e.target.value as any }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Kritikal">Kritikal</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Status Aliran Tindakan
              </label>
              <select
                value={formData.Status || 'Baharu'}
                onChange={(e) => setFormData(prev => ({ ...prev, Status: e.target.value as any }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer font-bold"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="Baharu">1. Baharu (Laporan Awal)</option>
                <option value="Dalam Tindakan">2. Dalam Tindakan</option>
                <option value="Sedang Dibaiki">3. Sedang Dibaiki</option>
                <option value="Selesai">4. Selesai (Perlu 2 Gambar Bukti)</option>
              </select>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
              Keterangan Isu / Kerosakan *
            </label>
            <textarea
              required
              rows={3}
              value={formData.IssueDescription || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, IssueDescription: e.target.value }))}
              placeholder="Terangkan secara jelas butiran kerosakan, siling/atap bocor, paip pecah, anaianai..."
              className="w-full filter-select py-2 px-3 rounded-xl text-xs"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          {/* Ulasan & Tindakan Penyelesaian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Ulasan Pemantau
              </label>
              <input
                type="text"
                value={formData.Ulasan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, Ulasan: e.target.value }))}
                placeholder="cth: Lawatan tapak telah dijalankan..."
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Tindakan Penyelesaian
              </label>
              <input
                type="text"
                value={formData.Penyelesaian || formData.Resolution || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, Penyelesaian: e.target.value, Resolution: e.target.value }))}
                placeholder="cth: Kontraktor telah membaiki atap..."
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* 2 Issue Photos */}
          <div className="pt-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider block mb-2 text-[var(--accent-color)]">
              Gambar Laporan Kerosakan (Issue Image 1 &amp; 2)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo 1 */}
              <div className="appos-card-subtle p-2.5 rounded-xl flex flex-col gap-1.5">
                <span className="font-bold text-[11px] text-white">Gambar Laporan 1</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'Issue Image 1')}
                  className="text-xs text-slate-300"
                />
                <input
                  type="text"
                  value={formData['Issue Image 1'] || formData.PhotoAttachment || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, 'Issue Image 1': val, PhotoAttachment: val }));
                  }}
                  placeholder="atau URL..."
                  className="filter-select text-[11px] py-1 px-2 rounded-lg"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
                {(formData['Issue Image 1'] || formData.PhotoAttachment) && (
                  <img
                    src={formData['Issue Image 1'] || formData.PhotoAttachment}
                    alt="Preview 1"
                    className="w-full h-24 object-cover rounded-md mt-1 border border-[var(--border-color)]"
                  />
                )}
              </div>

              {/* Photo 2 */}
              <div className="appos-card-subtle p-2.5 rounded-xl flex flex-col gap-1.5">
                <span className="font-bold text-[11px] text-white">Gambar Laporan 2</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'Issue Image 2')}
                  className="text-xs text-slate-300"
                />
                <input
                  type="text"
                  value={formData['Issue Image 2'] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, 'Issue Image 2': e.target.value }))}
                  placeholder="atau URL..."
                  className="filter-select text-[11px] py-1 px-2 rounded-lg"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
                {formData['Issue Image 2'] && (
                  <img
                    src={formData['Issue Image 2']}
                    alt="Preview 2"
                    className="w-full h-24 object-cover rounded-md mt-1 border border-[var(--border-color)]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Completion Proof Section - Highlighted if Status is Selesai */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              isStatusSelesai
                ? 'border-emerald-500 bg-emerald-950/20'
                : 'border-[var(--border-color)] appos-card-subtle'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <i className={`fa-solid fa-circle-check ${isStatusSelesai ? 'text-emerald-400' : 'text-slate-400'}`}></i>
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isStatusSelesai ? 'text-emerald-400' : 'text-slate-300'}`}>
                Bukti Penutupan Isu (Completion Image 1 &amp; 2) {isStatusSelesai && <span className="text-amber-400">*Wajib untuk Status Selesai</span>}
              </span>
            </div>
            <p className="appos-text-muted text-[11px] mb-2.5">
              Lampirkan gambar pembaikan yang telah siap untuk menutup isu kerosakan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Comp 1 */}
              <div className="appos-card-subtle p-2.5 rounded-xl flex flex-col gap-1.5 border border-emerald-500/30">
                <span className="font-bold text-[11px] text-emerald-300">Gambar Selesai 1</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'Completion Image 1')}
                  className="text-xs text-slate-300"
                />
                <input
                  type="text"
                  value={formData['Completion Image 1'] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, 'Completion Image 1': e.target.value }))}
                  placeholder="atau URL..."
                  className="filter-select text-[11px] py-1 px-2 rounded-lg"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
                {formData['Completion Image 1'] && (
                  <img
                    src={formData['Completion Image 1']}
                    alt="Completion 1"
                    className="w-full h-24 object-cover rounded-md mt-1 border border-emerald-500/40"
                  />
                )}
              </div>

              {/* Comp 2 */}
              <div className="appos-card-subtle p-2.5 rounded-xl flex flex-col gap-1.5 border border-emerald-500/30">
                <span className="font-bold text-[11px] text-emerald-300">Gambar Selesai 2</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'Completion Image 2')}
                  className="text-xs text-slate-300"
                />
                <input
                  type="text"
                  value={formData['Completion Image 2'] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, 'Completion Image 2': e.target.value }))}
                  placeholder="atau URL..."
                  className="filter-select text-[11px] py-1 px-2 rounded-lg"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
                {formData['Completion Image 2'] && (
                  <img
                    src={formData['Completion Image 2']}
                    alt="Completion 2"
                    className="w-full h-24 object-cover rounded-md mt-1 border border-emerald-500/40"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-color)] mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-action text-xs py-2 px-4 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-action btn-gold text-xs py-2 px-5 rounded-xl font-bold"
            >
              <i className="fa-solid fa-floppy-disk"></i> Simpan Laporan Isu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
