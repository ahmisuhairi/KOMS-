# Mockup & Reka Bentuk Visual Penuh KOMS (KEMAS Operative Management System)

Platform Pengurusan Operasi Lapangan KEMAS Negeri Perlis (Single Source of Truth - SSOT) untuk 266 premis kelas, 247 kakitangan, modul kerosakan, dan pemetaan GIS spatial 15 DUN.

---

## 1. Seni Bina Susun Atur Antaramuka (Layout Architecture)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [≡] [🎓 Logo]  KEMAS OPERATIVE MANAGEMENT SYSTEM (KOMS)      [Pilihan Tema ▾]          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ HUD 6 METRIK UTAMA ]                                                                │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐                     │
│  │ 1. FASILITI KELAS │ │ 2. STAFF          │ │ 3. TUGAS AKTIF    │                     │
│  │ 266 Premis        │ │ 247 Staf          │ │ 306 Penugasan     │                     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘                     │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐                     │
│  │ 4. KELAS ADA STAF │ │ 5. KELAS TNPA STAF│ │ 6. STAF TNPA KELAS│                     │
│  │ 262 Penempatan    │ │ 4 Perlu Tindakan  │ │ 7 Belum Dipadankan│                     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘                     │
│                                                                                        │
│  [ BAHAGIAN & JENIS KELAS ]                                                            │
│  ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐      │
│  │ PAK (Pendidikan Awal)  │ │ PKEM (Kemahiran)       │ │ PKOM (Komuniti)        │      │
│  │ 160 Premis             │ │ 55 Premis              │ │ 51 Premis              │      │
│  │ • Tabika: 144          │ │ • Jahitan: 14          │ │ • Pembangunan Insan: 42│      │
│  │ • Taska: 16            │ │ • Masakan: 9           │ │ • Pusat Sumber: 9      │      │
│  │                        │ │ • Komputer: 2          │ │ • PKK: 28              │      │
│  │                        │ │ • Dandanan Diri: 1     │ │ • Ekonomi Desa: 0      │      │
│  │                        │ │ • Seni Tangan: 1       │ │                        │      │
│  └────────────────────────┘ └────────────────────────┘ └────────────────────────┘      │
│                                                                                        │
│  [ MODUL AKTIF: DASHBOARD / KELAS SSOT / STAFF / ISU KEROSAKAN / PETA GIS ]            │
│  • Peta GIS Interaktif (15 DUN Perlis dengan pin status premis dan penapis DUN)       │
│  • Jadual Data Responsif & Paparan Kad (Card Deck View) untuk skrin mudah alih        │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 Utama]         [🏫 Kelas]        [👥 Staff]         [🔧 Isu (3)]       [🗺️ Peta]   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur 5 Modul Teras

| Modul | Ikon | Fungsi Utama | Komponen Kunci |
|---|---|---|---|
| **1. Utama** | `fa-house` | Dashboard eksekutif & ringkasan metrik lapangan | 6 HUD Kad Metrik, Ringkasan Bahagian (PAK/PKEM/PKOM), Status Bangunan, Isu Kerosakan Kritikal |
| **2. Kelas SSOT** | `fa-school` | Pangkalan data 266 premis kelas seluruh Perlis | Carian pantas, penapis Parlimen/DUN, penapis status bangunan/pemilikan, Dossier Kelas, Borang Kemaskini Premis |
| **3. Staff** | `fa-users` | Direktori 247 kakitangan KEMAS | Status lantikan (Tetap/Kontrak), status penugasan kelas, fungsi panggilan terus & WhatsApp, kemaskini profil |
| **4. Isu & Kerosakan** | `fa-wrench` | Penjejakan aduan fizikal premis 4 peringkat | Peringkat (Baru, Disahkan, Dalam Pembaikan, Selesai), penarafan impak keselamatan, muat naik bukti bergambar |
| **5. Peta GIS** | `fa-map-location-dot` | Pemetaan spatial geolokasi 15 DUN Perlis | Sempadan DUN, koordinat GPS tepat, pin berkod warna jenis kelas, pop-up butiran segera |

---

## 3. Sistem 3 Tema Visual (Standardized Theme System)

1. **🌙 Dark Mode (`theme-dark`)**
   - *Latar Belakang*: Arang gelap pekat (`#0B0F19`)
   - *Header & Kad*: Kontras tinggi (`#111827` / `#161F30`)
   - *Aksen*: Emas rasmi (`#C5A059`)
   - *Sesuai untuk*: Penggunaan waktu malam & paparan pusat operasi (NOC)

2. **🔷 Elegant Dark Blue (`theme-ocean`)**
   - *Latar Belakang*: Biru laut dalam diraja (`#06101E`)
   - *Header & Kad*: Midnight navy (`#0A192F` / `#10203B`)
   - *Aksen*: Cyan sapphire (`#38BDF8`)
   - *Sesuai untuk*: Paparan korporat rasmi agensi kerajaan

3. **☀️ Minimalist White (`theme-light`)**
   - *Latar Belakang*: Putih kelabu moden (`#F8FAFC`)
   - *Header & Kad*: Putih bersih (`#FFFFFF`) dengan border halus (`#E2E8F0`)
   - *Aksen*: Amber tembaga hangat (`#B45309`)
   - *Sesuai untuk*: Penggunaan waktu siang di bawah cahaya matahari terik atau percetakan dokumen

---

## 4. Keistimewaan Reka Bentuk Mudah Alih & Desktop
- **Spacing Seimbang**: Margin dan padding konsisten (`px-5 sm:px-8 lg:px-12`) memberi ruang pernafasan visual yang selesa pada semua saiz skrin.
- **Navigasi Dwi-Akses**:
  - *Bawah (Bottom Dock Bar)*: Akses pantas ibu jari untuk peranti telefon pintar.
  - *Atas Kiri (Hamburger Drawer)*: Menu konsol lengkap dengan profil pengguna, pintasan modul, pilihan tema, dan eksport data XLSX/GAS.
- **Dua Mod Paparan Data**: Jadual data penuh automatik beralih kepada kad tersusun (Card View) pada skrin telefon pintar di bawah 768px.
