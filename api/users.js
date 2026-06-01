import { getDb, setCors, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  try {
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM users ORDER BY created_at ASC`;
      // Never send password to frontend
      return res.json(rows.map(r => { const d = r.data; delete d.password; return d; }));
    }
    if (req.method === 'POST') {
      const u = req.body;
      await sql`
        INSERT INTO users (id, code, name, email, password, role, department, is_active, data, created_at, updated_at)
        VALUES (${u.id}, ${u.code}, ${u.name}, ${u.email}, ${u.password||''}, ${u.role||'User'}, ${u.department||null}, ${u.isActive!==false}, ${JSON.stringify(u)}, ${u.createdAt}, ${u.updatedAt})
        ON CONFLICT (email) DO UPDATE SET name=${u.name}, role=${u.role||'User'}, department=${u.department||null}, is_active=${u.isActive!==false}, data=${JSON.stringify(u)}, updated_at=${u.updatedAt}`;
      const safe = { ...u }; delete safe.password;
      return res.status(201).json(safe);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
