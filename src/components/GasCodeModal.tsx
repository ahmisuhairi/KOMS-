import React, { useState } from 'react';
import { useKoms } from '../context/KomsContext';

export const GasCodeModal: React.FC = () => {
  const { showGasCodeModal, setShowGasCodeModal, showToast } = useKoms();
  const [activeTab, setActiveTab] = useState<'audit' | 'codegs' | 'index' | 'css' | 'js'>('audit');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!showGasCodeModal) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    showToast('Disalin', 'Kod telah disalin ke papan keratan.');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Dimuat Turun', `Fail ${filename} telah dimuat turun.`);
  };

  const codeGsContent = `/**
 * ============================================================
 * KOMS — KEMAS Operative Management System
 * Fail: Code.gs | AppOS Live Field Hub (Negeri Perlis)
 * ============================================================
 * Arahan Penggunaan Google Apps Script:
 * 1. Buka Google Sheet 'Class Management' anda.
 * 2. Klik Extensions > Apps Script.
 * 3. Salin & tampal 4 fail:
 *    - Code.gs (Fail Skrip)
 *    - Index.html (Fail HTML)
 *    - css.html (Fail HTML)
 *    - JavaScript.html (Fail HTML)
 * 4. Klik Deploy > New deployment > Web app:
 *    - Execute as: Me (akaun anda)
 *    - Who has access: Anyone (atau domain organisasi anda)
 * ============================================================
 */

var SPREADSHEET_ID = ''; // Biarkan kosong jika Apps Script dibound terus ke Google Sheet, atau letakkan ID Sheet

var APP_META = {
  name: 'KOMS — KEMAS Operative Management System',
  shortName: 'KOMS',
  themeColor: '#C5A059',
  backgroundColor: '#06101E'
};

var SHEETS = {
  CLASSES: 'Classes',
  STAFF: 'Staff',
  ASSIGNMENTS: 'StaffAssignments',
  ISSUES: 'ClassIssues',
  STATUS_BGN: 'StatusBgn',
  STATUS_TANAH: 'StatusTanah',
  JAWATAN: 'Jawatan',
  LANTIKAN: 'Lantikan',
  DIVISIONS: 'Divisions',
  CLASS_TYPES: 'ClassTypes'
};

function getSpreadsheet_() {
  if (SPREADSHEET_ID && String(SPREADSHEET_ID).indexOf('PASTE_') === -1 && String(SPREADSHEET_ID).length > 10) {
    try {
      return SpreadsheetApp.openById(String(SPREADSHEET_ID).trim());
    } catch (e) {
      throw new Error('SPREADSHEET_ID tidak sah atau tiada capaian: ' + e.message);
    }
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('Tiada spreadsheet. Sila buka melalui Extensions > Apps Script pada Google Sheet Class Management anda.');
}

function include(filename) {
  if (!filename) return '';
  var name = String(filename).replace(/\\.html$/i, '').trim();
  try {
    return HtmlService.createHtmlOutputFromFile(name).getContent();
  } catch (e) {
    return '<!-- include gagal: ' + name + ' -->';
  }
}

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  var raw = '';
  try {
    raw = template.evaluate().getContent();
  } catch (errTemplate) {
    raw = HtmlService.createHtmlOutputFromFile('Index').getContent();
  }

  // 1. Sertakan CSS
  try {
    raw = raw.replace('<!--KOMS_INCLUDE_CSS-->', include('css'));
  } catch (eCss) {
    raw = raw.replace('<!--KOMS_INCLUDE_CSS-->', '');
  }

  // 2. Suntik Data Awal KOMS dari Sheet (SSOT Bootstrap)
  var boot = getBootstrapData();
  var bootJson = JSON.stringify(boot).replace(/</g, '\\\\u003c');
  var bootTag = '<script>window.__KOMS_BOOTSTRAP__=' + bootJson + ';<\\\\/script>';
  if (/<body[^>]*>/i.test(raw)) {
    raw = raw.replace(/(<body[^>]*>)/i, '$1\\n' + bootTag);
  } else {
    raw = bootTag + raw;
  }

  // 3. Sertakan JavaScript
  try {
    raw = raw.replace('<!--KOMS_INCLUDE_JS-->', include('JavaScript'));
  } catch (eJs) {
    raw = raw.replace('<!--KOMS_INCLUDE_JS-->', '<script>console.error("JavaScript.html tidak dijumpai");</script>');
  }

  return HtmlService.createHtmlOutput(raw)
    .setTitle('KOMS — KEMAS Operative Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

function findSheet_(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  if (sh) return sh;
  var want = String(sheetName || '').toLowerCase().replace(/\\s+/g, '');
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().replace(/\\s+/g, '') === want) return sheets[i];
  }
  return null;
}

function sheetToObjects_(sheetName) {
  var ss = getSpreadsheet_();
  var sh = findSheet_(ss, sheetName);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h || '').trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var empty = true;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null) { empty = false; break; }
    }
    if (empty) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;
      var v = row[j];
      if (Object.prototype.toString.call(v) === '[object Date]') {
        v = Utilities.formatDate(v, Session.getScriptTimeZone() || 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
      }
      obj[headers[j]] = v;
    }
    rows.push(obj);
  }
  return rows;
}

function getBootstrapData() {
  try {
    var ss = getSpreadsheet_();
    return {
      ok: true,
      spreadsheetName: ss.getName(),
      classes: sheetToObjects_(SHEETS.CLASSES),
      staff: sheetToObjects_(SHEETS.STAFF),
      assignments: sheetToObjects_(SHEETS.ASSIGNMENTS),
      issues: sheetToObjects_(SHEETS.ISSUES),
      statusBgn: sheetToObjects_(SHEETS.STATUS_BGN),
      statusTanah: sheetToObjects_(SHEETS.STATUS_TANAH),
      jawatan: sheetToObjects_(SHEETS.JAWATAN),
      lantikan: sheetToObjects_(SHEETS.LANTIKAN),
      divisions: sheetToObjects_(SHEETS.DIVISIONS),
      classTypes: sheetToObjects_(SHEETS.CLASS_TYPES)
    };
  } catch (err) {
    return {
      ok: false,
      error: String(err.message || err),
      classes: [],
      staff: [],
      assignments: [],
      issues: []
    };
  }
}

// Operasi Penulisan / Simpan (Upsert)
function upsertClass(record) {
  return upsertByKey_(SHEETS.CLASSES, 'ClassID', record);
}

function upsertStaff(record) {
  return upsertByKey_(SHEETS.STAFF, 'StaffID', record);
}

function upsertAssignment(record) {
  if (!record.AssignmentID) {
    record.AssignmentID = 'ASN-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  }
  return upsertByKey_(SHEETS.ASSIGNMENTS, 'AssignmentID', record);
}

function upsertIssue(record) {
  if (!record.IssueID) {
    record.IssueID = 'ISS-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  }
  if (!record.DateReported) {
    record.DateReported = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
  }
  return upsertByKey_(SHEETS.ISSUES, 'IssueID', record);
}

function upsertByKey_(sheetName, keyHeader, record) {
  try {
    var ss = getSpreadsheet_();
    var sh = findSheet_(ss, sheetName);
    if (!sh) throw new Error('Tab ' + sheetName + ' tidak dijumpai dalam spreadsheet.');
    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
    var keyIdx = headers.indexOf(keyHeader);
    if (keyIdx < 0) throw new Error('Lajur utama ' + keyHeader + ' tidak dijumpai dalam ' + sheetName);
    
    var id = String(record[keyHeader]);
    var lastRow = sh.getLastRow();
    var rowToUse = lastRow + 1;
    
    if (lastRow >= 2) {
      var keys = sh.getRange(2, keyIdx + 1, lastRow - 1, 1).getValues();
      var nameIdx = headers.indexOf('ClassName');
      var names = nameIdx >= 0 ? sh.getRange(2, nameIdx + 1, lastRow - 1, 1).getValues() : null;
      
      for (var r = 0; r < keys.length; r++) {
        if (String(keys[r][0]) === id) {
          if (names && record.ClassName && String(names[r][0]) !== String(record.ClassName)) {
            continue;
          }
          rowToUse = r + 2;
          break;
        }
      }
    }
    
    var rowValues = headers.map(function (h) {
      return record.hasOwnProperty(h) ? record[h] : '';
    });
    sh.getRange(rowToUse, 1, 1, headers.length).setValues([rowValues]);
    return { ok: true, id: id, row: rowToUse };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}`;

  const indexHtmlSnippet = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>KOMS — AppOS Live Field Hub</title>
  <meta name="theme-color" content="#C5A059">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- FontAwesome, Leaflet & SheetJS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

  <!--KOMS_INCLUDE_CSS-->
</head>
<body class="theme-dark">
  <!-- Sila rujuk fail gas/Index.html yang lengkap untuk kandungan antaramuka -->
  <!--KOMS_INCLUDE_JS-->
</body>
</html>`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-3 sm:p-5"
      onClick={() => setShowGasCodeModal(false)}
    >
      <div
        className="appos-card relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-6"
        style={{ background: 'var(--bg-card)', borderTop: '3px solid var(--accent-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="badge-status badge-live font-mono text-[11px]">Google Apps Script</span>
            <h3 className="text-base font-extrabold text-white">
              Pakej 4 Fail GAS Tanpa Ralat (Zero Error)
            </h3>
          </div>
          <button
            onClick={() => setShowGasCodeModal(false)}
            className="text-gray-400 hover:text-white p-1 text-xl leading-none"
            aria-label="Tutup"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 mb-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn-action py-1 px-3 rounded-lg ${activeTab === 'audit' ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40' : ''}`}
          >
            <i className="fa-solid fa-clipboard-check"></i>
            <span>Ringkasan Semakan &amp; Baikan</span>
          </button>
          <button
            onClick={() => setActiveTab('codegs')}
            className={`btn-action py-1 px-3 rounded-lg ${activeTab === 'codegs' ? 'bg-blue-500/20 text-blue-300 font-bold border-blue-500/40' : ''}`}
          >
            <i className="fa-brands fa-google"></i>
            <span>Code.gs</span>
          </button>
          <button
            onClick={() => setActiveTab('index')}
            className={`btn-action py-1 px-3 rounded-lg ${activeTab === 'index' ? 'bg-blue-500/20 text-blue-300 font-bold border-blue-500/40' : ''}`}
          >
            <i className="fa-solid fa-file-code"></i>
            <span>Index.html</span>
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`btn-action py-1 px-3 rounded-lg ${activeTab === 'css' ? 'bg-blue-500/20 text-blue-300 font-bold border-blue-500/40' : ''}`}
          >
            <i className="fa-brands fa-css3-alt"></i>
            <span>css.html</span>
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`btn-action py-1 px-3 rounded-lg ${activeTab === 'js' ? 'bg-blue-500/20 text-blue-300 font-bold border-blue-500/40' : ''}`}
          >
            <i className="fa-brands fa-js"></i>
            <span>JavaScript.html</span>
          </button>
        </div>

        {/* Tab 1: Audit & Fixes */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-200">
              <b className="text-sm text-emerald-400 block mb-1">
                <i className="fa-solid fa-circle-check"></i> 4 Fail GAS Telah Disediakan &amp; Diselaraskan Bebas Ralat
              </b>
              Kesemua 4 fail (<code>Code.gs</code>, <code>Index.html</code>, <code>css.html</code>, dan <code>JavaScript.html</code>) telah dibersihkan sepenuhnya daripada ralat pertindihan skrip, data bootstrap wipeout, kekunci pendua, dan kegagalan penapis.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)] flex flex-col gap-1.5">
                <b className="text-white text-xs flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                  <i className="fa-solid fa-database text-emerald-400"></i> Fail 1: Code.gs
                </b>
                <p className="appos-text-muted leading-relaxed">
                  Skrip pelayan Apps Script yang lengkap untuk membaca 10 tab Google Sheet secara automatik, menyuntik data bootstrap JSON ke dalam antaramuka pengguna, dan menguruskan fungsi simpan/kemaskini (*upsert*) rekod.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setActiveTab('codegs')} className="btn-action text-xs py-1 px-2.5">Lihat Kod</button>
                  <button onClick={() => downloadFile('Code.gs', codeGsContent)} className="btn-action text-xs py-1 px-2.5 btn-gold"><i className="fa-solid fa-download"></i> Muat Turun</button>
                </div>
              </div>

              <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)] flex flex-col gap-1.5">
                <b className="text-white text-xs flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                  <i className="fa-solid fa-file-code text-blue-400"></i> Fail 2: Index.html
                </b>
                <p className="appos-text-muted leading-relaxed">
                  Rangka HTML utama merangkumi struktur modul Utama, Kelas, Staff, Penugasan, Isu Kerosakan, dan Peta GIS berserta dialog modal dossier, galeri 1080x720, dan menu drawer.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setActiveTab('index')} className="btn-action text-xs py-1 px-2.5">Lihat Kod</button>
                  <a href="/gas/Index.html" download="Index.html" className="btn-action text-xs py-1 px-2.5 btn-gold"><i className="fa-solid fa-download"></i> Muat Turun</a>
                </div>
              </div>

              <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)] flex flex-col gap-1.5">
                <b className="text-white text-xs flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                  <i className="fa-brands fa-css3-alt text-amber-400"></i> Fail 3: css.html
                </b>
                <p className="appos-text-muted leading-relaxed">
                  Fail gaya CSS terasing yang mengandungi pemboleh ubah 6 tema visual (Dark, Light, Emerald, Ocean, Rose, Midnight) serta gaya responsif desktop dan peranti mudah alih.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setActiveTab('css')} className="btn-action text-xs py-1 px-2.5">Lihat Kod</button>
                  <a href="/gas/css.html" download="css.html" className="btn-action text-xs py-1 px-2.5 btn-gold"><i className="fa-solid fa-download"></i> Muat Turun</a>
                </div>
              </div>

              <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)] flex flex-col gap-1.5">
                <b className="text-white text-xs flex items-center gap-1.5" style={{ color: 'var(--accent-color)' }}>
                  <i className="fa-brands fa-js text-yellow-400"></i> Fail 4: JavaScript.html
                </b>
                <p className="appos-text-muted leading-relaxed">
                  Skrip klien yang telah dibersihkan sepenuhnya: tiada pertindihan fungsi, pengurusan pangkalan data 266 premis kelas yang reaktif, pemetaan GIS Leaflet, dan alur kerja kerosakan berperingkat.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setActiveTab('js')} className="btn-action text-xs py-1 px-2.5">Lihat Kod</button>
                  <a href="/gas/JavaScript.html" download="JavaScript.html" className="btn-action text-xs py-1 px-2.5 btn-gold"><i className="fa-solid fa-download"></i> Muat Turun</a>
                </div>
              </div>
            </div>

            <div className="appos-card-subtle p-3.5 rounded-xl border border-[var(--border-color)] mt-1">
              <b className="text-white block mb-1">Langkah Mudah Pasang di Google Sheets:</b>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Buka Google Sheet <code>Class Management</code> anda.</li>
                <li>Klik <b>Extensions</b> &gt; <b>Apps Script</b>.</li>
                <li>Buat 1 fail skrip <code>Code.gs</code> dan 3 fail HTML: <code>Index.html</code>, <code>css.html</code>, dan <code>JavaScript.html</code>.</li>
                <li>Salin dan tampal kandungan setiap fail dari tab di atas.</li>
                <li>Klik <b>Deploy</b> &gt; <b>New deployment</b> &gt; pilih jenis <b>Web app</b> &gt; tetapkan <i>Execute as: Me</i> dan <i>Who has access: Anyone</i>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Code.gs */}
        {activeTab === 'codegs' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs appos-text-muted font-mono font-bold text-amber-400">Code.gs (Google Apps Script Server Script):</span>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile('Code.gs', codeGsContent)}
                  className="btn-action text-xs py-1 px-3 rounded-lg"
                >
                  <i className="fa-solid fa-download"></i> Muat Turun Code.gs
                </button>
                <button
                  onClick={() => copyToClipboard(codeGsContent)}
                  className="btn-action text-xs py-1 px-3 rounded-lg bg-blue-600/20 text-blue-300 border-blue-500/40"
                >
                  <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                  <span>{copySuccess ? 'Disalin!' : 'Salin Kod'}</span>
                </button>
              </div>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[55vh] border border-[var(--border-color)]">
              {codeGsContent}
            </pre>
          </div>
        )}

        {/* Tab 3: Index.html */}
        {activeTab === 'index' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs appos-text-muted font-mono font-bold text-blue-400">Index.html:</span>
              <div className="flex gap-2">
                <a
                  href="/gas/Index.html"
                  download="Index.html"
                  className="btn-action text-xs py-1 px-3 rounded-lg"
                >
                  <i className="fa-solid fa-download"></i> Muat Turun Index.html
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Fail <code>Index.html</code> lengkap telah disimpan di direktori projek anda (<code>/gas/Index.html</code>). Anda boleh memuat turun fail ini secara terus atau menyalinnya dari repositori.
            </p>
            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[55vh] border border-[var(--border-color)]">
              {indexHtmlSnippet}
            </pre>
          </div>
        )}

        {/* Tab 4: css.html */}
        {activeTab === 'css' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs appos-text-muted font-mono font-bold text-amber-400">css.html (Gaya &amp; 6 Tema Visual):</span>
              <div className="flex gap-2">
                <a
                  href="/gas/css.html"
                  download="css.html"
                  className="btn-action text-xs py-1 px-3 rounded-lg"
                >
                  <i className="fa-solid fa-download"></i> Muat Turun css.html
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Fail <code>css.html</code> lengkap (merangkumi tema Dark, Light, Emerald, Ocean, Rose, Midnight) telah sedia ada di <code>/gas/css.html</code>.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-[var(--border-color)]">
              &lt;style&gt;<br/>
              &nbsp;&nbsp;:root, body.theme-dark &#123; ... &#125;<br/>
              &nbsp;&nbsp;body.theme-light &#123; ... &#125;<br/>
              &nbsp;&nbsp;body.theme-emerald &#123; ... &#125;<br/>
              &nbsp;&nbsp;body.theme-ocean &#123; ... &#125;<br/>
              &nbsp;&nbsp;body.theme-rose &#123; ... &#125;<br/>
              &nbsp;&nbsp;body.theme-midnight &#123; ... &#125;<br/>
              &lt;/style&gt;
            </div>
          </div>
        )}

        {/* Tab 5: JavaScript.html */}
        {activeTab === 'js' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs appos-text-muted font-mono font-bold text-yellow-400">JavaScript.html (Skrip Klien Tanpa Ralat):</span>
              <div className="flex gap-2">
                <a
                  href="/gas/JavaScript.html"
                  download="JavaScript.html"
                  className="btn-action text-xs py-1 px-3 rounded-lg"
                >
                  <i className="fa-solid fa-download"></i> Muat Turun JavaScript.html
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Fail <code>JavaScript.html</code> telah dibaiki dan dioptimumkan sepenuhnya (tiada pemboleh ubah bertindih, tiada overwrite data) dan disimpan di <code>/gas/JavaScript.html</code>.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-[var(--border-color)]">
              &lt;script&gt;<br/>
              &nbsp;&nbsp;// Pangkalan Data Utama SSOT KOMS<br/>
              &nbsp;&nbsp;var CLASSES = [];<br/>
              &nbsp;&nbsp;var STAFF = [];<br/>
              &nbsp;&nbsp;var STAFF_ASSIGNMENTS = [];<br/>
              &nbsp;&nbsp;var CLASS_ISSUES = [];<br/>
              &nbsp;&nbsp;// Fungsi Dashboard, Kelas, Staf, Penugasan, Isu &amp; Peta GIS...<br/>
              &lt;/script&gt;
            </div>
          </div>
        )}

        {/* Bottom Close */}
        <div className="mt-5 pt-3.5 border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={() => setShowGasCodeModal(false)}
            className="btn-action text-xs py-2 px-5 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
