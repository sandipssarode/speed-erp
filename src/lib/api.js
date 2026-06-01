const cache = new Map();   // path -> { data, expires }
const inFlight = new Map(); // path -> Promise  (deduplicates concurrent identical GETs)

const CACHE_TTL = 30_000; // 30 seconds

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try { msg = JSON.parse(text).error || text; } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
};

function cachedGet(path) {
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && hit.expires > now) return Promise.resolve(hit.data);

  if (inFlight.has(path)) return inFlight.get(path);

  const req = fetch(path)
    .then(handleResponse)
    .then(data => {
      cache.set(path, { data, expires: Date.now() + CACHE_TTL });
      inFlight.delete(path);
      return data;
    })
    .catch(err => {
      inFlight.delete(path);
      throw err;
    });

  inFlight.set(path, req);
  return req;
}

// Invalidate cached collection when a mutation happens on that resource
function invalidatePath(path) {
  cache.delete(path);
  const parts = path.split('/');
  if (parts.length > 3) cache.delete(parts.slice(0, -1).join('/'));
}

export const api = {
  get:  (path)       => cachedGet(path),
  post: (path, body) => fetch(path, { method: 'POST',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse).then(data => { invalidatePath(path); return data; }),
  put:  (path, body) => fetch(path, { method: 'PUT',    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse).then(data => { invalidatePath(path); return data; }),
  del:  (path)       => fetch(path, { method: 'DELETE' }).then(handleResponse).then(data => { invalidatePath(path); return data; }),
};
