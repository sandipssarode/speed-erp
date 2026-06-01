const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try { msg = JSON.parse(text).error || text; } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  get:  (path)       => fetch(path).then(handleResponse),
  post: (path, body) => fetch(path, { method: 'POST',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse),
  put:  (path, body) => fetch(path, { method: 'PUT',    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse),
  del:  (path)       => fetch(path, { method: 'DELETE' }).then(handleResponse),
};
