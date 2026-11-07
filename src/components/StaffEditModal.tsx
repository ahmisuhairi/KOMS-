import React, { useState, useEffect } from 'react';
import { useKoms } from '../context/KomsContext';
import { StaffRecord } from '../types/koms';
import { POSITION_LABELS } from '../utils/komsConstants';

export const StaffEditModal: React.FC = () => {
  const {
    editingStaff,
    setEditingStaff,
    isAddingStaff,
    setIsAddingStaff,
    upsertStaff,
    jawatan
  } = useKoms();

  const isEditing = !!editingStaff;
  const isOpen = isEditing || isAddingStaff;

  const [formData, setFormData] = useState<Partial<StaffRecord>>({});

  useEffect(() => {
    if (editingStaff) {
      setFormData({ ...editingStaff });
    } else if (isAddingStaff) {
      setFormData({
        StaffID: `STF-${Date.now().toString(36).toUpperCase()}`,
        StaffName: '',
        Position: 'Jawatan 001',
        DivisionID: 'PAK',
        ClassTypeID: 'Tabika',
        ParlimenID: 'P.001 PADANG BESAR',
        DUNID: 'N.01 TITI TINGGI',
        IC_Number: '',
        PhoneNumber: '',
        Email: '',
        DateJoined: new Date().toISOString().slice(0, 10),
        'Status Lantikan': 'Kontrak'
      });
    }
  }, [editingStaff, isAddingStaff]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        'Gambar Profil': event.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.StaffName?.trim()) {
      alert('Sila masukkan Nama Staf.');
      return;
    }
    upsertStaff(formData as StaffRecord);
    setIsAddingStaff(false);
    setEditingStaff(null);
  };

  const handleClose = () => {
    setEditingStaff(null);
    setIsAddingStaff(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-5"
      onClick={handleClose}
    >
      <div
        className="appos-card relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-6"
        style={{
          background: 'var(--bg-card)',
          borderTop: '3px solid var(--accent-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-color)]">
          <div>
            <span className="badge-status badge-live">
              {isEditing ? 'Kemaskini Staf' : 'Daftar Staf Baharu'}
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              {isEditing ? formData.StaffName || formData.StaffID : 'Tambah Staf Baharu'}
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
          {/* Staff ID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                StaffID
              </label>
              <input
                type="text"
                value={formData.StaffID || ''}
                readOnly={isEditing}
                onChange={(e) => setFormData(prev => ({ ...prev, StaffID: e.target.value }))}
                className="w-full filter-select font-mono py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Nama Penuh Staf *
              </label>
              <input
                type="text"
                required
                value={formData.StaffName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, StaffName: e.target.value }))}
                placeholder="cth: AMIRAH BINTI DARUS"
                className="w-full filter-select font-bold py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Position & Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Jawatan / Position
              </label>
              <select
                value={formData.Position || 'Jawatan 001'}
                onChange={(e) => setFormData(prev => ({ ...prev, Position: e.target.value }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                {jawatan && jawatan.length > 0 ? (
                  jawatan.map(j => (
                    <option key={j['ID Jawatan']} value={j['ID Jawatan']}>
                      {j['ID Jawatan']} — {j.Jawatan}
                    </option>
                  ))
                ) : (
                  Object.entries(POSITION_LABELS).map(([code, label]) => (
                    <option key={code} value={code}>
                      {code} — {label}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Bahagian
              </label>
              <select
                value={formData.DivisionID || 'PAK'}
                onChange={(e) => setFormData(prev => ({ ...prev, DivisionID: e.target.value }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="PAK">PAK — Pendidikan Awal Kanak-kanak</option>
                <option value="PKEM">PKEM — Pendidikan Kemahiran</option>
                <option value="PKOM">PKOM — Pembangunan Komuniti</option>
              </select>
            </div>
          </div>

          {/* IC & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                No. Kad Pengenalan
              </label>
              <input
                type="text"
                value={formData.IC_Number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, IC_Number: e.target.value }))}
                placeholder="cth: 840409095132"
                className="w-full filter-select font-mono py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                No. Telefon
              </label>
              <input
                type="text"
                value={formData.PhoneNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, PhoneNumber: e.target.value }))}
                placeholder="cth: 0125696730"
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Email & Status Lantikan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                E-mel
              </label>
              <input
                type="email"
                value={formData.Email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, Email: e.target.value }))}
                placeholder="cth: name@gmail.com"
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Status Lantikan
              </label>
              <select
                value={formData['Status Lantikan'] || 'Kontrak'}
                onChange={(e) => setFormData(prev => ({ ...prev, 'Status Lantikan': e.target.value }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="Kontrak">Kontrak</option>
                <option value="JSKT">JSKT</option>
                <option value="Tetap">Tetap</option>
              </select>
            </div>
          </div>

          {/* Date Joined */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
              Tarikh Lapor Diri
            </label>
            <input
              type="text"
              value={formData.DateJoined || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, DateJoined: e.target.value }))}
              placeholder="cth: 2025-05-22 00:00:00"
              className="w-full filter-select py-2 px-3 rounded-lg"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          {/* Profile Picture */}
          <div className="mt-2 pt-3 border-t border-[var(--border-color)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
              Gambar Profil
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs text-slate-300 mb-2"
            />
            <input
              type="text"
              value={formData['Gambar Profil'] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, 'Gambar Profil': e.target.value }))}
              placeholder="atau tampal URL gambar..."
              className="w-full filter-select text-xs py-1.5 px-3 rounded-lg"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
            {formData['Gambar Profil'] && (
              <img
                src={formData['Gambar Profil']}
                alt="Profile Preview"
                className="w-20 h-20 object-cover rounded-xl mt-2 border border-[var(--border-color)]"
              />
            )}
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
              <i className="fa-solid fa-floppy-disk"></i> Simpan Staf
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
