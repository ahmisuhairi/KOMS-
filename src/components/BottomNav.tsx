import React from 'react';
import { useKoms, KomsModule } from '../context/KomsContext';

export const BottomNav: React.FC = () => {
  const { currentModule, tukarModul, issues } = useKoms();

  const openIssuesCount = issues.filter(i => i.Status !== 'Selesai').length;

  const navItems: Array<{ id: KomsModule; label: string; icon: string; badge?: number }> = [
    { id: 'utama', label: 'Utama', icon: 'fa-house' },
    { id: 'kelas', label: 'Kelas', icon: 'fa-school' },
    { id: 'staff', label: 'Staff', icon: 'fa-users' },
    { id: 'penugasan', label: 'Tugas', icon: 'fa-link' },
    { id: 'kerosakan', label: 'Isu', icon: 'fa-wrench', badge: openIssuesCount > 0 ? openIssuesCount : undefined },
    { id: 'peta', label: 'Peta', icon: 'fa-map-location-dot' }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 z-40 flex justify-around items-center px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      style={{
        background: 'var(--bg-header)',
        borderTop: '1px solid var(--border-color)'
      }}
    >
      {navItems.map(item => {
        const isActive = currentModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => tukarModul(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
              isActive ? 'font-extrabold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-muted)' }}
          >
            <div className="relative">
              <i className={`fa-solid ${item.icon} text-base mb-0.5`}></i>
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
