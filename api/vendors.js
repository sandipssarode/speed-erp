import { getDb, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM vendors ORDER BY created_at ASC`;
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const v = req.body;
      await sql`
        INSERT INTO vendors (id, code, name, is_deactivated, data, created_at, updated_at)
        VALUES (${v.id}, ${v.code}, ${v.name}, ${v.isDeactivated || false}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})
        ON CONFLICT (code) DO UPDATE SET name=${v.name}, is_deactivated=${v.isDeactivated||false}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt}`;
      return res.status(201).json(v);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
