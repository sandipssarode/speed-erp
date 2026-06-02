import { getDb, setCors, ensureSchema } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM warehouses WHERE id=${id}`;
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0].data);
    }
    if (req.method === 'PUT') {
      const w = req.body;
      await sql`UPDATE warehouses SET code=${w.warehouseCode || null}, name=${w.warehouseName}, company_name=${w.companyName || null}, state=${w.state || null}, is_active=${w.isActive !== false}, data=${JSON.stringify(w)}, updated_at=${w.updatedAt} WHERE id=${id}`;
      return res.json(w);
    }
    if (req.method === 'DELETE') {
      await sql`DELETE FROM warehouses WHERE id=${id}`;
      return res.json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
