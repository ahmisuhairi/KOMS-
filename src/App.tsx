import React from 'react';
import { KomsProvider, useKoms } from './context/KomsContext';
import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { UtamaDashboard } from './components/UtamaDashboard';
import { KelasModule } from './components/KelasModule';
import { StaffModule } from './components/StaffModule';
import { PenugasanModule } from './components/PenugasanModule';
import { KerosakanModule } from './components/KerosakanModule';
import { PetaGISModule } from './components/PetaGISModule';
import { ClassDetailModal } from './components/ClassDetailModal';
import { ClassEditModal } from './components/ClassEditModal';
import { StaffDetailModal } from './components/StaffDetailModal';
import { StaffEditModal } from './components/StaffEditModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { IssueModal } from './components/IssueModal';
import { GasCodeModal } from './components/GasCodeModal';

const MainContent: React.FC = () => {
  const { currentModule, tukarModul, issues } = useKoms();

  const openIssuesCount = issues.filter(i => i.Status !== 'Selesai').length;

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* App Header */}
      <Header />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 lg:px-12 py-5 sm:py-6">
        {currentModule === 'utama' && <UtamaDashboard />}
        {currentModule === 'kelas' && <KelasModule />}
        {currentModule === 'staff' && <StaffModule />}
        {currentModule === 'penugasan' && <PenugasanModule />}
        {currentModule === 'kerosakan' && <KerosakanModule />}
        {currentModule === 'peta' && <PetaGISModule />}
      </main>

      {/* Footer */}
      <footer
        className="mt-auto px-5 sm:px-8 lg:px-12 py-4 text-xs border-t"
        style={{
          background: 'var(--bg-header)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-muted)'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
          <span className="font-mono">
            KOD INTEGRITI: SHA256-KOMS-CLASS-MANAGEMENT-SSOT-2026
          </span>
          <span className="font-bold" style={{ color: 'var(--accent-color)' }}>
            KOMS • Created by: AppOS • Ku Ahmisuhairi
          </span>
        </div>
      </footer>

      {/* Floating & Modal Overlays */}
      <Drawer />
      <BottomNav />
      <Toast />

      <ClassDetailModal />
      <ClassEditModal />

      <StaffDetailModal />
      <StaffEditModal />

      <IssueDetailModal />
      <IssueModal />

      <GasCodeModal />
    </div>
  );
};

export default function App() {
  return (
    <KomsProvider>
      <MainContent />
    </KomsProvider>
  );
}
