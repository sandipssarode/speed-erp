import { getDb, setCors, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  try {
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM customers ORDER BY created_at ASC`;
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const c = req.body;
      await sql`
        INSERT INTO customers (id, code, name, is_deactivated, data, created_at, updated_at)
        VALUES (${c.id}, ${c.code}, ${c.name}, ${c.isDeactivated||false}, ${JSON.stringify(c)}, ${c.createdAt}, ${c.updatedAt})
        ON CONFLICT (code) DO UPDATE SET name=${c.name}, is_deactivated=${c.isDeactivated||false}, data=${JSON.stringify(c)}, updated_at=${c.updatedAt}`;
      return res.status(201).json(c);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
