import React, { useState, useEffect } from 'react';
import { useKoms } from '../context/KomsContext';
import { ClassRecord } from '../types/koms';
import {
  DUN_BY_PAR,
  PAR_NAMES,
  ALL_CLASS_TYPES,
  CLASS_TYPE_BY_DIV,
  lookupStatusBgn,
  lookupStatusTanah,
  formatTahunOperasi
} from '../utils/komsConstants';

export const ClassEditModal: React.FC = () => {
  const {
    editingClass,
    setEditingClass,
    isAddingClass,
    setIsAddingClass,
    upsertClass,
    statusBgn,
    statusTanah
  } = useKoms();

  const isEditing = !!editingClass;
  const isOpen = isEditing || isAddingClass;

  const [formData, setFormData] = useState<Partial<ClassRecord>>({});

  useEffect(() => {
    if (editingClass) {
      setFormData({
        ...editingClass,
        'Tahun Mula Operasi': formatTahunOperasi(editingClass['Tahun Mula Operasi'])
      });
    } else if (isAddingClass) {
      setFormData({
        ClassID: `KLS-${Date.now().toString(36).toUpperCase()}`,
        DivisionID: 'PAK',
        ClassTypeID: 'Tabika',
        'Kod Parlimen': 'P.001',
        Parlimen: 'P.001 PADANG BESAR',
        'Kod DUN': 'N.01',
        DUN: 'N.01 TITI TINGGI',
        ClassName: '',
        Address: '',
        Location: '6.444, 100.198',
        'Status Bangunan': 'StatusBgn 01',
        'Status Milik Tanah': 'StatusTanah 03',
        'Jenis Bangunan': 'SESEBUAH',
        'Tahun Mula Operasi': '2024',
        'Masa Operasi': '8.00 PAGI - 5.00 PETANG'
      });
    }
  }, [editingClass, isAddingClass]);

  if (!isOpen) return null;

  const currentPar = formData['Kod Parlimen'] || 'P.001';
  const dunList = DUN_BY_PAR[currentPar] || [];
  const currentDiv = formData.DivisionID || 'PAK';
  const typeList = CLASS_TYPE_BY_DIV[currentDiv] || ALL_CLASS_TYPES;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ClassName?.trim()) {
      alert('Sila masukkan Nama Kelas / Premis.');
      return;
    }
    upsertClass({
      ...formData,
      'Tahun Mula Operasi': formatTahunOperasi(formData['Tahun Mula Operasi'])
    } as ClassRecord);
    setIsAddingClass(false);
    setEditingClass(null);
  };

  const handleClose = () => {
    setEditingClass(null);
    setIsAddingClass(false);
  };

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
            <span className="badge-status badge-live">
              {isEditing ? 'Kemaskini Kelas' : 'Daftar Kelas Baharu'}
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              {isEditing ? formData.ClassName || formData.ClassID : 'Tambah Premis Kelas SSOT'}
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
          {/* ClassID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                ClassID (PK)
              </label>
              <input
                type="text"
                value={formData.ClassID || ''}
                readOnly={isEditing}
                onChange={(e) => setFormData(prev => ({ ...prev, ClassID: e.target.value }))}
                className="w-full filter-select font-mono py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Nama Kelas / Premis *
              </label>
              <input
                type="text"
                required
                value={formData.ClassName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ClassName: e.target.value }))}
                placeholder="cth: TABIKA KEMAS BANGUNAN KHAS FELDA..."
                className="w-full filter-select font-bold py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Division & Class Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Bahagian
              </label>
              <select
                value={formData.DivisionID || 'PAK'}
                onChange={(e) => {
                  const div = e.target.value;
                  const firstType = CLASS_TYPE_BY_DIV[div]?.[0] || 'Tabika';
                  setFormData(prev => ({ ...prev, DivisionID: div, ClassTypeID: firstType }));
                }}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="PAK">PAK — Pendidikan Awal Kanak-kanak</option>
                <option value="PKEM">PKEM — Pendidikan Kemahiran</option>
                <option value="PKOM">PKOM — Pembangunan Komuniti</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Jenis Kelas
              </label>
              <select
                value={formData.ClassTypeID || 'Tabika'}
                onChange={(e) => setFormData(prev => ({ ...prev, ClassTypeID: e.target.value }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                {typeList.map(t => (
                  <option key={t} value={t}>{t === 'Dandanan DIri' ? 'Dandanan Diri' : t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Parlimen & DUN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Parlimen
              </label>
              <select
                value={currentPar}
                onChange={(e) => {
                  const par = e.target.value;
                  const firstDun = DUN_BY_PAR[par]?.[0];
                  setFormData(prev => ({
                    ...prev,
                    'Kod Parlimen': par,
                    Parlimen: PAR_NAMES[par] || par,
                    'Kod DUN': firstDun?.kod,
                    DUN: firstDun ? `${firstDun.kod} ${firstDun.nama.toUpperCase()}` : ''
                  }));
                }}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="P.001">P.001 Padang Besar</option>
                <option value="P.002">P.002 Kangar</option>
                <option value="P.003">P.003 Arau</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                DUN
              </label>
              <select
                value={formData['Kod DUN'] || ''}
                onChange={(e) => {
                  const dunKod = e.target.value;
                  const found = dunList.find(d => d.kod === dunKod);
                  setFormData(prev => ({
                    ...prev,
                    'Kod DUN': dunKod,
                    DUN: found ? `${found.kod} ${found.nama.toUpperCase()}` : dunKod
                  }));
                }}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                {dunList.map(d => (
                  <option key={d.kod} value={d.kod}>{d.kod} {d.nama}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & GPS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Alamat Premis
              </label>
              <input
                type="text"
                value={formData.Address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, Address: e.target.value }))}
                placeholder="Alamat penuh..."
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Lokasi GPS (lat, lng)
              </label>
              <input
                type="text"
                value={formData.Location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, Location: e.target.value }))}
                placeholder="6.444, 100.198"
                className="w-full filter-select font-mono py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Status Bangunan, Status Tanah & Jenis Bangunan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Status Bangunan
              </label>
              <select
                value={formData['Status Bangunan'] || 'StatusBgn 01'}
                onChange={(e) => setFormData(prev => ({ ...prev, 'Status Bangunan': e.target.value }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                {statusBgn.map(s => (
                  <option key={s['StatusBgn ID']} value={s['StatusBgn ID']}>{s.StatusBgn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Status Milik Tanah
              </label>
              <select
                value={formData['Status Milik Tanah'] || 'StatusTanah 03'}
                onChange={(e) => setFormData(prev => ({ ...prev, 'Status Milik Tanah': e.target.value }))}
                className="w-full filter-select py-2 px-3 rounded-lg cursor-pointer"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                {statusTanah.map(s => (
                  <option key={s['StatusTanah ID']} value={s['StatusTanah ID']}>{s.StatusTanah}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Jenis Bangunan
              </label>
              <input
                type="text"
                value={formData['Jenis Bangunan'] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, 'Jenis Bangunan': e.target.value }))}
                placeholder="cth: SESEBUAH, DEWAN, SURAU"
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Tahun Mula & Masa Operasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Tahun Mula Operasi
              </label>
              <input
                type="text"
                value={formData['Tahun Mula Operasi'] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, 'Tahun Mula Operasi': e.target.value }))}
                placeholder="cth: 2022"
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-[var(--accent-color)]">
                Masa Operasi
              </label>
              <input
                type="text"
                value={formData['Masa Operasi'] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, 'Masa Operasi': e.target.value }))}
                placeholder="cth: 8.00 PAGI - 5.00 PETANG"
                className="w-full filter-select py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* 4 Gallery Images */}
          <div className="mt-2 pt-3 border-t border-[var(--border-color)]">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider block mb-2 text-[var(--accent-color)]">
              Gambar Premis (Class Image 1–4)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(idx => {
                const fieldName = `Class Image ${idx}`;
                const currentVal = formData[fieldName];
                return (
                  <div key={idx} className="appos-card-subtle p-2.5 rounded-xl flex flex-col gap-1.5">
                    <span className="font-bold text-[11px] text-white">Class Image {idx}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, fieldName)}
                      className="text-[11px] text-slate-300"
                    />
                    <input
                      type="text"
                      value={currentVal || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [fieldName]: e.target.value }))}
                      placeholder="atau tampal URL gambar..."
                      className="filter-select text-[11px] py-1 px-2 rounded-lg"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                    />
                    {currentVal && (
                      <img
                        src={currentVal}
                        alt={`Preview ${idx}`}
                        className="w-full h-24 object-cover rounded-md mt-1 border border-[var(--border-color)]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
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
              <i className="fa-solid fa-floppy-disk"></i> Simpan Premis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
