/**
 * The family's Google Sheet: the guest list, personal links, WhatsApp messages, and every RSVP.
 * Paste into Extensions → Apps Script, then follow apps-script/README.md.
 *
 * Script properties (Project settings → Script properties):
 *   SECRET          the same value as APPS_SCRIPT_SECRET on Cloudflare
 *   SITE_URL        e.g. https://shreyansh-mrunalini.in
 *   CF_ACCOUNT_ID   Cloudflare account id
 *   CF_NAMESPACE_ID the GUESTS KV namespace id
 *   CF_API_TOKEN    a token with only "Workers KV Storage: Edit"
 */
var EVENTS = ['haldi', 'sangeet', 'shaadi'];
var ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
var TABS = {
  guests: 'Guests',
  rsvp: 'RSVP',
  log: 'RSVP log',
  totals: 'Totals',
  templates: 'Templates'
};
var GUEST_COLS = ['code', 'family', 'family_dev', 'lang', 'side', 'inv_haldi', 'inv_sangeet', 'inv_shaadi', 'party', 'max', 'phone', 'sender', 'notes', 'link', 'message', 'send', 'sent_on', 'replied', 'test'];
var RSVP_COLS = ['code', 'family', 'side', 'haldi', 'sangeet', 'shaadi', 'name', 'note', 'at', 'rev', 'test'];
var LOG_COLS = ['received', 'code', 'family', 'haldi', 'sangeet', 'shaadi', 'name', 'note', 'at', 'rev', 'rid', 'test'];

function props() { return PropertiesService.getScriptProperties(); }

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Wedding')
    .addItem('Set up the tabs', 'setupSheet')
    .addItem('Generate missing codes', 'generateCodes')
    .addItem('Publish guest list', 'publishGuests')
    .addSeparator()
    .addItem('Clear test replies', 'clearTestReplies')
    .addToUi();
}

/* ---------- replies from the website ---------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var row = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!row.secret || row.secret !== props().getProperty('SECRET')) return out({ ok: false, error: 'secret' });
    if (!/^[23456789a-hjkmnp-z]{6}$/.test(String(row.code))) return out({ ok: false, error: 'code' });
    var ss = SpreadsheetApp.getActive();
    var n = row.n || {};
    var count = function (id) { return id in n ? Number(n[id]) : ''; };
    var test = row.test ? 'yes' : '';

    sheet(ss, TABS.log, LOG_COLS).appendRow([new Date(), row.code, row.family, count('haldi'), count('sangeet'), count('shaadi'), safe(row.name), safe(row.note), row.at, row.rev, row.rid, test]);

    /* the RSVP tab keeps one row per family: the latest reply wins, an older one arriving late is ignored */
    var rsvp = sheet(ss, TABS.rsvp, RSVP_COLS);
    var r = findRow(rsvp, 'code', row.code);
    var values = [row.code, row.family, row.side, count('haldi'), count('sangeet'), count('shaadi'), safe(row.name), safe(row.note), row.at, row.rev, test];
    if (!r) rsvp.appendRow(values);
    else if (Number(rsvp.getRange(r, RSVP_COLS.indexOf('rev') + 1).getValue()) < Number(row.rev)) rsvp.getRange(r, 1, 1, values.length).setValues([values]);

    var guests = ss.getSheetByName(TABS.guests);
    if (guests) {
      var g = findRow(guests, 'code', row.code);
      if (g) guests.getRange(g, colOf(guests, 'replied')).setValue(row.at);
    }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
/* a reply can't start a formula in the Sheet */
function safe(s) { s = String(s || ''); return /^[=+\-@]/.test(s) ? "'" + s : s; }

/* ---------- menu: set up, codes, publish, clean up ---------- */

function setupSheet() {
  var ss = SpreadsheetApp.getActive();
  var t = sheet(ss, TABS.templates, ['lang', 'message']);
  if (t.getLastRow() < 2) {
    t.getRange(2, 1, 3, 2).setValues([
      ['en', 'Namaste! With love, the families of Shreyansh & Mrunalini invite {family} to their wedding in Ranchi, 8 & 9 December 2026. Your invitation: {link}'],
      ['hi', 'सादर प्रणाम! श्रेयांश और मृणालिनी के शुभ विवाह में आप सपरिवार सादर आमंत्रित हैं। आपका निमंत्रण: {link}'],
      ['mr', 'सप्रेम नमस्कार! श्रेयांश आणि मृणालिनी यांच्या शुभविवाहाचे आग्रहाचे निमंत्रण: {link}']
    ]);
  }
  var g = sheet(ss, TABS.guests, GUEST_COLS);
  var site = (props().getProperty('SITE_URL') || 'https://example.pages.dev').replace(/\/$/, '');
  /* link, message and send are formulas, filled down for 600 rows */
  var col = function (name) { return columnLetter(GUEST_COLS.indexOf(name) + 1); };
  var rows = 600, f = [];
  for (var i = 2; i <= rows + 1; i++) {
    var code = col('code') + i;
    f.push([
      '=IF(' + code + '="","","' + site + '/?g="&' + code + ')',
      '=IF(' + code + '="","",SUBSTITUTE(SUBSTITUTE(IFERROR(VLOOKUP(' + col('lang') + i + ',Templates!A:B,2,FALSE),VLOOKUP("en",Templates!A:B,2,FALSE)),"{family}",' + col('family') + i + '),"{link}",' + col('link') + i + '))',
      '=IF(OR(' + code + '="",' + col('phone') + i + '=""),"",HYPERLINK("https://wa.me/"&REGEXREPLACE(TO_TEXT(' + col('phone') + i + '),"\\D","")&"?text="&ENCODEURL(' + col('message') + i + '),"Send ↗"))'
    ]);
  }
  g.getRange(2, GUEST_COLS.indexOf('link') + 1, rows, 3).setFormulas(f);
  g.setFrozenRows(1);
  sheet(ss, TABS.rsvp, RSVP_COLS).setFrozenRows(1);
  sheet(ss, TABS.log, LOG_COLS).setFrozenRows(1);
  var tot = sheet(ss, TABS.totals, ['event', 'guests coming', 'families replied', 'families invited']);
  tot.getRange(2, 1, 3, 4).setFormulas(EVENTS.map(function (id) {
    var c = columnLetter(RSVP_COLS.indexOf(id) + 1), inv = columnLetter(GUEST_COLS.indexOf('inv_' + id) + 1);
    return ['="' + id.charAt(0).toUpperCase() + id.slice(1) + '"', '=SUMIFS(RSVP!' + c + ':' + c + ',RSVP!K:K,"<>yes")', '=COUNTIFS(RSVP!' + c + ':' + c + ',">=0",RSVP!K:K,"<>yes")', '=COUNTIFS(Guests!' + inv + ':' + inv + ',TRUE,Guests!S:S,"<>yes")'];
  }));
  SpreadsheetApp.getUi().alert('Tabs are ready. Fill in Guests (one row per family), then Wedding → Generate missing codes.');
}

function generateCodes() {
  var g = SpreadsheetApp.getActive().getSheetByName(TABS.guests);
  var data = g.getDataRange().getValues(), head = data[0];
  var ci = head.indexOf('code'), fi = head.indexOf('family');
  var used = {}, made = 0;
  data.slice(1).forEach(function (r) { if (r[ci]) used[String(r[ci]).toLowerCase()] = true; });
  for (var i = 1; i < data.length; i++) {
    if (data[i][fi] && !data[i][ci]) {
      var c;
      do { c = ''; for (var k = 0; k < 6; k++) c += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)); } while (used[c]);
      used[c] = true;
      g.getRange(i + 1, ci + 1).setValue(c);
      made++;
    }
  }
  SpreadsheetApp.getUi().alert(made + ' new codes. Codes already sent never change.');
}

function guestList() {
  var g = SpreadsheetApp.getActive().getSheetByName(TABS.guests);
  var data = g.getDataRange().getValues(), head = data[0];
  var at = function (r, name) { return r[head.indexOf(name)]; };
  var list = {}, problems = [];
  data.slice(1).forEach(function (r, i) {
    var code = String(at(r, 'code') || '').trim().toLowerCase();
    if (!code || !at(r, 'family')) return;
    var ev = EVENTS.filter(function (id) { var v = at(r, 'inv_' + id); return v === true || /^(yes|y|true|1)$/i.test(String(v)); });
    if (!ev.length) problems.push('Row ' + (i + 2) + ' (' + at(r, 'family') + ') is not invited to any event.');
    var lang = String(at(r, 'lang') || 'en').toLowerCase();
    list[code] = {
      label: String(at(r, 'family')).trim(),
      label_dev: String(at(r, 'family_dev') || '').trim() || undefined,
      lang: lang === 'mr' || lang === 'hi' ? lang : 'en',
      side: String(at(r, 'side')).toLowerCase() === 'bride' ? 'bride' : 'groom',
      ev: ev,
      party: Number(at(r, 'party')) || 1,
      max: Number(at(r, 'max')) || undefined,
      test: /^(yes|y|true|1)$/i.test(String(at(r, 'test') || ''))
    };
  });
  return { list: list, problems: problems };
}

function kv(method, key, body) {
  var p = props();
  var url = 'https://api.cloudflare.com/client/v4/accounts/' + p.getProperty('CF_ACCOUNT_ID') + '/storage/kv/namespaces/' + p.getProperty('CF_NAMESPACE_ID') + '/values/' + encodeURIComponent(key);
  var res = UrlFetchApp.fetch(url, { method: method, contentType: 'text/plain', payload: body, headers: { Authorization: 'Bearer ' + p.getProperty('CF_API_TOKEN') }, muteHttpExceptions: true });
  return { ok: res.getResponseCode() < 300, text: res.getContentText() };
}

function publishGuests() {
  var ui = SpreadsheetApp.getUi();
  var g = guestList();
  if (g.problems.length) { ui.alert('Fix these first:\n\n' + g.problems.join('\n')); return; }
  var n = Object.keys(g.list).length;
  var res = kv('put', 'guests', JSON.stringify(g.list));
  ui.alert(res.ok ? 'Published ' + n + ' families. Links work within a minute.' : 'Publishing failed:\n' + res.text);
}

function clearTestReplies() {
  var ss = SpreadsheetApp.getActive();
  [TABS.rsvp, TABS.log].forEach(function (name) {
    var s = ss.getSheetByName(name);
    if (!s) return;
    var data = s.getDataRange().getValues(), ti = data[0].indexOf('test'), ci = data[0].indexOf('code');
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][ti] === 'yes') {
        if (name === TABS.rsvp) kv('delete', 'r:' + data[i][ci]);
        s.deleteRow(i + 1);
      }
    }
  });
  SpreadsheetApp.getUi().alert('Test replies cleared.');
}

/* ---------- helpers ---------- */

function sheet(ss, name, cols) {
  var s = ss.getSheetByName(name) || ss.insertSheet(name);
  if (s.getLastRow() === 0) s.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
  return s;
}
function colOf(s, name) { return s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].indexOf(name) + 1; }
function findRow(s, name, value) {
  var c = colOf(s, name);
  if (!c || s.getLastRow() < 2) return 0;
  var vals = s.getRange(2, c, s.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === String(value)) return i + 2;
  return 0;
}
function columnLetter(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
