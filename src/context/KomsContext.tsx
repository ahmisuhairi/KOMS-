import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import initialData from '../data/bootstrapData.json';
import {
  ClassRecord,
  StaffRecord,
  AssignmentRecord,
  IssueRecord,
  StatusBgnItem,
  StatusTanahItem,
  JawatanItem,
  DivisionItem,
  ClassTypeItem
} from '../types/koms';
import { isAssignmentActive } from '../utils/komsConstants';

export type KomsModule = 'utama' | 'kelas' | 'staff' | 'penugasan' | 'kerosakan' | 'peta';
export type KomsTheme = 'theme-dark' | 'theme-ocean' | 'theme-light';

interface ExtraKelasFilter {
  type: 'statusBgn' | 'statusTanah' | 'division' | 'classType' | 'parlimen' | 'noStaff' | 'hasStaff';
  value?: string;
}

interface ExtraStaffFilter {
  type: 'parlimen' | 'noClass' | 'lantikan';
  value?: string;
}

interface ToastInfo {
  title: string;
  message: string;
  visible: boolean;
}

interface KomsContextType {
  classes: ClassRecord[];
  staff: StaffRecord[];
  assignments: AssignmentRecord[];
  issues: IssueRecord[];
  statusBgn: StatusBgnItem[];
  statusTanah: StatusTanahItem[];
  jawatan: JawatanItem[];
  divisions: DivisionItem[];
  classTypes: ClassTypeItem[];

  currentModule: KomsModule;
  currentTheme: KomsTheme;
  isDrawerOpen: boolean;
  toast: ToastInfo;

  selectedClass: ClassRecord | null;
  selectedStaff: StaffRecord | null;
  selectedIssue: IssueRecord | null;

  editingClass: ClassRecord | null;
  editingStaff: StaffRecord | null;
  editingIssue: IssueRecord | null;

  isAddingIssue: boolean;
  prefilledClassIdForIssue: string | null;
  isAddingClass: boolean;
  isAddingStaff: boolean;
  isAddingAssignment: boolean;
  showGasCodeModal: boolean;

  kelasExtraFilter: ExtraKelasFilter | null;
  staffExtraFilter: ExtraStaffFilter | null;

  tukarModul: (mod: KomsModule) => void;
  tukarTema: (theme: KomsTheme) => void;
  toggleDrawer: (open?: boolean) => void;
  showToast: (title: string, message: string) => void;

  setSelectedClass: (c: ClassRecord | null) => void;
  setSelectedStaff: (s: StaffRecord | null) => void;
  setSelectedIssue: (i: IssueRecord | null) => void;

  setEditingClass: (c: ClassRecord | null) => void;
  setEditingStaff: (s: StaffRecord | null) => void;
  setEditingIssue: (i: IssueRecord | null) => void;

  setIsAddingIssue: (open: boolean, prefillClassId?: string | null) => void;
  setIsAddingClass: (open: boolean) => void;
  setIsAddingStaff: (open: boolean) => void;
  setIsAddingAssignment: (open: boolean) => void;
  setShowGasCodeModal: (open: boolean) => void;

  setKelasExtraFilter: (filter: ExtraKelasFilter | null) => void;
  setStaffExtraFilter: (filter: ExtraStaffFilter | null) => void;

  upsertClass: (c: ClassRecord) => void;
  upsertStaff: (s: StaffRecord) => void;
  toggleSoftDeleteClass: (classId: string) => void;
  toggleSoftDeleteStaff: (staffId: string) => void;
  upsertAssignment: (a: AssignmentRecord) => void;
  toggleAssignmentStatus: (assignmentId: string) => void;
  upsertIssue: (i: IssueRecord) => void;
  advanceIssueStatus: (issueId: string, nextStatus: string) => void;

  exportXLSX: () => void;
  resetAllData: () => void;
}

const KomsContext = createContext<KomsContextType | undefined>(undefined);

export const KomsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassRecord[]>(() => {
    try {
      const saved = localStorage.getItem('koms_classes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return (initialData.classes as ClassRecord[]) || [];
  });

  const [staff, setStaff] = useState<StaffRecord[]>(() => {
    try {
      const saved = localStorage.getItem('koms_staff');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return (initialData.staff as StaffRecord[]) || [];
  });

  const [assignments, setAssignments] = useState<AssignmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('koms_assignments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return (initialData.assignments as AssignmentRecord[]) || [];
  });

  const [issues, setIssues] = useState<IssueRecord[]>(() => {
    try {
      const saved = localStorage.getItem('koms_issues');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return (initialData.issues as IssueRecord[]) || [];
  });

  const statusBgn = (initialData.statusBgn as StatusBgnItem[]) || [];
  const statusTanah = (initialData.statusTanah as StatusTanahItem[]) || [];
  const jawatan = (initialData.jawatan as JawatanItem[]) || [];
  const divisions = (initialData.divisions as DivisionItem[]) || [];
  const classTypes = (initialData.classTypes as ClassTypeItem[]) || [];

  const [currentModule, setCurrentModule] = useState<KomsModule>('utama');
  const [currentTheme, setCurrentTheme] = useState<KomsTheme>(() => {
    try {
      const saved = localStorage.getItem('koms_theme') as KomsTheme;
      if (saved) return saved;
    } catch (e) {}
    return 'theme-dark';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<ToastInfo>({ title: '', message: '', visible: false });

  const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueRecord | null>(null);

  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [editingIssue, setEditingIssue] = useState<IssueRecord | null>(null);

  const [isAddingIssue, setIsAddingIssueState] = useState(false);
  const [prefilledClassIdForIssue, setPrefilledClassIdForIssue] = useState<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [showGasCodeModal, setShowGasCodeModal] = useState(false);

  const [kelasExtraFilter, setKelasExtraFilter] = useState<ExtraKelasFilter | null>(null);
  const [staffExtraFilter, setStaffExtraFilter] = useState<ExtraStaffFilter | null>(null);

  // Apply theme to body
  useEffect(() => {
    document.body.className = currentTheme;
    try {
      localStorage.setItem('koms_theme', currentTheme);
    } catch (e) {}
  }, [currentTheme]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('koms_classes', JSON.stringify(classes));
    } catch (e) {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem('koms_staff', JSON.stringify(staff));
    } catch (e) {}
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem('koms_assignments', JSON.stringify(assignments));
    } catch (e) {}
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem('koms_issues', JSON.stringify(issues));
    } catch (e) {}
  }, [issues]);

  const showToast = (title: string, message: string) => {
    setToast({ title, message, visible: true });
    setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
    }, 2800);
  };

  const tukarModul = (mod: KomsModule) => {
    setCurrentModule(mod);
    setSelectedClass(null);
    setSelectedStaff(null);
    setSelectedIssue(null);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tukarTema = (theme: KomsTheme) => {
    setCurrentTheme(theme);
    showToast('Tema', `Tema ditukar: ${theme}`);
  };

  const toggleDrawer = (open?: boolean) => {
    setIsDrawerOpen(prev => (open !== undefined ? open : !prev));
  };

  const setIsAddingIssue = (open: boolean, prefillClassId: string | null = null) => {
    setIsAddingIssueState(open);
    setPrefilledClassIdForIssue(prefillClassId);
    if (open) {
      setCurrentModule('kerosakan');
    }
  };

  const upsertClass = (c: ClassRecord) => {
    setClasses(prev => {
      // If editing an existing class, match both ClassID and original ClassName or ClassID
      const idx = prev.findIndex(item => 
        (item.ClassID === c.ClassID && item.ClassName === c.ClassName) ||
        item.ClassID === c.ClassID
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = c;
        return copy;
      }
      return [c, ...prev];
    });
    setEditingClass(null);
    if (selectedClass && selectedClass.ClassID === c.ClassID) {
      setSelectedClass(c);
    }
    showToast('Kelas Disimpan', `${c.ClassName || c.ClassID} berjaya dikemaskini.`);
  };

  const upsertStaff = (s: StaffRecord) => {
    setStaff(prev => {
      const idx = prev.findIndex(item => item.StaffID === s.StaffID);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = s;
        return copy;
      }
      return [s, ...prev];
    });
    setEditingStaff(null);
    if (selectedStaff && selectedStaff.StaffID === s.StaffID) {
      setSelectedStaff(s);
    }
    showToast('Staff Disimpan', `${s.StaffName} berjaya dikemaskini.`);
  };

  const toggleSoftDeleteClass = (classId: string) => {
    let nextStatus = 'Tidak Aktif';
    let targetName = classId;
    setClasses(prev => {
      return prev.map(c => {
        if (c.ClassID === classId) {
          targetName = c.ClassName || c.ClassID;
          const current = (c.StatusOperasi || 'Aktif').trim();
          nextStatus = current === 'Tidak Aktif' ? 'Aktif' : 'Tidak Aktif';
          const updated = { ...c, StatusOperasi: nextStatus };
          if (selectedClass && selectedClass.ClassID === classId) {
            setSelectedClass(updated);
          }
          return updated;
        }
        return c;
      });
    });
    const msg = nextStatus === 'Tidak Aktif'
      ? `Premis ${targetName} dinyahaktifkan (Soft Delete). Data kekal dalam pangkalan data.`
      : `Premis ${targetName} telah diaktifkan semula.`;
    showToast('Status Premis', msg);
  };

  const toggleSoftDeleteStaff = (staffId: string) => {
    let nextStatus = 'Tidak Aktif';
    let targetName = staffId;
    setStaff(prev => {
      return prev.map(s => {
        if (s.StaffID === staffId) {
          targetName = s.StaffName || s.StaffID;
          const current = (s.StatusOperasi || 'Aktif').trim();
          nextStatus = current === 'Tidak Aktif' ? 'Aktif' : 'Tidak Aktif';
          const updated = { ...s, StatusOperasi: nextStatus };
          if (selectedStaff && selectedStaff.StaffID === staffId) {
            setSelectedStaff(updated);
          }
          return updated;
        }
        return s;
      });
    });
    const msg = nextStatus === 'Tidak Aktif'
      ? `Staf ${targetName} dinyahaktifkan (Soft Delete). Data kekal dalam pangkalan data.`
      : `Staf ${targetName} telah diaktifkan semula.`;
    showToast('Status Staf', msg);
  };

  const upsertAssignment = (a: AssignmentRecord) => {
    setAssignments(prev => {
      const idx = prev.findIndex(item => item.AssignmentID === a.AssignmentID);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = a;
        return copy;
      }
      return [a, ...prev];
    });
    setIsAddingAssignment(false);
    showToast('Penugasan', 'Penugasan staf berjaya disimpan.');
  };

  const toggleAssignmentStatus = (assignmentId: string) => {
    setAssignments(prev => {
      return prev.map(a => {
        if (a.AssignmentID === assignmentId) {
          const currentlyActive = isAssignmentActive(a);
          const nextActive = !currentlyActive;
          return {
            ...a,
            StatusPenugasan: nextActive ? 'TRUE' : 'FALSE',
            StatusTugasan: nextActive ? 'Aktif' : 'Tidak Aktif'
          };
        }
        return a;
      });
    });
    showToast('Penugasan', 'Status penugasan telah dikemaskini.');
  };

  const upsertIssue = (i: IssueRecord) => {
    setIssues(prev => {
      const idx = prev.findIndex(item => item.IssueID === i.IssueID);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = i;
        return copy;
      }
      return [i, ...prev];
    });
    setEditingIssue(null);
    setIsAddingIssueState(false);
    if (selectedIssue && selectedIssue.IssueID === i.IssueID) {
      setSelectedIssue(i);
    }
    showToast('Isu Premis', `Isu ${i.IssueID} berjaya disimpan.`);
  };

  const advanceIssueStatus = (issueId: string, nextStatus: string) => {
    const target = issues.find(i => i.IssueID === issueId);
    if (!target) return;

    if (nextStatus === 'Selesai') {
      // Must prompt for completion images if not present
      if (!target['Completion Image 1'] && !target['Completion Image 2']) {
        setEditingIssue({ ...target, Status: 'Selesai' });
        showToast('Bukti Penutupan', 'Sila sertakan 2 gambar bukti selesai sebelum menyimpan status Selesai.');
        return;
      }
    }

    const updated: IssueRecord = {
      ...target,
      Status: nextStatus,
      DateResolved: nextStatus === 'Selesai' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : target.DateResolved
    };

    upsertIssue(updated);
    showToast('Status Isu', `Status diubah kepada: ${nextStatus}`);
  };

  const exportXLSX = () => {
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classes), 'Classes');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(staff), 'Staff');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assignments), 'StaffAssignments');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(issues), 'ClassIssues');
      XLSX.writeFile(wb, 'KOMS_Class_Management_SSOT.xlsx');
      showToast('Eksport XLSX', 'Fail KOMS_Class_Management_SSOT.xlsx berjaya dimuat turun.');
    } catch (e: any) {
      showToast('Ralat Eksport', e.message || 'Gagal eksport fail.');
    }
  };

  const resetAllData = () => {
    if (confirm('Set semula data kepada data asal SSOT? Semua perubahan sesi akan dipulihkan.')) {
      setClasses((initialData.classes as ClassRecord[]) || []);
      setStaff((initialData.staff as StaffRecord[]) || []);
      setAssignments((initialData.assignments as AssignmentRecord[]) || []);
      setIssues((initialData.issues as IssueRecord[]) || []);
      localStorage.removeItem('koms_classes');
      localStorage.removeItem('koms_staff');
      localStorage.removeItem('koms_assignments');
      localStorage.removeItem('koms_issues');
      showToast('Tetapan Semula', 'Semua data telah dikembalikan ke data asal.');
    }
  };

  return (
    <KomsContext.Provider
      value={{
        classes,
        staff,
        assignments,
        issues,
        statusBgn,
        statusTanah,
        jawatan,
        divisions,
        classTypes,
        currentModule,
        currentTheme,
        isDrawerOpen,
        toast,
        selectedClass,
        selectedStaff,
        selectedIssue,
        editingClass,
        editingStaff,
        editingIssue,
        isAddingIssue,
        prefilledClassIdForIssue,
        isAddingClass,
        isAddingStaff,
        isAddingAssignment,
        showGasCodeModal,
        kelasExtraFilter,
        staffExtraFilter,
        tukarModul,
        tukarTema,
        toggleDrawer,
        showToast,
        setSelectedClass,
        setSelectedStaff,
        setSelectedIssue,
        setEditingClass,
        setEditingStaff,
        setEditingIssue,
        setIsAddingIssue,
        setIsAddingClass,
        setIsAddingStaff,
        setIsAddingAssignment,
        setShowGasCodeModal,
        setKelasExtraFilter,
        setStaffExtraFilter,
        upsertClass,
        upsertStaff,
        toggleSoftDeleteClass,
        toggleSoftDeleteStaff,
        upsertAssignment,
        toggleAssignmentStatus,
        upsertIssue,
        advanceIssueStatus,
        exportXLSX,
        resetAllData
      }}
    >
      {children}
    </KomsContext.Provider>
  );
};

export const useKoms = () => {
  const context = useContext(KomsContext);
  if (!context) {
    throw new Error('useKoms must be used within a KomsProvider');
  }
  return context;
};
