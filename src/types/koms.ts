export interface ClassRecord {
  ClassID: string;
  DivisionID: string;
  ClassTypeID: string;
  Negeri?: string;
  'Kod Parlimen'?: string;
  KodParlimen?: string;
  Parlimen?: string;
  Tier?: string;
  'Kod DUN'?: string;
  KodDUN?: string;
  DUN?: string;
  Daerah?: string;
  ClassName: string;
  Address?: string;
  Location?: string;
  'Waktu Mula Operasi'?: string;
  'Waktu Tamat Operasi'?: string;
  'Masa Operasi'?: string;
  'Tahun Mula Operasi'?: string;
  'Class Image 1'?: string;
  'Class Image 2'?: string;
  'Class Image 3'?: string;
  'Class Image 4'?: string;
  'Status Bangunan'?: string;
  StatusBangunan?: string;
  'Jenis Bangunan'?: string;
  JenisBangunan?: string;
  'Status Milik Tanah'?: string;
  StatusMilikTanah?: string;
  StatusOperasi?: 'Aktif' | 'Tidak Aktif' | string;
  [key: string]: any;
}

export interface StaffRecord {
  StaffID: string;
  DivisionID?: string;
  ClassTypeID?: string;
  NegeriID?: string;
  ParlimenID?: string;
  DUNID?: string;
  Position?: string;
  Jawatan?: string;
  StaffName: string;
  IC_Number?: string;
  PhoneNumber?: string;
  Email?: string;
  DateJoined?: string;
  'Status Lantikan'?: string;
  StatusLantikan?: string;
  'Gambar Profil'?: string;
  GambarProfil?: string;
  StatusOperasi?: 'Aktif' | 'Tidak Aktif' | string;
  [key: string]: any;
}

export interface AssignmentRecord {
  AssignmentID: string;
  ClassID: string;
  StaffID: string;
  AssignmentDate?: string;
  Peranan?: string;
  Role?: string;
  StatusPenugasan?: string;
  StatusTugasan?: string;
  Status?: string;
  [key: string]: any;
}

export interface IssueRecord {
  IssueID: string;
  'Info Kerosakan'?: string;
  ClassID: string;
  ReportedByStaffID?: string;
  DateReported?: string;
  IssueDescription: string;
  Status: 'Baharu' | 'Dalam Tindakan' | 'Sedang Dibaiki' | 'Selesai' | string;
  Severity: 'Biasa' | 'Penting' | 'Kritikal' | string;
  PhotoAttachment?: string;
  Ulasan?: string;
  Penyelesaian?: string;
  'Status Terkini'?: string;
  Resolution?: string;
  DateResolved?: string;
  ResolvedByStaffID?: string;
  'Issue Image 1'?: string;
  'Issue Image 2'?: string;
  'Completion Image 1'?: string;
  'Completion Image 2'?: string;
  [key: string]: any;
}

export interface StatusBgnItem {
  'StatusBgn ID': string;
  StatusBgn: string;
}

export interface StatusTanahItem {
  'StatusTanah ID': string;
  StatusTanah: string;
}

export interface JawatanItem {
  'ID Jawatan': string;
  Division?: string;
  'Class Type'?: string;
  Jawatan: string;
}

export interface DivisionItem {
  DivisionID: string;
  DivisionName: string;
}

export interface ClassTypeItem {
  ClassTypeID: string;
  ClassTypeName: string;
  DivisionID: string;
  MinStaff?: number | string;
  MaxStaff?: number | string;
}

export interface BootstrapData {
  ok: boolean;
  spreadsheetName?: string;
  classes: ClassRecord[];
  staff: StaffRecord[];
  assignments: AssignmentRecord[];
  issues: IssueRecord[];
  statusBgn?: StatusBgnItem[];
  statusTanah?: StatusTanahItem[];
  jawatan?: JawatanItem[];
  divisions?: DivisionItem[];
  classTypes?: ClassTypeItem[];
}
