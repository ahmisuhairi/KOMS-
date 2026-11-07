import { StatusBgnItem, StatusTanahItem, JawatanItem } from '../types/koms';

export const DUN_BY_PAR: Record<string, Array<{ kod: string; nama: string }>> = {
  'P.001': [
    { kod: 'N.01', nama: 'Titi Tinggi' },
    { kod: 'N.02', nama: 'Beseri' },
    { kod: 'N.03', nama: 'Chuping' },
    { kod: 'N.04', nama: 'Mata Ayer' },
    { kod: 'N.05', nama: 'Santan' }
  ],
  'P.002': [
    { kod: 'N.06', nama: 'Bintong' },
    { kod: 'N.07', nama: 'Sena' },
    { kod: 'N.08', nama: 'Indera Kayangan' },
    { kod: 'N.09', nama: 'Kuala Perlis' },
    { kod: 'N.10', nama: 'Kayang' }
  ],
  'P.003': [
    { kod: 'N.11', nama: 'Pauh' },
    { kod: 'N.12', nama: 'Tambun Tulang' },
    { kod: 'N.13', nama: 'Guar Sanji' },
    { kod: 'N.14', nama: 'Simpang Empat' },
    { kod: 'N.15', nama: 'Sanglang' }
  ]
};

export const PAR_NAMES: Record<string, string> = {
  'P.001': 'P.001 Padang Besar',
  'P.002': 'P.002 Kangar',
  'P.003': 'P.003 Arau'
};

export const ALL_DUN = Object.values(DUN_BY_PAR).flat();

export const DUN_COORDS: Record<string, [number, number]> = {
  'N.01': [6.652, 100.228],
  'N.02': [6.540, 100.228],
  'N.03': [6.480, 100.280],
  'N.04': [6.430, 100.270],
  'N.05': [6.480, 100.220],
  'N.06': [6.430, 100.200],
  'N.07': [6.440, 100.180],
  'N.08': [6.441, 100.198],
  'N.09': [6.400, 100.130],
  'N.10': [6.390, 100.180],
  'N.11': [6.380, 100.270],
  'N.12': [6.350, 100.250],
  'N.13': [6.320, 100.280],
  'N.14': [6.340, 100.200],
  'N.15': [6.300, 100.200]
};

export const CLASS_TYPE_BY_DIV: Record<string, string[]> = {
  PAK: ['Tabika', 'Taska'],
  PKEM: ['Jahitan', 'Masakan', 'Komputer', 'Dandanan DIri', 'Seni Tangan'],
  PKOM: ['Pembangunan Insan', 'Pusat Sumber', 'PKK', 'Ekonomi Desa']
};

export const ALL_CLASS_TYPES = [
  'Tabika',
  'Taska',
  'Jahitan',
  'Masakan',
  'Komputer',
  'Pembangunan Insan',
  'Pusat Sumber',
  'PKK',
  'Dandanan DIri',
  'Seni Tangan',
  'Ekonomi Desa'
];

export const PIN_COLORS: Record<string, string> = {
  Tabika: '#3B82F6',          // Blue
  Taska: '#F97316',           // Orange
  Jahitan: '#D946EF',         // Fuchsia
  Masakan: '#EAB308',         // Amber/Yellow
  Komputer: '#22C55E',        // Green
  'Pembangunan Insan': '#EF4444', // Red
  'Pusat Sumber': '#A855F7',  // Purple
  PKK: '#FB7185',             // Rose
  'Dandanan DIri': '#2DD4BF', // Teal
  'Dandanan Diri': '#2DD4BF',
  'Seni Tangan': '#FACC15',   // Gold
  'Ekonomi Desa': '#06B6D4'   // Cyan
};

export const POSITION_LABELS: Record<string, string> = {
  'Jawatan 001': 'Pendidik Masyarakat TABIKA',
  'Jawatan 002': 'Pendidik Masyarakat TASKA',
  'Jawatan 003': 'Pemaju Masyarakat Pembangunan Insan',
  'Jawatan 004': 'Pemaju Masyarakat Pusat Sumber',
  'Jawatan 005': 'Pemaju Masyarakat Jahitan',
  'Jawatan 006': 'Pemaju Masyarakat Masakan',
  'Jawatan 007': 'Pemaju Masyarakat Dandanan Diri',
  'Jawatan 008': 'Pemaju Masyarakat Seni Tangan',
  'Jawatan 009': 'Pemaju Masyarakat Literasi Komputer',
  'Jawatan 010': 'Pemaju Masyarakat Pendidikan Kesejahteraan Keluarga',
  'Jawatan 011': 'Pemaju Masyarakat Ekonomi Desa'
};

export function shortPosition(code?: string, jawatanList?: JawatanItem[]): string {
  if (!code) return '—';
  const c = code.trim();
  if (jawatanList && jawatanList.length > 0) {
    const found = jawatanList.find(j => j['ID Jawatan'] === c);
    if (found?.Jawatan) return found.Jawatan;
  }
  return POSITION_LABELS[c] || c;
}

export function labelPosition(code?: string, jawatanList?: JawatanItem[]): string {
  if (!code) return '—';
  const short = shortPosition(code, jawatanList);
  return short !== code ? `${code} — ${short}` : code;
}

export function classIdKey(raw?: string): string {
  if (!raw) return '';
  const s = String(raw).trim();
  return s.includes(':') ? s.split(':')[0].trim() : s;
}

export function lookupStatusBgn(id?: string, list?: StatusBgnItem[]): string {
  if (!id) return '—';
  if (list && list.length > 0) {
    const item = list.find(s => s['StatusBgn ID'] === id);
    if (item?.StatusBgn) return item.StatusBgn;
  }
  return id;
}

export function lookupStatusTanah(id?: string, list?: StatusTanahItem[]): string {
  if (!id) return '—';
  if (list && list.length > 0) {
    const item = list.find(s => s['StatusTanah ID'] === id);
    if (item?.StatusTanah) return item.StatusTanah;
  }
  return id;
}

export function parseLatLng(loc?: string): [number, number] | null {
  if (!loc) return null;
  const m = String(loc).match(/(-?\d+\.?\d*)\s*[, ]\s*(-?\d+\.?\d*)/);
  if (m) {
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  return null;
}

export function coordsForClass(c: { Location?: string; 'Kod DUN'?: string }): [number, number] {
  const fromLoc = parseLatLng(c.Location);
  if (fromLoc) return fromLoc;
  const dun = String(c['Kod DUN'] || '').trim();
  if (DUN_COORDS[dun]) return DUN_COORDS[dun];
  return [6.444, 100.198]; // Default Kangar
}

export function isAssignmentActive(a: { StatusPenugasan?: any; StatusTugasan?: any; Status?: any }): boolean {
  const v = a.StatusPenugasan !== undefined ? a.StatusPenugasan : (a.StatusTugasan !== undefined ? a.StatusTugasan : a.Status);
  if (v === true || v === 'TRUE' || v === 'True' || v === 'Aktif' || v === 1 || v === '1') return true;
  if (v === false || v === 'FALSE' || v === 'False' || v === 'Tidak Aktif' || v === 0 || v === '0') return false;
  return true; // default active
}

/**
 * Membuang perpuluhan pada Tahun Mula Operasi (contoh: 1980.0 -> 1980)
 */
export function formatTahunOperasi(val: any): string {
  if (val === undefined || val === null || val === '') return '—';
  const str = String(val).trim();
  if (!str) return '—';
  const clean = str.replace(/\.0+$/, '');
  const num = parseFloat(clean);
  if (!isNaN(num) && Number.isFinite(num)) {
    return Math.floor(num).toString();
  }
  return clean;
}

