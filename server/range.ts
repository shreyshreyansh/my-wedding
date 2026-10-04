// The music, in pieces. Safari (and so every browser on an iPhone) plays audio only from a server that answers byte
// ranges: it asks for bytes=0-1 first and gives up on a plain 200. Workers static assets always send the whole file,
// so the Worker slices it. It is under 1 MB, so the whole file in memory is fine.
export async function ranged(req: Request, res: Response): Promise<Response> {
  /* anything but a whole file (a 304, a 404, or a 206 if the assets service ever answers ranges itself) goes as it is */
  if (res.status !== 200) return res;
  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  const range = req.headers.get('range');
  if (req.method === 'HEAD' || !range) return new Response(res.body, { status: 200, headers });
  /* one range only (bytes=a-b, bytes=a-, bytes=-n); anything else gets the whole file, as RFC 9110 allows */
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  const body = await res.arrayBuffer(), size = body.byteLength;
  if (!m || (m[1] === '' && m[2] === '')) return new Response(body, { status: 200, headers });
  const [start, end] = m[1] === '' ? [Math.max(0, size - Number(m[2])), size - 1] : [Number(m[1]), m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1)];
  if ((m[1] === '' && Number(m[2]) === 0) || start >= size || start > end) {
    headers.set('Content-Range', 'bytes */' + size);
    headers.delete('Content-Length');
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
}
