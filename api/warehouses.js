import { getDb, setCors, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  try {
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM warehouses ORDER BY created_at ASC`;
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const w = req.body;
      await sql`
        INSERT INTO warehouses (id, code, name, company_name, state, is_active, data, created_at, updated_at)
        VALUES (${w.id}, ${w.warehouseCode || null}, ${w.warehouseName}, ${w.companyName || null}, ${w.state || null}, ${w.isActive !== false}, ${JSON.stringify(w)}, ${w.createdAt}, ${w.updatedAt})`;
      return res.status(201).json(w);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
