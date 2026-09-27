// Stands in for the Apps Script web app in local tests: records what the edge forwards, and can be told to fail.
//   node tests/mock-sheet.mjs [port]      GET /log · POST /fail?on=1|0 · POST /reset
import { createServer } from 'node:http';

const port = Number(process.argv[2] || process.env.MOCK_SHEET_PORT || 8799);
let rows = [], fail = false;
createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const send = (status, obj) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (req.method === 'GET' && url.pathname === '/log') return send(200, rows);
    if (req.method === 'POST' && url.pathname === '/fail') { fail = url.searchParams.get('on') === '1'; return send(200, { fail }); }
    if (req.method === 'POST' && url.pathname === '/reset') { rows = []; fail = false; return send(200, { ok: true }); }
    if (req.method === 'POST' && url.pathname === '/exec') {
      if (fail) return send(500, { ok: false });
      try {
        const row = JSON.parse(body);
        if (row.secret !== (process.env.APPS_SCRIPT_SECRET || 'local-test-secret')) return send(200, { ok: false, error: 'secret' });
        rows.push(row);
        return send(200, { ok: true });
      } catch { return send(200, { ok: false, error: 'json' }); }
    }
    send(404, { ok: false });
  });
}).listen(port, () => console.log('mock sheet on http://127.0.0.1:' + port));
