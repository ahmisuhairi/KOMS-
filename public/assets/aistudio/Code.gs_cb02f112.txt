/**
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
  var name = String(filename).replace(/\.html$/i, '').trim();
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
  var bootJson = JSON.stringify(boot).replace(/</g, '\\u003c');
  var bootTag = '<script>window.__KOMS_BOOTSTRAP__=' + bootJson + ';<\\/script>';
  if (/<body[^>]*>/i.test(raw)) {
    raw = raw.replace(/(<body[^>]*>)/i, '$1\n' + bootTag);
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
  var want = String(sheetName || '').toLowerCase().replace(/\s+/g, '');
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().replace(/\s+/g, '') === want) return sheets[i];
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
      // Bagi classes yang mempunyai ClassID sama bagi sesi berbeza, padankan ClassName juga
      var nameIdx = headers.indexOf('ClassName');
      var names = nameIdx >= 0 ? sh.getRange(2, nameIdx + 1, lastRow - 1, 1).getValues() : null;
      
      for (var r = 0; r < keys.length; r++) {
        if (String(keys[r][0]) === id) {
          if (names && record.ClassName && String(names[r][0]) !== String(record.ClassName)) {
            continue; // sesi/nama berbeza
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
}
