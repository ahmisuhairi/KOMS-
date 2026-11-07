import React, { useState, useMemo } from 'react';
import { useKoms } from '../context/KomsContext';
import { classIdKey } from '../utils/komsConstants';
import { IssueRecord } from '../types/koms';

export const KerosakanModule: React.FC = () => {
  const {
    issues,
    classes,
    setIsAddingIssue,
    setSelectedIssue,
    advanceIssueStatus,
    setSelectedClass
  } = useKoms();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [activeStageTab, setActiveStageTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'pipeline'>('kanban');

  // 4 Workflow stages strictly in order
  const workflowStages = [
    {
      id: 'Baharu',
      step: 1,
      name: 'Baharu',
      fullName: '1. Baharu (Laporan Awal)',
      desc: 'Laporan kerosakan diterima dari premis',
      color: '#F43F5E',
      badgeBg: 'rgba(244,63,94,0.15)',
      borderColor: 'rgba(244,63,94,0.35)',
      icon: 'fa-triangle-exclamation'
    },
    {
      id: 'Dalam Tindakan',
      step: 2,
      name: 'Dalam Tindakan',
      fullName: '2. Dalam Tindakan',
      desc: 'Siasatan tapak & pelan pembaikan',
      color: '#F59E0B',
      badgeBg: 'rgba(245,158,11,0.15)',
      borderColor: 'rgba(245,158,11,0.35)',
      icon: 'fa-clock-rotate-left'
    },
    {
      id: 'Sedang Dibaiki',
      step: 3,
      name: 'Sedang Dibaiki',
      fullName: '3. Sedang Dibaiki',
      desc: 'Kerja kontraktor / pembaikan fizikal',
      color: '#3B82F6',
      badgeBg: 'rgba(59,130,246,0.15)',
      borderColor: 'rgba(59,130,246,0.35)',
      icon: 'fa-screwdriver-wrench'
    },
    {
      id: 'Selesai',
      step: 4,
      name: 'Selesai',
      fullName: '4. Selesai',
      desc: 'Pembaikan disahkan & ditutup',
      color: '#10B981',
      badgeBg: 'rgba(16,185,129,0.15)',
      borderColor: 'rgba(16,185,129,0.35)',
      icon: 'fa-circle-check'
    }
  ];

  // Helper normalizer
  const normalizeStatus = (s?: string): string => {
    const raw = String(s || 'Baharu').trim().toLowerCase();
    if (raw === 'baharu' || raw === 'baru' || raw === 'new' || raw === 'terbuka') return 'Baharu';
    if (raw.includes('dalam')) return 'Dalam Tindakan';
    if (raw.includes('sedang') || raw.includes('baiki')) return 'Sedang Dibaiki';
    if (raw.includes('selesai') || raw === 'done' || raw === 'closed') return 'Selesai';
    return s || 'Baharu';
  };

  // Group all issues by stage
  const allIssuesByStage = useMemo(() => {
    const groups: Record<string, IssueRecord[]> = {
      Baharu: [],
      'Dalam Tindakan': [],
      'Sedang Dibaiki': [],
      Selesai: []
    };

    issues.forEach(i => {
      const st = normalizeStatus(i.Status);
      if (groups[st]) {
        groups[st].push(i);
      } else {
        groups['Baharu'].push(i);
      }
    });

    return groups;
  }, [issues]);

  const totalIssuesCount = issues.length;
  const selesaiCount = allIssuesByStage['Selesai']?.length || 0;
  const activeIssuesCount = totalIssuesCount - selesaiCount;
  const resolutionRate = totalIssuesCount > 0 ? Math.round((selesaiCount / totalIssuesCount) * 100) : 100;
  const criticalCount = issues.filter(i => i.Severity === 'Kritikal' && normalizeStatus(i.Status) !== 'Selesai').length;

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter(i => {
      const stage = normalizeStatus(i.Status);
      if (activeStageTab !== 'all' && stage !== activeStageTab) {
        return false;
      }

      if (severityFilter && i.Severity !== severityFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchedClass = classes.find(c => {
          return classIdKey(c.ClassID) === classIdKey(i.ClassID) || c.ClassID === i.ClassID || String(i.ClassID).includes(c.ClassID);
        });
        const matchDesc = i.IssueDescription?.toLowerCase().includes(q);
        const matchId = i.IssueID?.toLowerCase().includes(q);
        const matchClassName = matchedClass?.ClassName?.toLowerCase().includes(q);
        const matchDun = matchedClass?.DUN?.toLowerCase().includes(q);
        if (!matchDesc && !matchId && !matchClassName && !matchDun) return false;
      }

      return true;
    });
  }, [issues, searchQuery, severityFilter, activeStageTab, classes]);

  const filteredIssuesByStage = useMemo(() => {
    const groups: Record<string, IssueRecord[]> = {
      Baharu: [],
      'Dalam Tindakan': [],
      'Sedang Dibaiki': [],
      Selesai: []
    };

    filteredIssues.forEach(i => {
      const st = normalizeStatus(i.Status);
      if (groups[st]) {
        groups[st].push(i);
      } else {
        groups['Baharu'].push(i);
      }
    });

    return groups;
  }, [filteredIssues]);

  // Render individual Issue Card (Spacious, Heightened & High-Visual)
  const renderIssueCard = (issue: IssueRecord, currentStageId: string) => {
    const matchedClass = classes.find(c => {
      return classIdKey(c.ClassID) === classIdKey(issue.ClassID) || c.ClassID === issue.ClassID || String(issue.ClassID).includes(c.ClassID);
    });

    const hasProof = issue['Completion Image 1'] || issue['Completion Image 2'];
    const hasReportImg = issue['Issue Image 1'] || issue.PhotoAttachment || issue['Issue Image 2'];
    const previewImg = issue['Issue Image 1'] || issue.PhotoAttachment || issue['Completion Image 1'];

    const stageObj = workflowStages.find(s => s.id === currentStageId) || workflowStages[0];

    return (
      <div
        key={`issue-card-${issue.IssueID}`}
        className="appos-card-subtle p-5 rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all flex flex-col justify-between gap-4 shadow-md min-h-[220px]"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(10,25,47,0.9) 100%)'
        }}
      >
        <div>
          {/* Card Top: Badges & Severity */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white/5 border border-white/10" style={{ color: 'var(--accent-color)' }}>
                {issue.IssueID}
              </span>
              <span
                className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1.5"
                style={{
                  background: stageObj.badgeBg,
                  color: stageObj.color,
                  border: `1px solid ${stageObj.borderColor}`
                }}
              >
                <i className={`fa-solid ${stageObj.icon} text-[9px]`}></i>
                <span>Fasa {stageObj.step}/4 • {stageObj.name}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  issue.Severity === 'Kritikal'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : issue.Severity === 'Penting'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                }`}
              >
                {issue.Severity === 'Kritikal' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5"></span>
                )}
                {issue.Severity || 'Biasa'}
              </span>
            </div>
          </div>

          {/* Premise Link */}
          <div
            onClick={() => matchedClass && setSelectedClass(matchedClass)}
            className="text-xs font-bold text-amber-400 cursor-pointer hover:underline flex items-center gap-1.5 line-clamp-1 mb-1.5"
            title="Klik untuk buka Dossier Premis"
          >
            <i className="fa-solid fa-school text-xs"></i>
            <span>{matchedClass ? matchedClass.ClassName : issue.ClassID}</span>
            {matchedClass?.DUN && (
              <span className="text-[10px] font-mono text-slate-400 font-normal">
                ({matchedClass.DUN})
              </span>
            )}
          </div>

          {/* Issue Description */}
          <h5
            onClick={() => setSelectedIssue(issue)}
            className="text-sm font-extrabold text-white leading-snug cursor-pointer hover:text-amber-300 transition-colors line-clamp-3 mb-2"
          >
            {issue.IssueDescription}
          </h5>

          {/* Optional Thumbnail or Image Preview */}
          {previewImg && (
            <div
              onClick={() => setSelectedIssue(issue)}
              className="mt-2 mb-2 w-full h-24 rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-950 relative cursor-pointer group"
            >
              <img
                src={previewImg}
                alt={issue.IssueDescription}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] text-white flex items-center gap-1 font-semibold">
                  <i className="fa-regular fa-image"></i> Gambar Laporan Kerosakan
                </span>
              </div>
            </div>
          )}

          {/* Meta details */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar text-[10px]"></i>
              {issue.DateReported || 'Tarikh tidak dicatat'}
            </span>
            <div className="flex items-center gap-2">
              {hasReportImg && (
                <span className="text-[10px] text-blue-400" title="Lampiran gambar awal disertakan">
                  <i className="fa-solid fa-camera"></i> Foto
                </span>
              )}
              {hasProof && (
                <span className="text-[10px] text-emerald-400" title="Bukti pembaikan siap tersedia">
                  <i className="fa-solid fa-check-double"></i> Bukti Siap
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer: Status Progression Quick Actions */}
        <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2 mt-1">
          <button
            onClick={() => setSelectedIssue(issue)}
            className="btn-action text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-slate-300 hover:text-white"
            title="Buka butiran lengkap laporan isu"
          >
            <i className="fa-solid fa-circle-info text-amber-400"></i>
            <span>Butiran</span>
          </button>

          <div className="flex items-center gap-1.5">
            {currentStageId === 'Baharu' && (
              <button
                onClick={() => advanceIssueStatus(issue.IssueID, 'Dalam Tindakan')}
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold hover:bg-amber-500/30 flex items-center gap-1.5"
                title="Tolak ke Fasa 2: Dalam Tindakan"
              >
                <i className="fa-solid fa-play text-[10px]"></i>
                <span>Mula Tindakan</span>
              </button>
            )}

            {currentStageId === 'Dalam Tindakan' && (
              <button
                onClick={() => advanceIssueStatus(issue.IssueID, 'Sedang Dibaiki')}
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold hover:bg-blue-500/30 flex items-center gap-1.5"
                title="Tolak ke Fasa 3: Kerja Pembaikan"
              >
                <i className="fa-solid fa-screwdriver-wrench text-[10px]"></i>
                <span>Mula Pembaikan</span>
              </button>
            )}

            {currentStageId === 'Sedang Dibaiki' && (
              <button
                onClick={() => advanceIssueStatus(issue.IssueID, 'Selesai')}
                className="btn-action text-xs py-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold hover:bg-emerald-500/30 flex items-center gap-1.5"
                title="Tolak ke Fasa 4: Tanda Selesai"
              >
                <i className="fa-solid fa-check text-[10px]"></i>
                <span>Tanda Selesai</span>
              </button>
            )}

            {currentStageId === 'Selesai' && (
              <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <i className="fa-solid fa-circle-check"></i>
                <span>Telah Selesai</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ============================================================== */}
      {/* 1. VISUAL EXECUTIVE BANNER & PROGRESS TRACKER                  */}
      {/* ============================================================== */}
      <div className="appos-card p-5 sm:p-6 rounded-2xl flex flex-col gap-5 shadow-xl border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg text-xl"
              style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)' }}
            >
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="badge-status badge-live text-[9px]">PENGURUSAN FASILITI</span>
                <span className="text-[11px] font-bold text-amber-400 font-mono">SSOT WORKFLOW</span>
                {criticalCount > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                    {criticalCount} Isu Kritikal Terbuka
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight leading-snug">
                Pemantauan &amp; Tindakan Aduan Kerosakan Premis
              </h2>
              <p className="appos-text-muted text-xs mt-1">
                Aliran kerja 4 fasa berstruktur bagi merekod, menyiasat, membaiki, dan mengesahkan aduan kerosakan di seluruh premis KEMAS Perlis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddingIssue(true)}
              className="btn-action btn-gold text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Laporkan Isu Baharu</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Visual Stage KPI Pipeline Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {workflowStages.map(stage => {
            const count = allIssuesByStage[stage.id]?.length || 0;
            const isCurrentTab = activeStageTab === stage.id;

            return (
              <div
                key={stage.id}
                onClick={() => setActiveStageTab(activeStageTab === stage.id ? 'all' : stage.id)}
                className={`appos-card-subtle p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer border transition-all shadow-md min-h-[140px] ${
                  isCurrentTab
                    ? 'ring-2 ring-[var(--accent-color)] scale-[1.02]'
                    : 'hover:border-slate-400'
                }`}
                style={{
                  background: isCurrentTab
                    ? 'linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%)'
                    : 'rgba(15,23,42,0.6)',
                  borderColor: isCurrentTab ? 'var(--accent-color)' : stage.borderColor
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: stage.badgeBg, color: stage.color }}
                    >
                      {stage.step}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      {stage.name}
                    </span>
                  </div>
                  <i className={`fa-solid ${stage.icon} text-sm`} style={{ color: stage.color }}></i>
                </div>

                <div>
                  <b className="font-mono text-3xl sm:text-4xl text-white block leading-none">
                    {count}
                  </b>
                  <p className="text-[10.5px] text-slate-400 mt-2 line-clamp-1">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resolution Rate Progress Meter */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--border-color)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <i className="fa-solid fa-chart-line text-emerald-400"></i>
              <span>Kadar Penyelesaian Isu:</span>
              <span className="text-emerald-400 font-mono text-sm">{resolutionRate}%</span>
            </span>
            <span className="text-slate-400 font-mono">
              {selesaiCount} selesai daripada {totalIssuesCount} rekod ({activeIssuesCount} aktif)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(allIssuesByStage['Selesai'].length / (totalIssuesCount || 1)) * 100}%` }}
              title={`Selesai: ${allIssuesByStage['Selesai'].length}`}
            ></div>
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(allIssuesByStage['Sedang Dibaiki'].length / (totalIssuesCount || 1)) * 100}%` }}
              title={`Sedang Dibaiki: ${allIssuesByStage['Sedang Dibaiki'].length}`}
            ></div>
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${(allIssuesByStage['Dalam Tindakan'].length / (totalIssuesCount || 1)) * 100}%` }}
              title={`Dalam Tindakan: ${allIssuesByStage['Dalam Tindakan'].length}`}
            ></div>
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${(allIssuesByStage['Baharu'].length / (totalIssuesCount || 1)) * 100}%` }}
              title={`Baharu: ${allIssuesByStage['Baharu'].length}`}
            ></div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FILTER & VIEW CONTROLS TOOLBAR                              */}
      {/* ============================================================== */}
      <div className="appos-card p-4 sm:p-5 rounded-2xl flex flex-col gap-4 shadow-md border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Cari ID, tajuk isu, nama premis, DUN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full filter-select py-2 pl-9 pr-3 rounded-xl text-xs"
              style={{ background: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Severity & View Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Severity Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-[var(--border-color)]">
              <button
                onClick={() => setSeverityFilter('')}
                className={`text-xs py-1.5 px-3 rounded-lg font-bold transition-colors ${
                  severityFilter === '' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua Tahap
              </button>
              <button
                onClick={() => setSeverityFilter('Kritikal')}
                className={`text-xs py-1.5 px-3 rounded-lg font-bold transition-colors ${
                  severityFilter === 'Kritikal' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Kritikal
              </button>
              <button
                onClick={() => setSeverityFilter('Penting')}
                className={`text-xs py-1.5 px-3 rounded-lg font-bold transition-colors ${
                  severityFilter === 'Penting' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Penting
              </button>
              <button
                onClick={() => setSeverityFilter('Biasa')}
                className={`text-xs py-1.5 px-3 rounded-lg font-bold transition-colors ${
                  severityFilter === 'Biasa' ? 'bg-blue-500/25 text-blue-300 border border-blue-500/50' : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                Biasa
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-[var(--border-color)]">
              <button
                onClick={() => setViewMode('kanban')}
                className={`text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Papan Visual 4 Fasa (Kanban)"
              >
                <i className="fa-solid fa-table-columns"></i>
                <span>Papan Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('pipeline')}
                className={`text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'pipeline'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Paparan Aliran Fasa Berurutan"
              >
                <i className="fa-solid fa-bars-staggered"></i>
                <span>Aliran Fasa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Stage Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold shrink-0">Tapis Status:</span>
          <button
            onClick={() => setActiveStageTab('all')}
            className={`btn-action py-1 px-3 rounded-lg shrink-0 font-bold ${
              activeStageTab === 'all' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'text-slate-400'
            }`}
          >
            Semua Status ({filteredIssues.length})
          </button>
          {workflowStages.map(st => (
            <button
              key={`filter-${st.id}`}
              onClick={() => setActiveStageTab(st.id)}
              className={`btn-action py-1 px-3 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
                activeStageTab === st.id
                  ? 'ring-1 text-white'
                  : 'text-slate-400'
              }`}
              style={{
                borderColor: activeStageTab === st.id ? st.color : undefined,
                color: activeStageTab === st.id ? st.color : undefined
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }}></span>
              <span>{st.name} ({allIssuesByStage[st.id]?.length || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN VISUAL PRESENTATION (KANBAN BOARD OR PIPELINE VIEW)   */}
      {/* ============================================================== */}
      {viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW (4 Side-by-Side Responsive Columns) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {workflowStages.map(stage => {
            const stageIssues = filteredIssuesByStage[stage.id] || [];

            return (
              <div
                key={`kanban-${stage.id}`}
                className="appos-card p-4 sm:p-4.5 rounded-2xl flex flex-col gap-3.5 border border-[var(--border-color)] bg-slate-950/70"
                style={{
                  borderTop: `4px solid ${stage.color}`
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: stage.badgeBg, color: stage.color }}
                    >
                      {stage.step}
                    </span>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      {stage.name}
                    </h4>
                  </div>
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: stage.badgeBg, color: stage.color }}
                  >
                    {stageIssues.length}
                  </span>
                </div>

                {/* Issues Cards in this Column */}
                <div className="flex flex-col gap-3.5 min-h-[300px]">
                  {stageIssues.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500 my-auto">
                      <i className={`fa-solid ${stage.icon} text-lg mb-2 block opacity-40`} style={{ color: stage.color }}></i>
                      Tiada rekod dalam fasa ini
                    </div>
                  ) : (
                    stageIssues.map(issue => renderIssueCard(issue, stage.id))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PIPELINE VIEW (Sequential Phase Sections with spacious 2-col cards) */
        <div className="flex flex-col gap-6">
          {workflowStages.map(stage => {
            const stageIssues = filteredIssuesByStage[stage.id] || [];
            if (activeStageTab !== 'all' && activeStageTab !== stage.id) return null;

            return (
              <div
                key={`pipeline-${stage.id}`}
                className="appos-card p-5 sm:p-6 rounded-2xl flex flex-col gap-4 border border-[var(--border-color)] shadow-md"
                style={{
                  borderLeft: `5px solid ${stage.color}`
                }}
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-color)] gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-md shrink-0"
                      style={{ background: stage.badgeBg, color: stage.color }}
                    >
                      <i className={`fa-solid ${stage.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        {stage.fullName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-lg self-start sm:self-auto"
                    style={{ background: stage.badgeBg, color: stage.color, border: `1px solid ${stage.borderColor}` }}
                  >
                    {stageIssues.length} rekod isu
                  </span>
                </div>

                {/* Issues in this stage */}
                {stageIssues.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    Tiada rekod kerosakan dalam status {stage.name}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stageIssues.map(issue => renderIssueCard(issue, stage.id))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
